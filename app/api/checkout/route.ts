import { NextResponse } from "next/server";
import { computeTotals, InvalidCartError, priceCart, type PaymentMethod } from "@/lib/pricing";
import {
  createOrder,
  setProviderPaymentId,
  transitionOrderStatus,
  type CustomerData,
} from "@/lib/orders";
import { sendOrderEmails } from "@/lib/order-emails";
import { getPaymentProvider, PaymentNotConfiguredError } from "@/lib/payments";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;

const CUSTOMER_FIELDS: (keyof CustomerData)[] = [
  "nombre",
  "apellido",
  "email",
  "telefono",
  "direccion",
  "ciudad",
  "codigoPostal",
];

function parseCustomer(raw: unknown): CustomerData | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const customer = {} as CustomerData;

  for (const field of CUSTOMER_FIELDS) {
    const value = typeof source[field] === "string" ? (source[field] as string).trim() : "";
    if (!value || value.length > MAX_FIELD_LENGTH) return null;
    customer[field] = value;
  }
  return EMAIL_REGEX.test(customer.email) ? customer : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = parseCustomer(body?.formData);
    const method: PaymentMethod | null =
      body?.formData?.metodoPago === "transferencia" || body?.formData?.metodoPago === "naranjax"
        ? body.formData.metodoPago
        : null;

    if (!customer || !method) {
      return NextResponse.json({ error: "Completá todos los datos del formulario." }, { status: 400 });
    }

    // Los precios y totales se calculan SIEMPRE en el servidor con el catálogo.
    const lines = priceCart(body?.items);
    const totals = computeTotals(lines, method);
    const order = await createOrder({ customer, method, lines, totals });

    if (method === "transferencia") {
      await sendOrderEmails(order);
      return NextResponse.json({ success: true, orderNumber: order.order_number });
    }

    // Pago online: se crea el cobro en Naranja X y se redirige al cliente.
    // Los mails salen recién cuando el webhook confirma el pago.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderRef = String(order.order_number);

    try {
      const payment = await getPaymentProvider().createPayment({
        orderId: orderRef,
        items: lines.map((l) => ({
          id: l.productId,
          title: `${l.name} (Talle ${l.size})`,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
        })),
        total: totals.total,
        backUrls: {
          success: `${baseUrl}/seguimiento?status=success&order=${orderRef}`,
          failure: `${baseUrl}/seguimiento?status=failure&order=${orderRef}`,
          pending: `${baseUrl}/seguimiento?status=pending&order=${orderRef}`,
        },
        notificationUrl: `${baseUrl}/api/checkout/webhook/naranja-x`,
      });

      if (payment.providerPaymentId) {
        await setProviderPaymentId(order.order_number, payment.providerPaymentId);
      }
      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
        redirect_url: payment.redirectUrl,
      });
    } catch (error) {
      // No se pudo iniciar el cobro: el pedido no debe quedar colgado como pendiente.
      await transitionOrderStatus(order.order_number, ["pending_payment"], "cancelled");
      throw error;
    }
  } catch (error) {
    if (error instanceof InvalidCartError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof PaymentNotConfiguredError) {
      console.error("Pasarela sin configurar:", error.message);
      return NextResponse.json(
        { error: "El pago online todavía no está disponible. Elegí transferencia o escribinos por WhatsApp." },
        { status: 503 }
      );
    }
    console.error("Error procesando el pedido:", error);
    return NextResponse.json(
      { error: "Error al procesar el pedido. Por favor intentá nuevamente." },
      { status: 500 }
    );
  }
}

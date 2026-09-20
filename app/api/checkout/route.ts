import { NextResponse } from "next/server";
import { computeTotals, InvalidCartError, priceCart, type PaymentMethod } from "@/lib/pricing";
import {
  createOrder,
  setProviderPaymentId,
  orderStockLines,
  transitionOrderStatus,
  type CustomerData,
} from "@/lib/orders";
import { sendOrderEmails } from "@/lib/order-emails";
import { ONLINE_PAYMENT_ENABLED } from "@/lib/payment-config";
import { allowRequest, clientIp, TOO_MANY_REQUESTS } from "@/lib/rate-limit";
import { OutOfStockError, releaseStock, reserveStock, type StockLine } from "@/lib/stock";
import { sendLowStockEmail } from "@/lib/order-emails";
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
  // 15 pedidos por hora por dirección IP
  if (!(await allowRequest(`checkout:${clientIp(request)}`, 15, 3600))) {
    return NextResponse.json(TOO_MANY_REQUESTS, { status: 429 });
  }

  try {
    const body = await request.json();
    const customer = parseCustomer(body?.formData);
    const method: PaymentMethod | null =
      body?.formData?.metodoPago === "transferencia" || body?.formData?.metodoPago === "naranjax"
        ? body.formData.metodoPago
        : null;

    if (method === "naranjax" && !ONLINE_PAYMENT_ENABLED) {
      return NextResponse.json({ error: "Por ahora aceptamos solo transferencia bancaria." }, { status: 400 });
    }

    if (!customer || !method) {
      return NextResponse.json({ error: "Completá todos los datos del formulario." }, { status: 400 });
    }

    // Los precios y totales se calculan SIEMPRE en el servidor con el catálogo.
    const lines = await priceCart(body?.items);
    const totals = computeTotals(lines, method);

    // Se descuenta el stock ANTES de crear el pedido; si algo falla después, se devuelve.
    const stockLines: StockLine[] = lines.map((l) => ({ productId: l.productId, name: l.name, size: l.size, quantity: l.quantity }));
    const lowStock = await reserveStock(stockLines);

    let order;
    try {
      order = await createOrder({ customer, method, lines, totals });
    } catch (error) {
      await releaseStock(stockLines);
      throw error;
    }

    // Aviso al admin si a algún talle le quedan pocas unidades (no frena la compra si falla)
    const lowAlerts = lowStock.filter((a) => a.remaining <= 2);
    if (lowAlerts.length > 0) {
      sendLowStockEmail(lowAlerts).catch((error) => console.error("No se pudo enviar el aviso de stock bajo:", error));
    }

    if (method === "transferencia") {
      await sendOrderEmails(order);
      return NextResponse.json({ success: true, orderNumber: order.order_number, total: order.total });
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
      if (await transitionOrderStatus(order.order_number, ["pending_payment"], "cancelled")) {
        await releaseStock(orderStockLines(order));
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof OutOfStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
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

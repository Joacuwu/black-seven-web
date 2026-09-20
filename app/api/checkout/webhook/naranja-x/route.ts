import { NextResponse } from "next/server";
import { getPaymentProvider, PaymentNotConfiguredError } from "@/lib/payments";
import { getOrderByNumber, transitionOrderStatus } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/order-emails";

// Naranja X avisa acá cuando cambia el estado de un pago.
export async function POST(request: Request) {
  try {
    const event = await getPaymentProvider().parseWebhook(request);
    const orderNumber = Number(event.orderId);

    if (event.status === "approved") {
      // Solo la primera notificación cambia el estado y dispara los mails (idempotente).
      const changed = await transitionOrderStatus(orderNumber, ["pending_payment"], "paid", {
        provider_payment_id: event.providerPaymentId,
      });
      if (changed) {
        const order = await getOrderByNumber(orderNumber);
        if (order) await sendOrderEmails(order);
      }
    } else if (event.status === "rejected") {
      await transitionOrderStatus(orderNumber, ["pending_payment"], "cancelled");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof PaymentNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 501 });
    }
    console.error("Error procesando webhook:", error);
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }
}

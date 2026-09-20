import { Resend } from "resend";
import type { OrderRow } from "@/lib/orders";
import { BANK_DETAILS, proofWhatsAppUrl } from "@/lib/payment-config";

const FROM = "BLACK SEVEN <noreply@resend.dev>";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const money = (value: number) => `$${value.toLocaleString("es-AR")}`;

const PAYMENT_LABEL = {
  transferencia: "Transferencia Bancaria (-10%)",
  naranjax: "Naranja X",
} as const;

/** Envía el mail al admin y la confirmación al cliente. */
export async function sendOrderEmails(order: OrderRow) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemsList = order.order_items
    .map(
      (item) =>
        `<li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>${escapeHtml(item.name)}</strong> - Talle: ${escapeHtml(item.size)} - Cantidad: ${item.quantity} - ${money(item.unit_price)}</li>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: [process.env.ADMIN_EMAIL || "admin@blackseven.com"],
    subject: `🚨 NUEVO PEDIDO #${order.order_number} - BLACK SEVEN`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #dc2626; text-align: center; margin-bottom: 30px;">¡Nuevo Pedido Recibido!</h1>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong>📌 Nº de Orden:</strong> #${order.order_number}</p>
            <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${escapeHtml(order.customer_name)} ${escapeHtml(order.customer_lastname)}</p>
            <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${escapeHtml(order.customer_email)}</p>
            <p style="margin: 8px 0;"><strong>📱 Teléfono:</strong> ${escapeHtml(order.customer_phone)}</p>
            <p style="margin: 8px 0;"><strong>📍 Dirección:</strong> ${escapeHtml(order.shipping_address)}, ${escapeHtml(order.shipping_city)} (CP: ${escapeHtml(order.shipping_zip)})</p>
            <p style="margin: 8px 0;"><strong>💳 Método de Pago:</strong> ${PAYMENT_LABEL[order.payment_method]}</p>
          </div>
          <h2 style="color: #1f2937; border-bottom: 3px solid #dc2626; padding-bottom: 10px; margin-top: 30px;">Productos:</h2>
          <ul style="list-style: none; padding: 0; margin: 15px 0;">${itemsList}</ul>
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 5px; margin: 30px 0; text-align: center;">
            <h3 style="color: #dc2626; margin: 0; font-size: 24px;">Total a cobrar: ${money(order.total)}</h3>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
            Este es un email automático. Por favor no respondas a este correo.
          </p>
        </div>
      </div>
    `,
  });

  const isTransfer = order.payment_method === "transferencia";

  await resend.emails.send({
    from: FROM,
    to: [order.customer_email],
    replyTo: process.env.ADMIN_EMAIL || undefined,
    subject: `✅ Recibimos tu Pedido #${order.order_number} - BLACK SEVEN`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #dc2626; text-align: center; margin-bottom: 20px;">¡Gracias por tu pedido, ${escapeHtml(order.customer_name)}!</h1>
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            ${
              isTransfer
                ? "Recibimos tu pedido y lo reservamos hasta que hagas la transferencia. Cuando recibamos el comprobante, lo confirmamos y coordinamos el envío."
                : "Recibimos tu pedido correctamente. Nos pondremos en contacto a la brevedad para coordinar el envío."
            }
          </p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 8px 0;"><strong>📌 Nº de Orden:</strong> #${order.order_number}</p>
            <p style="margin: 8px 0;"><strong>💰 Total:</strong> ${money(order.total)}</p>
          </div>
          ${
            isTransfer
              ? `<div style="background-color: #fef3c7; padding: 18px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                   <p style="margin: 0 0 10px 0;"><strong>Para confirmar tu pedido, transferí ${money(order.total)}:</strong></p>
                   <p style="margin: 6px 0;"><strong>Alias:</strong> ${escapeHtml(BANK_DETAILS.alias)}</p>
                   <p style="margin: 6px 0;"><strong>CBU / CVU:</strong> ${escapeHtml(BANK_DETAILS.cbu)}</p>
                   ${BANK_DETAILS.holder ? `<p style="margin: 6px 0;"><strong>Titular:</strong> ${escapeHtml(BANK_DETAILS.holder)}</p>` : ""}
                   <p style="margin: 12px 0 0 0; font-size: 13px;">Poné <strong>#${order.order_number}</strong> en el concepto si podés, y mandanos el comprobante por WhatsApp o respondiendo este mail.</p>
                   <p style="text-align: center; margin: 16px 0 0 0;"><a href="${proofWhatsAppUrl(order.order_number)}" style="background-color: #16a34a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Enviar comprobante por WhatsApp</a></p>
                 </div>`
              : ""
          }
          <p style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/seguimiento?order=${order.order_number}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ver el estado de mi pedido</a>
          </p>
          <p style="color: #6b7280; font-size: 12px; text-align: center;">Vas a necesitar tu Nº de orden y este email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; text-align: center; font-size: 12px;">
            <strong>BLACK SEVEN TEAM</strong><br/>
            Seguinos en nuestras redes sociales para nuevas colecciones
          </p>
        </div>
      </div>
    `,
  });
}

/** Avisa al cliente que su pedido salió, con el código de seguimiento si hay uno. */
export async function sendShippedEmail(order: OrderRow) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const trackingBlock = order.tracking_code
    ? `<div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
         <p style="margin: 0;"><strong>📦 Código de seguimiento:</strong> ${escapeHtml(order.tracking_code)}</p>
       </div>`
    : "";

  await resend.emails.send({
    from: FROM,
    to: [order.customer_email],
    subject: `📦 Tu Pedido #${order.order_number} ya está en camino - BLACK SEVEN`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #dc2626; text-align: center; margin-bottom: 20px;">¡Tu pedido está en camino, ${escapeHtml(order.customer_name)}!</h1>
          <p style="color: #374151; line-height: 1.6;">
            Despachamos tu pedido <strong>#${order.order_number}</strong> a ${escapeHtml(order.shipping_address)}, ${escapeHtml(order.shipping_city)}.
          </p>
          ${trackingBlock}
          <p style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/seguimiento?order=${order.order_number}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Ver el estado de mi pedido</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; text-align: center; font-size: 12px;">
            <strong>BLACK SEVEN TEAM</strong>
          </p>
        </div>
      </div>
    `,
  });
}

/** Avisa al admin que a un talle le quedan pocas unidades después de una venta. */
export async function sendLowStockEmail(alerts: { name: string; size: string; remaining: number }[]) {
  if (alerts.length === 0) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const rows = alerts
    .map((a) => `<li style="padding: 6px 0;"><strong>${escapeHtml(a.name)}</strong> · talle ${escapeHtml(a.size)}: ${a.remaining === 0 ? "<strong style=\"color:#dc2626\">AGOTADO</strong>" : `quedan ${a.remaining}`}</li>`)
    .join("");

  await resend.emails.send({
    from: FROM,
    to: [process.env.ADMIN_EMAIL || "admin@blackseven.com"],
    subject: "⚠️ Stock bajo - BLACK SEVEN",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #dc2626; text-align: center; margin-bottom: 20px;">Poco stock</h1>
          <p style="color: #374151;">Después de la última venta, estos talles están por agotarse:</p>
          <ul style="list-style: none; padding: 0;">${rows}</ul>
          <p style="color: #6b7280; font-size: 12px;">Podés actualizar las cantidades desde el panel, en Productos.</p>
        </div>
      </div>
    `,
  });
}

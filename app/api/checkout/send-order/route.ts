import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  id: number;
  name: string;
  price: string;
  size: string;
  img: string;
  quantity?: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formData, cart, orderNumber, finalTotal } = body;

    // Validar datos
    if (!formData || !cart || !orderNumber || !finalTotal) {
      return NextResponse.json(
        { error: "Faltan datos necesarios" },
        { status: 400 }
      );
    }

    const itemsList = cart
      .map(
        (item: OrderItem) =>
          `<li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;"><strong>${item.name}</strong> - Talle: ${item.size} - Cantidad: ${item.quantity || 1} - ${item.price}</li>`
      )
      .join("");

    // EMAIL PARA ADMIN
    await resend.emails.send({
      from: "BLACK SEVEN <noreply@resend.dev>",
      to: [process.env.ADMIN_EMAIL || "admin@blackseven.com"],
      subject: `🚨 NUEVO PEDIDO #${orderNumber} - BLACK SEVEN`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #dc2626; text-align: center; margin-bottom: 30px;">¡Nuevo Pedido Recibido!</h1>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 8px 0;"><strong>📌 Nº de Orden:</strong> #${orderNumber}</p>
              <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${formData.nombre} ${formData.apellido}</p>
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${formData.email}</p>
              <p style="margin: 8px 0;"><strong>📱 Teléfono:</strong> ${formData.telefono}</p>
              <p style="margin: 8px 0;"><strong>📍 Dirección:</strong> ${formData.direccion}, ${formData.ciudad} (CP: ${formData.codigoPostal})</p>
              <p style="margin: 8px 0;"><strong>💳 Método de Pago:</strong> ${formData.metodoPago === "transferencia" ? "Transferencia Bancaria (-10%)" : "Mercado Pago"}</p>
            </div>

            <h2 style="color: #1f2937; border-bottom: 3px solid #dc2626; padding-bottom: 10px; margin-top: 30px;">Productos:</h2>
            <ul style="list-style: none; padding: 0; margin: 15px 0;">
              ${itemsList}
            </ul>

            <div style="background-color: #fee2e2; padding: 20px; border-radius: 5px; margin: 30px 0; text-align: center;">
              <h3 style="color: #dc2626; margin: 0; font-size: 24px;">Total a cobrar: $${finalTotal.toLocaleString("es-AR")}</h3>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              Este es un email automático. Por favor no respondas a este correo.
            </p>
          </div>
        </div>
      `,
    });

    // EMAIL PARA CLIENTE
    await resend.emails.send({
      from: "BLACK SEVEN <noreply@resend.dev>",
      to: [formData.email],
      subject: `✅ Confirmación de tu Pedido #${orderNumber} - BLACK SEVEN`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #dc2626; text-align: center; margin-bottom: 20px;">¡Gracias por tu compra, ${formData.nombre}!</h1>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Recibimos tu pedido correctamente. Nos pondremos en contacto a la brevedad para coordinar el pago y envío.
            </p>

            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 8px 0;"><strong>📌 Nº de Orden:</strong> #${orderNumber}</p>
              <p style="margin: 8px 0;"><strong>💰 Total:</strong> $${finalTotal.toLocaleString("es-AR")}</p>
            </div>

            ${formData.metodoPago === "transferencia" 
              ? `<div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                   <p style="margin: 0;"><strong>⚠️ Importante:</strong> Si elegiste <strong>Transferencia Bancaria o Naranja X</strong>, podés responder a este mail adjuntando el comprobante de pago para acelerar el proceso.</p>
                 </div>`
              : ""
            }

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; text-align: center; font-size: 12px;">
              <strong>BLACK SEVEN TEAM</strong><br/>
              Seguinos en nuestras redes sociales para nuevas colecciones
            </p>
          </div>
        </div>
      `,
    });

    // Si llegamos aquí, ambos emails se enviaron exitosamente
    return NextResponse.json({ success: true, orderNumber });

  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    return NextResponse.json(
      { error: "Error al procesar el pedido. Por favor intenta nuevamente." },
      { status: 500 }
    );
  }
}
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

    // Validar que tengamos todos los datos
    if (!formData || !cart || !orderNumber || !finalTotal) {
      return NextResponse.json(
        { error: "Faltan datos necesarios para procesar el pedido" },
        { status: 400 }
      );
    }

    const itemsList = cart
      .map(
        (item: OrderItem) =>
          `<li>${item.name} - Talle: ${item.size} - Cantidad: ${item.quantity || 1} - ${item.price}</li>`
      )
      .join("");

    // 1. Mail para el Administrador
    const adminEmailPromise = resend.emails.send({
      from: "BLACK SEVEN <noreply@resend.dev>", // ✅ Cambié de onboarding@ a noreply@
      to: [process.env.ADMIN_EMAIL || "tu_email@gmail.com"],
      subject: `🚨 NUEVO PEDIDO #${orderNumber} - BLACK SEVEN`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h1 style="color: #dc2626; text-align: center;">¡Nuevo Pedido Recibido!</h1>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>📌 Nº de Orden:</strong> #${orderNumber}</p>
              <p><strong>👤 Cliente:</strong> ${formData.nombre} ${formData.apellido}</p>
              <p><strong>📧 Email:</strong> ${formData.email}</p>
              <p><strong>📱 Teléfono:</strong> ${formData.telefono}</p>
              <p><strong>📍 Dirección:</strong> ${formData.direccion}, ${formData.ciudad} (CP: ${formData.codigoPostal})</p>
              <p><strong>💳 Método de Pago:</strong> ${formData.metodoPago === "transferencia" ? "Transferencia Bancaria" : "Mercado Pago"}</p>
            </div>

            <h2 style="color: #1f2937; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Productos Pedidos:</h2>
            <ul style="list-style: none; padding: 0;">
              ${itemsList}
            </ul>

            <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h3 style="color: #dc2626; margin: 0;">Total a cobrar: $${finalTotal.toLocaleString("es-AR")}</h3>
            </div>

            <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
              Este es un email automático de BLACK SEVEN. Por favor no respondas a este correo.
            </p>
          </div>
        </div>
      `,
    });

    // 2. Mail para el Cliente
    const clientEmailPromise = resend.emails.send({
      from: "BLACK SEVEN <noreply@resend.dev>", // ✅ Cambié de onboarding@ a noreply@
      to: [formData.email],
      subject: `✅ Confirmación de tu Pedido #${orderNumber} - BLACK SEVEN`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h1 style="color: #dc2626; text-align: center;">¡Gracias por tu compra, ${formData.nombre}!</h1>
            
            <p style="color: #374151; line-height: 1.6;">
              Recibimos tu pedido correctamente. Nos pondremos en contacto a la brevedad para coordinar el pago y envío.
            </p>

            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p><strong>📌 Nº de Orden:</strong> #${orderNumber}</p>
              <p><strong>💰 Total:</strong> $${finalTotal.toLocaleString("es-AR")}</p>
            </div>

            ${formData.metodoPago === "transferencia" 
              ? `<div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                   <p><strong>⚠️ Importante:</strong> Si elegiste <strong>Transferencia Bancaria o Naranja X</strong>, podés responder a este mail adjuntando el comprobante de pago.</p>
                 </div>`
              : ""
            }

            <p style="color: #6b7280; text-align: center; margin-top: 30px;">
              <strong>BLACK SEVEN TEAM</strong><br/>
              Seguinos en nuestras redes sociales
            </p>
          </div>
        </div>
      `,
    });

    // Esperar ambos emails
    const results = await Promise.all([adminEmailPromise, clientEmailPromise]);

    // Verificar si hay errores en los resultados
    const errors = results.filter(result => "error" in result);
    if (errors.length > 0) {
      console.error("Errores al enviar emails:", errors);
      return NextResponse.json(
        { error: "Error al enviar algunos emails" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Error enviando emails:", error);
    return NextResponse.json(
      { error: "Error al procesar el pedido. Intenta nuevamente." },
      { status: 500 }
    );
  }
}

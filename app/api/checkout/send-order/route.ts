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

    const itemsList = cart
      .map(
        (item: OrderItem) =>
          `<li>${item.name} - Talle: ${item.size} - Cantidad: ${item.quantity || 1} (${item.price})</li>`
      )
      .join("");

    // 1. Mail para el Administrador
    const adminEmailPromise = resend.emails.send({
      from: "BLACK SEVEN <onboarding@resend.dev>",
      to: [process.env.ADMIN_EMAIL || "tu_email@gmail.com"],
      subject: `🚨 NUEVO PEDIDO #${orderNumber} - BLACK SEVEN`,
      html: `
        <h1>¡Nuevo Pedido Recibido!</h1>
        <p><strong>Nº de Orden:</strong> #${orderNumber}</p>
        <p><strong>Cliente:</strong> ${formData.nombre} ${formData.apellido}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Teléfono:</strong> ${formData.telefono}</p>
        <p><strong>Dirección:</strong> ${formData.direccion}, ${formData.ciudad} (CP: ${formData.codigoPostal})</p>
        <p><strong>Método de Pago:</strong> ${formData.metodoPago}</p>
        <h2>Productos:</h2>
        <ul>${itemsList}</ul>
        <h3>Total a cobrar: $${finalTotal.toLocaleString("es-AR")}</h3>
      `,
    });

    // 2. Mail para el Cliente
    const clientEmailPromise = resend.emails.send({
      from: "BLACK SEVEN <onboarding@resend.dev>",
      to: [formData.email],
      subject: `Confirmación de tu Pedido #${orderNumber} - BLACK SEVEN`,
      html: `
        <h1>¡Gracias por tu compra, ${formData.nombre}!</h1>
        <p>Recibimos tu pedido correctamente. Nos pondremos en contacto a la brevedad para coordinar el pago y envío.</p>
        <p><strong>Nº de Orden:</strong> #${orderNumber}</p>
        <p><strong>Total:</strong> $${finalTotal.toLocaleString("es-AR")}</p>
        <br />
        <p>Si elegiste transferencia/Naranja X, podés responder a este mail adjuntando el comprobante.</p>
        <p><strong>BLACK SEVEN TEAM</strong></p>
      `,
    });

    await Promise.all([adminEmailPromise, clientEmailPromise]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json({ error: "Error al procesar el mail" }, { status: 500 });
  }
}
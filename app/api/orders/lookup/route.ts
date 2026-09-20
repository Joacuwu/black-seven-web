import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import { allowRequest, clientIp, TOO_MANY_REQUESTS } from "@/lib/rate-limit";

// Consulta pública de estado: exige Nº de pedido + email para no exponer pedidos ajenos.
export async function POST(request: Request) {
  // 30 consultas cada 15 minutos por dirección IP (evita adivinar números de pedido)
  if (!(await allowRequest(`lookup:${clientIp(request)}`, 30, 900))) {
    return NextResponse.json(TOO_MANY_REQUESTS, { status: 429 });
  }

  try {
    const body = await request.json();
    const orderNumber = Number(String(body?.orderNumber ?? "").replace(/\D/g, ""));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!Number.isInteger(orderNumber) || !email) {
      return NextResponse.json({ error: "Ingresá tu Nº de pedido y tu email." }, { status: 400 });
    }

    const order = await getOrderByNumber(orderNumber);

    // Misma respuesta si no existe o el email no coincide (no revela qué pedidos existen).
    if (!order || order.customer_email.toLowerCase() !== email) {
      return NextResponse.json(
        { error: "No encontramos un pedido con esos datos." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
      trackingCode: order.tracking_code,
      createdAt: order.created_at,
      items: order.order_items.map((i) => ({
        name: i.name,
        size: i.size,
        quantity: i.quantity,
      })),
    });
  } catch (error) {
    console.error("Error consultando pedido:", error);
    return NextResponse.json({ error: "Error al consultar el pedido." }, { status: 500 });
  }
}

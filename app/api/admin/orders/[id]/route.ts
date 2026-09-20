import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { sendShippedEmail } from "@/lib/order-emails";
import { ORDER_STATUSES, updateOrder, type OrderStatus } from "@/lib/orders";

const MAX_TRACKING_LENGTH = 100;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const patch: { status?: OrderStatus; tracking_code?: string | null } = {};

  if (body && "status" in body) {
    if (!ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    patch.status = body.status;
  }

  if (body && "tracking_code" in body) {
    const code = typeof body.tracking_code === "string" ? body.tracking_code.trim() : "";
    if (code.length > MAX_TRACKING_LENGTH) {
      return NextResponse.json({ error: "El código es demasiado largo." }, { status: 400 });
    }
    patch.tracking_code = code || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No hay nada para actualizar." }, { status: 400 });
  }

  try {
    const order = await updateOrder(id, patch);
    if (!order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });

    // Aviso opcional al cliente (el panel lo pide y confirma antes de enviarlo).
    let emailSent: boolean | undefined;
    if (body?.notify === true && order.status === "shipped") {
      try {
        await sendShippedEmail(order);
        emailSent = true;
      } catch (error) {
        console.error("Error enviando el aviso de envío:", error);
        emailSent = false;
      }
    }

    return NextResponse.json({ order, emailSent });
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 });
  }
}

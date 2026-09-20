import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    return NextResponse.json({ orders: await listOrders() });
  } catch (error) {
    console.error("Error listando pedidos:", error);
    return NextResponse.json({ error: "No se pudieron cargar los pedidos." }, { status: 500 });
  }
}

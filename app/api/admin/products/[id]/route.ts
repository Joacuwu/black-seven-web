import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteProduct, InvalidProductError, parseProductInput, updateProduct } from "@/lib/catalog";

async function parseId(ctx: { params: Promise<{ id: string }> }): Promise<number | null> {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = await parseId(ctx);
  if (id === null) return NextResponse.json({ error: "Producto inválido." }, { status: 400 });

  try {
    const input = parseProductInput(await request.json().catch(() => null));
    const product = await updateProduct(id, input);
    if (!product) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof InvalidProductError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error actualizando producto:", error);
    return NextResponse.json({ error: "No se pudo guardar el producto." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = await parseId(ctx);
  if (id === null) return NextResponse.json({ error: "Producto inválido." }, { status: 400 });

  try {
    const deleted = await deleteProduct(id);
    if (!deleted) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return NextResponse.json({ error: "No se pudo eliminar el producto." }, { status: 500 });
  }
}

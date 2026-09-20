import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createProduct, InvalidProductError, listProducts, parseProductInput } from "@/lib/catalog";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    return NextResponse.json({ products: await listProducts(false) });
  } catch (error) {
    console.error("Error listando productos:", error);
    return NextResponse.json({ error: "No se pudieron cargar los productos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const input = parseProductInput(await request.json().catch(() => null));
    return NextResponse.json({ product: await createProduct(input) }, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidProductError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creando producto:", error);
    return NextResponse.json({ error: "No se pudo crear el producto." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { listProducts } from "@/lib/catalog";

// Catálogo público (solo productos activos). El navegador/CDN lo guarda 1 minuto.
export async function GET() {
  try {
    const products = await listProducts(true);
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Error listando productos:", error);
    return NextResponse.json({ error: "No se pudieron cargar los productos." }, { status: 500 });
  }
}

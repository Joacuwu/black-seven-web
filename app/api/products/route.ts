import { NextResponse } from "next/server";
import { getCachedCatalog } from "@/lib/catalog-cache";

// Catálogo público (solo productos activos). Ya viene cacheado del lado del servidor y se renueva
// al instante cuando se edita algo en el panel, por eso el navegador/CDN no lo guarda.
export async function GET() {
  try {
    const products = await getCachedCatalog();
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-cache" } }
    );
  } catch (error) {
    console.error("Error listando productos:", error);
    return NextResponse.json({ error: "No se pudieron cargar los productos." }, { status: 500 });
  }
}

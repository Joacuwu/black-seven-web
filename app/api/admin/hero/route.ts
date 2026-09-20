import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createHeroSlide,
  getShowProducts,
  InvalidHeroSlideError,
  listHeroSlides,
  parseHeroSlideInput,
  setShowProducts,
} from "@/lib/hero";
import { refreshHero } from "@/lib/hero-cache";

const unauthorized = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized();
  try {
    const [slides, showProducts] = await Promise.all([listHeroSlides(false), getShowProducts()]);
    return NextResponse.json({ slides, showProducts });
  } catch (error) {
    console.error("Error cargando la portada:", error);
    return NextResponse.json({ error: "No se pudo cargar la portada." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return unauthorized();
  try {
    const slide = await createHeroSlide(parseHeroSlideInput(await request.json().catch(() => null)));
    refreshHero();
    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidHeroSlideError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creando diapositiva:", error);
    return NextResponse.json({ error: "No se pudo crear la diapositiva." }, { status: 500 });
  }
}

// Ajuste general: mostrar o no los productos del catálogo dentro del carrusel.
export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return unauthorized();
  const body = await request.json().catch(() => null);
  if (typeof body?.showProducts !== "boolean") {
    return NextResponse.json({ error: "Ajuste inválido." }, { status: 400 });
  }
  try {
    await setShowProducts(body.showProducts);
    refreshHero();
    return NextResponse.json({ showProducts: body.showProducts });
  } catch (error) {
    console.error("Error guardando ajuste de portada:", error);
    return NextResponse.json({ error: "No se pudo guardar el ajuste." }, { status: 500 });
  }
}

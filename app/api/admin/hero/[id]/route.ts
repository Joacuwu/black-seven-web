import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteHeroSlide, InvalidHeroSlideError, parseHeroSlideInput, updateHeroSlide } from "@/lib/hero";
import { refreshHero } from "@/lib/hero-cache";

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx): Promise<number | null> {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const id = await parseId(ctx);
  if (id === null) return NextResponse.json({ error: "Diapositiva inválida." }, { status: 400 });

  try {
    const slide = await updateHeroSlide(id, parseHeroSlideInput(await request.json().catch(() => null)));
    if (!slide) return NextResponse.json({ error: "Diapositiva no encontrada." }, { status: 404 });
    refreshHero();
    return NextResponse.json({ slide });
  } catch (error) {
    if (error instanceof InvalidHeroSlideError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error actualizando diapositiva:", error);
    return NextResponse.json({ error: "No se pudo guardar la diapositiva." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const id = await parseId(ctx);
  if (id === null) return NextResponse.json({ error: "Diapositiva inválida." }, { status: 400 });

  try {
    if (!(await deleteHeroSlide(id))) {
      return NextResponse.json({ error: "Diapositiva no encontrada." }, { status: 404 });
    }
    refreshHero();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando diapositiva:", error);
    return NextResponse.json({ error: "No se pudo eliminar la diapositiva." }, { status: 500 });
  }
}

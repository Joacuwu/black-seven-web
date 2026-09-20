import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { reorderHeroSlides } from "@/lib/hero";
import { refreshHero } from "@/lib/hero-cache";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => Number.isInteger(id) && id > 0)) {
    return NextResponse.json({ error: "Orden inválido." }, { status: 400 });
  }

  try {
    await reorderHeroSlides(ids as number[]);
    refreshHero();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordenando portada:", error);
    return NextResponse.json({ error: "No se pudo guardar el orden." }, { status: 500 });
  }
}

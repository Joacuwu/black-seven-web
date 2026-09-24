import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { InvalidAnnouncementsError, listAnnouncements, parseAnnouncementsInput, saveAnnouncements } from "@/lib/announcements";
import { refreshAnnouncements } from "@/lib/announcements-cache";

const unauthorized = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized();
  try {
    const announcements = await listAnnouncements(false);
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error cargando los anuncios:", error);
    return NextResponse.json({ error: "No se pudo cargar el cartel." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return unauthorized();
  try {
    const announcements = parseAnnouncementsInput(await request.json().catch(() => null));
    await saveAnnouncements(announcements);
    refreshAnnouncements();
    return NextResponse.json({ announcements });
  } catch (error) {
    if (error instanceof InvalidAnnouncementsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error guardando los anuncios:", error);
    return NextResponse.json({ error: "No se pudo guardar el cartel." }, { status: 500 });
  }
}

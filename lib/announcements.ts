import { randomUUID } from "crypto";
import { getSupabase } from "@/lib/supabase";
import { ANNOUNCEMENT_MAX_ITEMS, ANNOUNCEMENT_TEXT_LIMIT, type Announcement } from "@/lib/announcements-types";

// Cartel rojo de anuncios en Supabase (tabla site_settings, misma que "mostrar productos" del hero).
// Solo se usa desde el servidor.

const KEY = "announcements";

/** Anuncios visibles al público (`onlyActive`) o todos, incluidos los ocultos (panel de administración). */
export async function listAnnouncements(onlyActive = true): Promise<Announcement[]> {
  const { data, error } = await getSupabase().from("site_settings").select("value").eq("key", KEY).maybeSingle();
  if (error) throw new Error(`Error leyendo los anuncios: ${error.message}`);

  const items = Array.isArray(data?.value) ? (data.value as Announcement[]) : [];
  return onlyActive ? items.filter((a) => a.active) : items;
}

export async function saveAnnouncements(items: Announcement[]): Promise<void> {
  const { error } = await getSupabase()
    .from("site_settings")
    .upsert({ key: KEY, value: items }, { onConflict: "key" });
  if (error) throw new Error(`No se pudo guardar el cartel: ${error.message}`);
}

// ---- Validación de lo que llega desde el panel ----

export class InvalidAnnouncementsError extends Error {}

/** Valida y normaliza la lista enviada desde el panel. Lanza InvalidAnnouncementsError si algo está mal. */
export function parseAnnouncementsInput(raw: unknown): Announcement[] {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = Array.isArray(body.announcements) ? body.announcements : null;
  if (!list) throw new InvalidAnnouncementsError("Formato inválido.");
  if (list.length > ANNOUNCEMENT_MAX_ITEMS) {
    throw new InvalidAnnouncementsError(`Como mucho se pueden cargar ${ANNOUNCEMENT_MAX_ITEMS} mensajes.`);
  }

  return list
    .map((raw): Announcement | null => {
      const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
      const text = typeof item.text === "string" ? item.text.trim().slice(0, ANNOUNCEMENT_TEXT_LIMIT) : "";
      if (!text) return null;
      const id = typeof item.id === "string" && item.id ? item.id : randomUUID();
      return { id, text, active: item.active !== false };
    })
    .filter((item): item is Announcement => item !== null);
}

import { revalidateTag, unstable_cache } from "next/cache";
import { listAnnouncements } from "@/lib/announcements";
import type { Announcement } from "@/lib/announcements-types";

export const ANNOUNCEMENTS_TAG = "announcements";

/** Cartel rojo público guardado en el caché de Next; se renueva solo cada 5 minutos y al instante desde el panel. */
export const getCachedAnnouncements = unstable_cache(
  async (): Promise<Announcement[]> => listAnnouncements(true),
  ["announcements"],
  { tags: [ANNOUNCEMENTS_TAG], revalidate: 300 }
);

/** Llamar después de cualquier cambio en el cartel para que la tienda lo muestre ya. */
export function refreshAnnouncements() {
  revalidateTag(ANNOUNCEMENTS_TAG, { expire: 0 });
}

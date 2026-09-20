import { revalidateTag, unstable_cache } from "next/cache";
import { getShowProducts, listHeroSlides } from "@/lib/hero";
import type { HeroData } from "@/lib/hero-types";

export const HERO_TAG = "hero";

/** Portada pública guardada en el caché de Next; se renueva sola cada 5 minutos y al instante desde el panel. */
export const getCachedHero = unstable_cache(
  async (): Promise<HeroData> => ({
    slides: await listHeroSlides(true),
    showProducts: await getShowProducts(),
  }),
  ["hero"],
  { tags: [HERO_TAG], revalidate: 300 }
);

/** Llamar después de cualquier cambio en la portada para que la tienda lo muestre ya. */
export function refreshHero() {
  revalidateTag(HERO_TAG, { expire: 0 });
}

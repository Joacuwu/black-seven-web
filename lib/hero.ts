import { getSupabase } from "@/lib/supabase";
import { isAllowedImage, removeStoredImages } from "@/lib/catalog";
import type { HeroSlide, HeroSlideInput } from "@/lib/hero-types";

// Portada (hero) en Supabase. Solo se usa desde el servidor.

interface HeroSlideRow {
  id: number;
  image_url: string;
  mobile_image_url: string | null;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  button_label: string | null;
  button_url: string | null;
  active: boolean;
  sort_order: number;
}

const SHOW_PRODUCTS_KEY = "hero_show_products";

const toSlide = (row: HeroSlideRow): HeroSlide => ({
  id: row.id,
  imageUrl: row.image_url,
  mobileImageUrl: row.mobile_image_url,
  eyebrow: row.eyebrow,
  title: row.title,
  subtitle: row.subtitle,
  buttonLabel: row.button_label,
  buttonUrl: row.button_url,
  active: row.active,
  sortOrder: row.sort_order,
});

const toRow = (input: HeroSlideInput) => ({
  image_url: input.imageUrl,
  mobile_image_url: input.mobileImageUrl,
  eyebrow: input.eyebrow,
  title: input.title,
  subtitle: input.subtitle,
  button_label: input.buttonLabel,
  button_url: input.buttonUrl,
  active: input.active,
});

/** Diapositivas visibles al público (`onlyActive`) o todas (panel de administración). */
export async function listHeroSlides(onlyActive = true): Promise<HeroSlide[]> {
  let query = getSupabase().from("hero_slides").select("*").order("sort_order").order("id");
  if (onlyActive) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw new Error(`Error listando diapositivas: ${error.message}`);
  return (data as HeroSlideRow[]).map(toSlide);
}

export async function getShowProducts(): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("site_settings")
    .select("value")
    .eq("key", SHOW_PRODUCTS_KEY)
    .maybeSingle();

  if (error) throw new Error(`Error leyendo ajustes: ${error.message}`);
  return data?.value !== false; // si no está cargado, se muestran
}

export async function setShowProducts(value: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from("site_settings")
    .upsert({ key: SHOW_PRODUCTS_KEY, value }, { onConflict: "key" });
  if (error) throw new Error(`Error guardando el ajuste: ${error.message}`);
}

export async function createHeroSlide(input: HeroSlideInput): Promise<HeroSlide> {
  const supabase = getSupabase();

  // Las diapositivas nuevas van al final.
  const { data: last } = await supabase
    .from("hero_slides")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("hero_slides")
    .insert({ ...toRow(input), sort_order: (last?.sort_order ?? 0) + 10 })
    .select()
    .single();

  if (error) throw new Error(`No se pudo crear la diapositiva: ${error.message}`);
  return toSlide(data as HeroSlideRow);
}

export async function updateHeroSlide(id: number, input: HeroSlideInput): Promise<HeroSlide | null> {
  const supabase = getSupabase();

  const { data: before } = await supabase
    .from("hero_slides")
    .select("image_url, mobile_image_url")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("hero_slides")
    .update(toRow(input))
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`No se pudo actualizar la diapositiva: ${error.message}`);
  if (!data) return null;

  // Si se reemplazó una foto, la anterior se borra del almacenamiento para no acumular archivos.
  if (before) {
    const kept = new Set([input.imageUrl, input.mobileImageUrl]);
    const replaced = [before.image_url, before.mobile_image_url].filter((url): url is string => !!url && !kept.has(url));
    await removeStoredImages(replaced);
  }
  return toSlide(data as HeroSlideRow);
}

/** Borra la diapositiva y sus fotos subidas. Devuelve false si no existía. */
export async function deleteHeroSlide(id: number): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("hero_slides")
    .delete()
    .eq("id", id)
    .select("image_url, mobile_image_url");

  if (error) throw new Error(`No se pudo eliminar la diapositiva: ${error.message}`);
  if (!data || data.length === 0) return false;

  await removeStoredImages([data[0].image_url, data[0].mobile_image_url].filter((url): url is string => !!url));
  return true;
}

/** Guarda el orden nuevo: `ids` en el orden en que tienen que aparecer. */
export async function reorderHeroSlides(ids: number[]): Promise<void> {
  const supabase = getSupabase();
  const results = await Promise.all(
    ids.map((id, index) => supabase.from("hero_slides").update({ sort_order: (index + 1) * 10 }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(`No se pudo guardar el orden: ${failed.error.message}`);
}

// ---- Validación de lo que llega desde el panel ----

const LIMITS = { eyebrow: 40, title: 80, subtitle: 200, buttonLabel: 30, url: 200 };

export class InvalidHeroSlideError extends Error {}

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" ? value.trim().slice(0, max) || null : null;

/** Valida y normaliza una diapositiva enviada desde el panel. Lanza InvalidHeroSlideError si algo está mal. */
export function parseHeroSlideInput(raw: unknown): HeroSlideInput {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const imageUrl = text(body.imageUrl, 500);
  if (!imageUrl) throw new InvalidHeroSlideError("Subí una foto para la diapositiva.");
  if (!isAllowedImage(imageUrl)) throw new InvalidHeroSlideError("La foto tiene una dirección inválida.");

  const mobileImageUrl = text(body.mobileImageUrl, 500);
  if (mobileImageUrl && !isAllowedImage(mobileImageUrl)) {
    throw new InvalidHeroSlideError("La foto de celular tiene una dirección inválida.");
  }

  // El botón necesita texto y destino; si falta alguno de los dos, no se muestra.
  const buttonLabel = text(body.buttonLabel, LIMITS.buttonLabel);
  const buttonUrl = text(body.buttonUrl, LIMITS.url);
  if (buttonUrl && (!buttonUrl.startsWith("/") || buttonUrl.startsWith("//"))) {
    throw new InvalidHeroSlideError("El destino del botón tiene que ser una página de la tienda.");
  }

  return {
    imageUrl,
    mobileImageUrl,
    eyebrow: text(body.eyebrow, LIMITS.eyebrow),
    title: text(body.title, LIMITS.title),
    subtitle: text(body.subtitle, LIMITS.subtitle),
    buttonLabel: buttonLabel && buttonUrl ? buttonLabel : null,
    buttonUrl: buttonLabel && buttonUrl ? buttonUrl : null,
    active: body.active !== false,
  };
}

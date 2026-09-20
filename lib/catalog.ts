import { getSupabase } from "@/lib/supabase";
import type { Product, ProductInput } from "@/lib/catalog-types";

// Catálogo en Supabase. Solo se usa desde el servidor.

export const PRODUCT_IMAGES_BUCKET = "products";

interface ProductRow {
  id: number;
  name: string;
  category: string;
  price: number;
  tag: string | null;
  sizes: string[];
  images: string[];
  description: string;
  details: string[];
  active: boolean;
  sort_order: number;
}

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: row.price,
  tag: row.tag,
  sizes: row.sizes,
  images: row.images,
  description: row.description,
  details: row.details,
  active: row.active,
  sortOrder: row.sort_order,
});

const toRow = (input: ProductInput) => ({
  name: input.name,
  category: input.category,
  price: input.price,
  tag: input.tag,
  sizes: input.sizes,
  images: input.images,
  description: input.description,
  details: input.details,
  active: input.active,
  ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
});

/** Productos visibles al público (`onlyActive`) o todos (panel de administración). */
export async function listProducts(onlyActive = true): Promise<Product[]> {
  let query = getSupabase().from("products").select("*").order("sort_order").order("id");
  if (onlyActive) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw new Error(`Error listando productos: ${error.message}`);
  return (data as ProductRow[]).map(toProduct);
}

/** Productos activos por id, para valuar un carrito con los precios reales. */
export async function getActiveProductsByIds(ids: number[]): Promise<Map<number, Product>> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("active", true);

  if (error) throw new Error(`Error consultando productos: ${error.message}`);
  return new Map((data as ProductRow[]).map((row) => [row.id, toProduct(row)]));
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = getSupabase();

  // Los productos nuevos van al final de la lista.
  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const { data: last } = await supabase
      .from("products")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (last?.sort_order ?? 0) + 10;
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ ...toRow(input), sort_order: sortOrder })
    .select()
    .single();

  if (error) throw new Error(`No se pudo crear el producto: ${error.message}`);
  return toProduct(data as ProductRow);
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from("products")
    .update(toRow(input))
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`);
  return data ? toProduct(data as ProductRow) : null;
}

/** Borra el producto y, si se puede, sus fotos del almacenamiento. Devuelve false si no existía. */
export async function deleteProduct(id: number): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase.from("products").delete().eq("id", id).select("images");
  if (error) throw new Error(`No se pudo eliminar el producto: ${error.message}`);
  if (!data || data.length === 0) return false;

  await removeStoredImages(data[0].images as string[]);
  return true;
}

/** Borra del almacenamiento las fotos subidas desde el panel (las de /public no son del bucket y se ignoran). */
export async function removeStoredImages(urls: string[]): Promise<void> {
  const prefix = `${publicImagesBase()}/`;
  const paths = urls.filter((url) => url.startsWith(prefix)).map((url) => url.slice(prefix.length));
  if (paths.length > 0) {
    await getSupabase().storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  }
}

export function publicImagesBase(): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}`;
}

// ---- Validación de lo que llega desde el panel ----

const LIMITS = {
  name: 100,
  category: 40,
  tag: 20,
  size: 10,
  sizes: 12,
  images: 8,
  description: 2000,
  details: 12,
  detail: 200,
  maxPrice: 10_000_000,
};

export class InvalidProductError extends Error {}

const text = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const textList = (value: unknown, maxItems: number, maxLength: number): string[] =>
  Array.isArray(value)
    ? value.map((v) => text(v, maxLength)).filter(Boolean).slice(0, maxItems)
    : [];

export function isAllowedImage(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true; // fotos del sitio (/public)
  return url.startsWith(`${publicImagesBase()}/`); // fotos subidas desde el panel
}

/** Valida y normaliza un producto enviado desde el panel. Lanza InvalidProductError si algo está mal. */
export function parseProductInput(raw: unknown): ProductInput {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const name = text(body.name, LIMITS.name);
  if (!name) throw new InvalidProductError("El nombre es obligatorio.");

  const category = text(body.category, LIMITS.category).toLowerCase();
  if (!category) throw new InvalidProductError("La categoría es obligatoria.");

  const price = Number(body.price);
  if (!Number.isInteger(price) || price < 1 || price > LIMITS.maxPrice) {
    throw new InvalidProductError("El precio tiene que ser un número entero mayor a 0.");
  }

  const sizes = textList(body.sizes, LIMITS.sizes, LIMITS.size).map((s) => s.toUpperCase());
  if (sizes.length === 0) throw new InvalidProductError("Cargá al menos un talle.");

  const images = textList(body.images, LIMITS.images, 500);
  if (images.length === 0) throw new InvalidProductError("Subí al menos una foto.");
  if (!images.every(isAllowedImage)) throw new InvalidProductError("Hay una foto con una dirección inválida.");

  return {
    name,
    category,
    price,
    tag: text(body.tag, LIMITS.tag).toUpperCase() || null,
    sizes: [...new Set(sizes)],
    images,
    description: text(body.description, LIMITS.description),
    details: textList(body.details, LIMITS.details, LIMITS.detail),
    active: body.active !== false,
  };
}

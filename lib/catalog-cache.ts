import { revalidateTag, unstable_cache } from "next/cache";
import { listProducts } from "@/lib/catalog";

export const CATALOG_TAG = "products";

/**
 * Catálogo público guardado en el caché de Next: las páginas cargan sin esperar a la base de datos.
 * Se renueva solo cada 5 minutos y al instante cuando se edita algo desde el panel (ver `refreshCatalog`).
 */
export const getCachedCatalog = unstable_cache(() => listProducts(true), ["catalog"], {
  tags: [CATALOG_TAG],
  revalidate: 300,
});

/** Llamar después de crear, editar u ocultar/eliminar un producto para que la tienda lo muestre ya. */
export function refreshCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}

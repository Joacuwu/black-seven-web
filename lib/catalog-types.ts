// Tipos y utilidades del catálogo que también usa el navegador (no importar nada del servidor acá).

export interface Product {
  id: number;
  name: string;
  category: string;
  /** Precio en ARS, como número entero. */
  price: number;
  tag: string | null;
  sizes: string[];
  images: string[];
  description: string;
  details: string[];
  active: boolean;
  sortOrder: number;
  /** Talles agotados (stock en 0). Es público: se usa para deshabilitar el talle en la tienda. */
  soldOutSizes: string[];
  /** Unidades por talle; solo lo ve el panel de administración (en la tienda viene en null).
   *  Un talle que no figura no tiene límite. */
  stock: Record<string, number> | null;
}

export type ProductInput = Omit<Product, "id" | "sortOrder" | "soldOutSizes"> & { sortOrder?: number };

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}

/** Categoría tal como se muestra al público ("remeras" -> "Remeras"). */
export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/** Talles que se pueden comprar (los que no están agotados). */
export function availableSizes(product: Pick<Product, "sizes" | "soldOutSizes">): string[] {
  return product.sizes.filter((size) => !(product.soldOutSizes ?? []).includes(size));
}

export function isSoldOut(product: Pick<Product, "sizes" | "soldOutSizes">): boolean {
  return availableSizes(product).length === 0;
}

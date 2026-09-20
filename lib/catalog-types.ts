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
}

export type ProductInput = Omit<Product, "id" | "sortOrder"> & { sortOrder?: number };

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}

/** Categoría tal como se muestra al público ("remeras" -> "Remeras"). */
export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

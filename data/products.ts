// Catálogo único: fuente de verdad de productos y precios.
// El servidor usa este archivo para cobrar, así que los precios del cliente nunca se confían.

export type ProductCategory = "remeras" | "conjuntos" | "camperas" | "hoodies";

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  /** Precio en ARS, como número entero. */
  price: number;
  tag?: string;
  sizes: string[];
  images: string[];
  description: string;
  details: string[];
}

const HEAVY_FLEECE_DESCRIPTION =
  "Buzo de frisa invisible pesada con capucha de doble tela y bolsillo canguro. Diseñado para ofrecer máxima durabilidad y confort térmico.";

const HEAVY_FLEECE_DETAILS = [
  "Frisa invisible pesada 80/20",
  "Bordado de alta densidad en el pecho",
  "Puños y cintura de morley reinforced",
  "Corte Relaxed Fit",
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "REMERA 777 WHITE",
    category: "remeras",
    price: 35000,
    tag: "NEW",
    sizes: ["S", "M", "L", "XL"],
    images: ["/remera777.jpg", "/remera777hover.jpg"],
    description:
      "Confeccionada en algodón jersey 24/1 de pesado gramaje. Mantiene la forma y estructura con una caída boxy fit ideal para la cultura streetwear.",
    details: [
      "100% Algodón Jersey Heavyweight 240g",
      "Estampa en serigrafía frente y espalda",
      "Corte Boxy / Oversized Fit",
      "Lavar con agua fría y del revés",
    ],
  },
  {
    id: 2,
    name: "REMERA BLK7 BLACK",
    category: "remeras",
    price: 35000,
    tag: "HOT",
    sizes: ["M", "L", "XL"],
    images: ["/remerablk7.jpg", "/remerablk7hover.jpg"],
    description: HEAVY_FLEECE_DESCRIPTION,
    details: HEAVY_FLEECE_DETAILS,
  },
  {
    id: 3,
    name: "CONJUNTO BLK 777",
    category: "conjuntos",
    price: 68000,
    tag: "DROP",
    sizes: ["M", "L", "XL"],
    images: ["/conjuntoblk777.jpg", "/conjuntoblk777hover.jpg"],
    description: HEAVY_FLEECE_DESCRIPTION,
    details: HEAVY_FLEECE_DETAILS,
  },
  {
    id: 4,
    name: "CAMPERA BLK 77",
    category: "camperas",
    price: 52000,
    tag: "NEW",
    sizes: ["S", "M", "L"],
    images: ["/camperablk77.jpg", "/camperablk77hover.jpg"],
    description: HEAVY_FLEECE_DESCRIPTION,
    details: HEAVY_FLEECE_DETAILS,
  },
  {
    id: 5,
    name: "CAMPERA BLACKSEVEN 77",
    category: "camperas",
    price: 52000,
    tag: "GOD",
    sizes: ["S", "M", "L"],
    images: ["/camperablackseven77.jpg", "/camperablackseven77hover.jpg"],
    description: HEAVY_FLEECE_DESCRIPTION,
    details: HEAVY_FLEECE_DETAILS,
  },
  {
    id: 6,
    name: "BUZO BLACKSEVEN 77",
    category: "hoodies",
    price: 52000,
    tag: "NEW",
    sizes: ["S", "M", "L"],
    images: [
      "/buzoblackseven77_1.jpg",
      "/buzoblackseven77_3.jpg",
      "/buzoblackseven77_2.jpg",
      "/buzoblackseven77hover.jpg",
    ],
    description: HEAVY_FLEECE_DESCRIPTION,
    details: HEAVY_FLEECE_DETAILS,
  },
];

export function getProductById(id: number | string): Product | undefined {
  const numericId = Number(id);
  return PRODUCTS.find((product) => product.id === numericId);
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}

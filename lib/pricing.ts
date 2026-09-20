import { getProductById } from "@/data/products";

export const FREE_SHIPPING_THRESHOLD = 50000;
export const SHIPPING_COST = 4500;
export const TRANSFER_DISCOUNT_RATE = 0.1;
export const MAX_QUANTITY_PER_ITEM = 10;

export type PaymentMethod = "transferencia" | "naranjax";

export interface CartLineInput {
  id?: number | string;
  size?: string;
  quantity?: number;
}

export interface PricedLine {
  productId: number;
  name: string;
  size: string;
  unitPrice: number;
  quantity: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
}

export class InvalidCartError extends Error {}

/** Valida el carrito y lo valúa con los precios del catálogo (nunca los del cliente). */
export function priceCart(items: unknown): PricedLine[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new InvalidCartError("El carrito está vacío o el formato es incorrecto.");
  }

  return (items as CartLineInput[]).map((item) => {
    const product = getProductById(item?.id ?? "");
    const quantity = Math.floor(Number(item?.quantity ?? 1));

    if (!product || !item.size || !product.sizes.includes(item.size)) {
      throw new InvalidCartError("Hay un producto inválido en el carrito.");
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw new InvalidCartError("Cantidad inválida.");
    }

    return {
      productId: product.id,
      name: product.name,
      size: item.size,
      unitPrice: product.price,
      quantity,
    };
  });
}

export function computeTotals(lines: PricedLine[], method: PaymentMethod): Totals {
  const subtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
  const discount = method === "transferencia" ? Math.round(subtotal * TRANSFER_DISCOUNT_RATE) : 0;
  const shippingCost = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  return { subtotal, discount, shippingCost, total: subtotal - discount + shippingCost };
}

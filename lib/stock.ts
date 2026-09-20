import { getSupabase } from "@/lib/supabase";

// Control de stock por talle. La reserva y la devolución se hacen dentro de la base de datos
// (funciones reserve_stock / release_stock de supabase/stock-y-limites.sql) para que dos compras
// al mismo tiempo nunca puedan llevarse la misma última unidad.

export interface StockLine {
  productId: number;
  name: string;
  size: string;
  quantity: number;
}

export interface LowStockAlert {
  name: string;
  size: string;
  remaining: number;
}

export class OutOfStockError extends Error {}

const toRpcItems = (lines: StockLine[]) =>
  lines.map((l) => ({ product_id: l.productId, size: l.size, quantity: l.quantity }));

// Si todavía no se corrió el SQL, la función no existe: en ese caso se sigue vendiendo sin control de stock.
const isMissingFunction = (error: { code?: string; message?: string }) =>
  error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");

/** Descuenta el stock del pedido. Devuelve los talles que quedaron con poco. Lanza OutOfStockError si no alcanza. */
export async function reserveStock(lines: StockLine[]): Promise<LowStockAlert[]> {
  const { data, error } = await getSupabase().rpc("reserve_stock", { p_items: toRpcItems(lines) });

  if (error) {
    const outOfStock = /OUT_OF_STOCK:(\d+)/.exec(error.message);
    if (outOfStock) {
      const line = lines.find((l) => l.productId === Number(outOfStock[1]));
      throw new OutOfStockError(
        line
          ? `No hay stock suficiente de ${line.name} en talle ${line.size}. Revisá tu carrito.`
          : "Hay un producto sin stock suficiente. Revisá tu carrito."
      );
    }
    if (isMissingFunction(error)) {
      console.warn("reserve_stock no existe todavía: se vende sin control de stock. Falta correr supabase/stock-y-limites.sql");
      return [];
    }
    throw new Error(`No se pudo reservar el stock: ${error.message}`);
  }

  const names = new Map(lines.map((l) => [`${l.productId}:${l.size}`, l.name]));
  return ((data ?? []) as { product_id: number; size: string; remaining: number }[]).map((row) => ({
    name: names.get(`${row.product_id}:${row.size}`) ?? `Producto ${row.product_id}`,
    size: row.size,
    remaining: row.remaining,
  }));
}

/** Devuelve el stock de un pedido cancelado. No lanza errores: solo avisa en el log. */
export async function releaseStock(lines: StockLine[]): Promise<void> {
  const { error } = await getSupabase().rpc("release_stock", { p_items: toRpcItems(lines) });
  if (error && !isMissingFunction(error)) {
    console.error("No se pudo devolver el stock:", error.message);
  }
}

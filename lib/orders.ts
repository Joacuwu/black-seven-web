import { randomInt } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import type { PaymentMethod, PricedLine, Totals } from "@/lib/pricing";

export type OrderStatus =
  | "pending_payment"
  | "pending_transfer"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "pending_transfer",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export interface CustomerData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
}

export interface OrderItemRow {
  product_id: number;
  name: string;
  size: string;
  unit_price: number;
  quantity: number;
}

export interface OrderRow {
  id: string;
  order_number: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  provider_payment_id: string | null;
  customer_name: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  tracking_code: string | null;
  created_at: string;
  order_items: OrderItemRow[];
}

const UNIQUE_VIOLATION = "23505";
const MAX_ORDER_NUMBER_ATTEMPTS = 5;

export async function createOrder(params: {
  customer: CustomerData;
  method: PaymentMethod;
  lines: PricedLine[];
  totals: Totals;
}): Promise<OrderRow> {
  const supabase = getSupabase();
  const { customer, method, lines, totals } = params;

  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: randomInt(100000, 1000000),
        status: method === "transferencia" ? "pending_transfer" : "pending_payment",
        payment_method: method,
        customer_name: customer.nombre,
        customer_lastname: customer.apellido,
        customer_email: customer.email,
        customer_phone: customer.telefono,
        shipping_address: customer.direccion,
        shipping_city: customer.ciudad,
        shipping_zip: customer.codigoPostal,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping_cost: totals.shippingCost,
        total: totals.total,
      })
      .select()
      .single();

    if (error?.code === UNIQUE_VIOLATION) continue; // número repetido: reintentar
    if (error || !order) throw new Error(`No se pudo crear el pedido: ${error?.message}`);

    const items: OrderItemRow[] = lines.map((l) => ({
      product_id: l.productId,
      name: l.name,
      size: l.size,
      unit_price: l.unitPrice,
      quantity: l.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) {
      // Sin ítems el pedido no sirve: se borra para no dejar pedidos vacíos.
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(`No se pudieron guardar los productos del pedido: ${itemsError.message}`);
    }

    return { ...order, order_items: items } as OrderRow;
  }

  throw new Error("No se pudo generar un número de pedido único.");
}

export async function getOrderByNumber(orderNumber: number): Promise<OrderRow | null> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, order_items(product_id, name, size, unit_price, quantity)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw new Error(`Error consultando el pedido: ${error.message}`);
  return (data as OrderRow | null) ?? null;
}

/**
 * Cambia el estado solo si el pedido está actualmente en alguno de `fromStatuses`.
 * Devuelve true si hubo cambio (útil para que el webhook sea idempotente).
 */
export async function transitionOrderStatus(
  orderNumber: number,
  fromStatuses: OrderStatus[],
  toStatus: OrderStatus,
  extra: { provider_payment_id?: string } = {}
): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("orders")
    .update({ status: toStatus, ...extra })
    .eq("order_number", orderNumber)
    .in("status", fromStatuses)
    .select("id");

  if (error) throw new Error(`Error actualizando el pedido: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export async function setProviderPaymentId(orderNumber: number, providerPaymentId: string) {
  const { error } = await getSupabase()
    .from("orders")
    .update({ provider_payment_id: providerPaymentId })
    .eq("order_number", orderNumber);
  if (error) throw new Error(`Error guardando el pago del pedido: ${error.message}`);
}

const ORDER_SELECT = "*, order_items(product_id, name, size, unit_price, quantity)";

/** Últimos pedidos, más nuevos primero (uso del panel de administración). */
export async function listOrders(limit = 200): Promise<OrderRow[]> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Error listando pedidos: ${error.message}`);
  return (data as OrderRow[]) ?? [];
}

/** Actualiza estado y/o código de seguimiento de un pedido (uso del panel de administración). */
export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; tracking_code?: string | null }
): Promise<OrderRow | null> {
  const { data, error } = await getSupabase()
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select(ORDER_SELECT)
    .maybeSingle();

  if (error) throw new Error(`Error actualizando el pedido: ${error.message}`);
  return (data as OrderRow | null) ?? null;
}

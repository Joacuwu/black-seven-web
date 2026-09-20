"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderRow, OrderStatus } from "@/lib/orders";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Esperando pago online",
  pending_transfer: "Esperando transferencia",
  paid: "Pagado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_ORDER = Object.keys(STATUS_LABEL) as OrderStatus[];

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  pending_transfer: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  paid: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  preparing: "bg-sky-900/40 text-sky-300 border-sky-700/50",
  shipped: "bg-indigo-900/40 text-indigo-300 border-indigo-700/50",
  delivered: "bg-neutral-800 text-neutral-300 border-neutral-700",
  cancelled: "bg-red-950/60 text-red-300 border-red-800/50",
};

const money = (value: number) => `$${value.toLocaleString("es-AR")}`;

function OrderCard({
  order,
  onUpdated,
  onUnauthorized,
}: {
  order: OrderRow;
  onUpdated: (order: OrderRow) => void;
  onUnauthorized: () => void;
}) {
  const [tracking, setTracking] = useState(order.tracking_code ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async (patch: { status?: OrderStatus; tracking_code?: string; notify?: boolean }) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo guardar.");
      } else {
        onUpdated(data.order);
        setMessage(
          data.emailSent === true
            ? "Guardado ✓ · Se le avisó al cliente por mail"
            : data.emailSent === false
              ? "Guardado ✓ · pero NO se pudo enviar el mail al cliente"
              : "Guardado ✓"
        );
      }
    } catch {
      setMessage("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const phoneDigits = order.customer_phone.replace(/\D/g, "");
  const trackingChanged = tracking.trim() !== (order.tracking_code ?? "");

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-md p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bebas text-2xl tracking-wider">PEDIDO #{order.order_number}</p>
          <p className="text-xs text-neutral-500">
            {new Date(order.created_at).toLocaleString("es-AR")} ·{" "}
            {order.payment_method === "transferencia" ? "Transferencia" : "Naranja X"}
          </p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded border ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
        <div className="space-y-1 text-neutral-300">
          <p className="font-bold text-white">
            {order.customer_name} {order.customer_lastname}
          </p>
          <p>{order.customer_email}</p>
          <p>
            {order.customer_phone}{" "}
            {phoneDigits && (
              <a
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 underline text-xs ml-1"
              >
                WhatsApp
              </a>
            )}
          </p>
          <p>
            {order.shipping_address}, {order.shipping_city} (CP {order.shipping_zip})
          </p>
        </div>

        <div className="space-y-1 text-neutral-300">
          {order.order_items.map((item, i) => (
            <p key={i}>
              {item.quantity}× {item.name} <span className="text-neutral-500">(Talle {item.size})</span>
            </p>
          ))}
          <p className="pt-1 font-bold text-white">
            Total: {money(order.total)}
            {order.discount > 0 && (
              <span className="text-neutral-500 font-normal text-xs"> (incluye -{money(order.discount)} por transferencia)</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-neutral-900">
        <label className="text-xs text-neutral-400 uppercase tracking-wider">
          Estado
          <select
            value={order.status}
            disabled={saving}
            onChange={(e) => {
              const status = e.target.value as OrderStatus;
              if (status === "shipped") {
                const ok = window.confirm(
                  `¿Marcar el pedido #${order.order_number} como ENVIADO?

Se le va a mandar un mail a ${order.customer_email} avisándole${tracking.trim() ? " (con el código de seguimiento)" : " (todavía sin código de seguimiento)"}.`
                );
                if (!ok) return;
                return save({ status, tracking_code: tracking, notify: true });
              }
              save({ status });
            }}
            className="mt-1 w-full bg-black border border-neutral-800 rounded p-3 text-base md:text-sm text-white normal-case tracking-normal focus:border-white outline-none"
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <div className="text-xs text-neutral-400 uppercase tracking-wider">
          Código de seguimiento
          <div className="mt-1 flex gap-2">
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Ej: AB123456789AR"
              maxLength={100}
              className="min-w-0 flex-1 bg-black border border-neutral-800 rounded p-3 text-base md:text-sm text-white normal-case tracking-normal focus:border-white outline-none"
            />
            <button
              onClick={() => {
                const notify =
                  order.status === "shipped" &&
                  tracking.trim() !== "" &&
                  window.confirm("¿Avisarle al cliente por mail con este código de seguimiento?");
                save({ tracking_code: tracking, notify });
              }}
              disabled={saving || !trackingChanged}
              className="px-5 bg-white text-black text-sm md:text-xs font-bold rounded disabled:opacity-30 hover:bg-neutral-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      {message && <p className="text-xs text-neutral-400 mt-2">{message}</p>}
    </div>
  );
}

export default function OrdersPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [loadError, setLoadError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) return setLoadError(data.error || "No se pudieron cargar los pedidos.");
      setOrders(data.orders);
    } catch {
      setLoadError("Error de conexión.");
    }
  }, [onUnauthorized]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  const replaceOrder = (updated: OrderRow) =>
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <details className="mb-4 bg-neutral-950 border border-neutral-900 rounded-md text-sm">
        <summary className="px-4 py-3 cursor-pointer font-bold">¿Cómo se usa esta pantalla?</summary>
        <ol className="px-4 pb-4 pt-1 list-decimal list-inside space-y-1.5 text-neutral-300 text-xs leading-relaxed">
          <li>Cada tarjeta es un pedido. Los más nuevos están arriba.</li>
          <li>Cuando el cliente te paga, cambiá el <b>Estado</b> a “Pagado” y después a “Preparando”.</li>
          <li>Al despachar, elegí <b>Enviado</b>: el sistema le manda un mail al cliente (con el código si ya lo cargaste).</li>
          <li>Para cargar el <b>código de seguimiento</b>, escribilo y tocá Guardar.</li>
          <li>El cliente ve todos estos cambios en “Mi pedido” de la tienda.</li>
        </ol>
      </details>

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2 text-xs">
          {(["todos", ...STATUS_ORDER] as const).map((status) => {
            const count = status === "todos" ? orders.length : counts[status] ?? 0;
            const active = filter === status;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  active ? "bg-white text-black border-white" : "border-neutral-800 text-neutral-400 hover:border-neutral-600"
                }`}
              >
                {status === "todos" ? "Todos" : STATUS_LABEL[status]} ({count})
              </button>
            );
          })}
        </div>
        <button onClick={loadOrders} className="border border-neutral-800 px-3 py-1.5 rounded text-xs hover:border-white transition-colors cursor-pointer">
          Actualizar
        </button>
      </div>

      {loadError && <p className="text-sm text-red-400 mb-4">{loadError}</p>}

      <div className="space-y-4">
        {visible.length === 0 && !loadError && (
          <p className="text-neutral-500 text-sm text-center py-12">No hay pedidos para mostrar.</p>
        )}
        {visible.map((order) => (
          <OrderCard key={order.id} order={order} onUpdated={replaceOrder} onUnauthorized={onUnauthorized} />
        ))}
      </div>
    </div>
  );
}

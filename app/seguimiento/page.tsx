"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface OrderInfo {
  orderNumber: number;
  status: string;
  total: number;
  trackingCode: string | null;
  items: { name: string; size: string; quantity: number }[];
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: "Esperando el pago",
  pending_transfer: "Esperando tu transferencia",
  paid: "Pago recibido",
  preparing: "Preparando tu pedido",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

function SeguimientoContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { clearCart } = useCart();

  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Volvió del pago aprobado: ahora sí se vacía el carrito.
  useEffect(() => {
    if (status === "success") clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "No pudimos consultar el pedido.");
      else setOrder(data);
    } catch {
      setError("Error de conexión. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-sm text-center">
      {/* Alerta según estado del pago */}
      {status === "success" && (
        <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="text-xl font-bold tracking-wide text-emerald-400">
            ¡GRACIAS POR TU COMPRA!
          </h2>
          <p className="text-sm mt-1 text-emerald-200/80">
            Tu pago fue procesado con éxito. Ya estamos preparando tu pedido.
          </p>
        </div>
      )}

      {status === "failure" && (
        <div className="mb-6 p-4 bg-red-950/80 border border-red-500/50 rounded-lg text-red-300">
          <div className="text-3xl mb-2">⚠️</div>
          <h2 className="text-xl font-bold tracking-wide text-red-400">
            EL PAGO NO PUDO COMPLETARSE
          </h2>
          <p className="text-sm mt-1 text-red-200/80">
            Ocurrió un problema durante el proceso de pago. Por favor, intentá nuevamente.
          </p>
        </div>
      )}

      {status === "pending" && (
        <div className="mb-6 p-4 bg-amber-950/80 border border-amber-500/50 rounded-lg text-amber-300">
          <div className="text-3xl mb-2">⏳</div>
          <h2 className="text-xl font-bold tracking-wide text-amber-400">
            PAGO PENDIENTE
          </h2>
          <p className="text-sm mt-1 text-amber-200/80">
            Tu pago está siendo procesado. Te notificaremos cuando se apruebe.
          </p>
        </div>
      )}

      {/* Formulario principal de seguimiento */}
      <h1 className="text-2xl font-black tracking-wider text-white uppercase mb-2">
        SEGUIMIENTO DE ENVÍO
      </h1>
      <p className="text-xs text-zinc-400 mb-6">
        Ingresá tu número de pedido y el email con el que compraste.
      </p>

      <form onSubmit={handleLookup} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Nº de pedido (ej: 482913)"
          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors text-center tracking-widest font-mono"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors text-center"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold tracking-wider rounded-lg transition-colors uppercase text-sm"
        >
          {loading ? "CONSULTANDO..." : "CONSULTAR ESTADO"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {order && (
        <div className="mt-6 p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-left text-sm">
          <p className="text-zinc-400 text-xs uppercase tracking-wider">Pedido #{order.orderNumber}</p>
          <p className="text-lg font-bold text-white mt-1">
            {ORDER_STATUS_LABEL[order.status] ?? order.status}
          </p>
          {order.trackingCode && (
            <p className="text-zinc-300 mt-1">
              Código de seguimiento: <span className="font-mono">{order.trackingCode}</span>
            </p>
          )}
          <ul className="mt-3 space-y-1 text-zinc-400">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.quantity}× {item.name} (Talle {item.size})
              </li>
            ))}
          </ul>
          <p className="mt-3 text-zinc-300">Total: ${order.total.toLocaleString("es-AR")}</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-zinc-800">
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function SeguimientoPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-500 text-sm">Cargando...</div>}>
        <SeguimientoContent />
      </Suspense>
    </div>
  );
}
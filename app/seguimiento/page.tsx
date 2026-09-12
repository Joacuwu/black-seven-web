"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SeguimientoContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-sm text-center">
      {/* Alerta según estado del pago de Mercado Pago */}
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
        Ingresá tu código de orden o número de seguimiento enviado a tu email.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Ej: BLK-777-908"
          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors text-center uppercase tracking-widest font-mono"
        />
        <button
          type="submit"
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider rounded-lg transition-colors uppercase text-sm"
        >
          CONSULTAR ESTADO
        </button>
      </form>

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
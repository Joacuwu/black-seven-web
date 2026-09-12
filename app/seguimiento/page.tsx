"use client";

import { useState } from "react";
import Link from "next/link";

export default function SeguimientoPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;

    // Simulación de consulta de estado
    if (trackingNumber.toUpperCase().startsWith("BLK")) {
      setStatus("EN CAMINO - Correo Argentino (Código: " + trackingNumber + ")");
    } else {
      setStatus("ORDEN EN PREPARACIÓN - Tu pedido se está empaquetando.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20 font-montserrat flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 p-8 rounded-sm">
        <h1 className="font-bebas text-4xl tracking-wider text-center mb-2">
          SEGUIMIENTO DE ENVÍO
        </h1>
        <p className="text-xs text-neutral-400 text-center mb-6">
          Ingresá tu código de orden o número de seguimiento enviado a tu email.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Ej: BLK-777-908"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="bg-black border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bebas text-xl py-3 tracking-widest uppercase transition-colors"
          >
            CONSULTAR ESTADO
          </button>
        </form>

        {status && (
          <div className="mt-6 p-4 bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-xs text-neutral-400 uppercase tracking-widest block mb-1">Estado de tu pedido:</span>
            <p className="text-sm font-bold text-red-500">{status}</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-neutral-500 underline hover:text-white transition-colors">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
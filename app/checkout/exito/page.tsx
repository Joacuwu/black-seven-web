"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BankTransferBox from "@/components/BankTransferBox";

function ExitoContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "------";
  const total = Number(params.get("total")) || null; // solo para mostrar el importe; el cobro real lo calcula el servidor

  return (
    <div className="min-h-[80vh] bg-black text-white flex flex-col items-center justify-center p-6 text-center font-montserrat">
      
      {/* ICONO DE ÉXITO */}
      <div className="w-16 h-16 bg-red-600/20 border border-red-600 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <span className="text-xs font-bold text-red-600 tracking-widest uppercase mb-2">
        ¡GRACIAS POR TU COMPRA!
      </span>
      
      <h1 className="text-4xl md:text-5xl font-bebas tracking-wider mb-2">
        PEDIDO #{orderNumber} RECIBIDO
      </h1>
      
      <p className="text-neutral-400 text-sm max-w-md mb-6 leading-relaxed">
        Reservamos tu pedido. Para confirmarlo, hacé la transferencia con los datos de abajo y mandanos el comprobante.
      </p>

      {orderNumber !== "------" && (
        <div className="w-full mb-8">
          <BankTransferBox orderNumber={orderNumber} total={total} />
        </div>
      )}

      <p className="text-neutral-500 text-xs max-w-md mb-8 leading-relaxed">
        También te mandamos estos datos por mail. Podés consultar el estado de tu pedido cuando quieras en “Mi pedido”, con tu número y tu email.
      </p>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/seguimiento?order=${orderNumber}`}
          className="bg-red-600 text-white font-bebas text-lg tracking-wider px-8 py-3 hover:bg-red-700 transition-colors"
        >
          SEGUIR MI PEDIDO
        </Link>
        <Link
          href="/"
          className="bg-white text-black font-bebas text-lg tracking-wider px-8 py-3 hover:bg-neutral-200 transition-colors"
        >
          VOLVER AL INICIO
        </Link>
        <Link
          href="/coleccion"
          className="border border-neutral-800 text-neutral-300 font-bebas text-lg tracking-wider px-8 py-3 hover:border-white hover:text-white transition-colors"
        >
          SEGUIR COMPRANDO
        </Link>
      </div>

    </div>
  );
}

export default function ExitoPage() {
  return (
    <Suspense fallback={null}>
      <ExitoContent />
    </Suspense>
  );
}

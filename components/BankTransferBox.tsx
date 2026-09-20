"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { BANK_DETAILS, proofWhatsAppUrl } from "@/lib/payment-config";
import { formatPrice } from "@/lib/catalog-types";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Sin permiso para el portapapeles (algunos navegadores): se copia con un campo temporal.
      const field = document.createElement("textarea");
      field.value = value;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black border border-neutral-800 rounded px-4 py-3">
      <div className="min-w-0 text-left">
        <p className="text-[11px] tracking-[0.15em] uppercase text-neutral-500">{label}</p>
        <p className="font-mono text-[15px] sm:text-lg text-white break-all select-all">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar ${label}`}
        className={`flex-shrink-0 flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-3 sm:py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
          copied ? "bg-green-600 text-white" : "bg-white text-black hover:bg-neutral-200"
        }`}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

interface BankTransferBoxProps {
  orderNumber: number | string;
  /** Total a transferir, si se conoce. */
  total?: number | null;
}

/** Datos para pagar por transferencia, con botones para copiar y para mandar el comprobante. */
export default function BankTransferBox({ orderNumber, total }: BankTransferBoxProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-neutral-950 border border-neutral-800 rounded-md p-5 text-left space-y-3">
      <h2 className="font-bebas text-2xl tracking-wider text-center">TRANSFERÍ PARA CONFIRMAR TU PEDIDO</h2>

      {total ? (
        <p className="text-center text-sm text-neutral-300">
          Importe a transferir: <span className="font-bold text-white text-lg">{formatPrice(total)}</span>
        </p>
      ) : null}

      <CopyRow label="Alias" value={BANK_DETAILS.alias} />
      <CopyRow label="CBU / CVU" value={BANK_DETAILS.cbu} />
      {BANK_DETAILS.holder && <p className="text-xs text-neutral-400 text-center">Titular: {BANK_DETAILS.holder}</p>}

      <ol className="text-xs text-neutral-400 leading-relaxed list-decimal list-inside space-y-1 pt-1">
        <li>Hacé la transferencia desde tu app del banco o billetera.</li>
        <li>
          Si podés, poné <b className="text-neutral-200">#{orderNumber}</b> en el concepto.
        </li>
        <li>Mandanos el comprobante por WhatsApp para confirmar tu pedido.</li>
      </ol>

      <a
        href={proofWhatsAppUrl(orderNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bebas text-xl tracking-wider py-3 transition-colors"
      >
        ENVIAR COMPROBANTE POR WHATSAPP
      </a>
    </div>
  );
}

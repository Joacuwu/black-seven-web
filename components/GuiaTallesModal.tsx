"use client";

import React from "react";

interface GuiaTallesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuiaTallesModal({ isOpen, onClose }: GuiaTallesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors text-xl font-bold"
        >
          ✕
        </button>

        <h3 className="text-xl font-black tracking-wider text-white uppercase mb-2">
          GUÍA DE TALLES
        </h3>
        <p className="text-xs text-zinc-400 mb-6">
          Medidas aproximadas expresadas en centímetros sobre la prenda plana.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-300">
            <thead className="text-xs uppercase bg-zinc-800/60 text-zinc-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Talle</th>
                <th className="px-4 py-3">Ancho (Sisa)</th>
                <th className="px-4 py-3 rounded-r-lg">Largo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <tr>
                <td className="px-4 py-3 font-bold text-white">S</td>
                <td className="px-4 py-3">52 cm</td>
                <td className="px-4 py-3">70 cm</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">M</td>
                <td className="px-4 py-3">55 cm</td>
                <td className="px-4 py-3">72 cm</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">L</td>
                <td className="px-4 py-3">58 cm</td>
                <td className="px-4 py-3">75 cm</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">XL</td>
                <td className="px-4 py-3">61 cm</td>
                <td className="px-4 py-3">78 cm</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
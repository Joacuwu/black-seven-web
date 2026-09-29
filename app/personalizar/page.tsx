"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { availableSizes, formatPrice, isSoldOut } from "@/lib/catalog-types";
import { WHATSAPP_NUMBER } from "@/lib/payment-config";

interface Cut {
  key: string;
  label: string;
  /** Nombre exacto del producto en el catálogo (supabase/personalizacion.sql). */
  productName: string;
  description: string;
}

const CUTS: Cut[] = [
  {
    key: "oversize",
    label: "Oversize",
    productName: "REMERA PERSONALIZADA - OVERSIZE",
    description: "Caída amplia y relajada. Ideal para un look urbano y cómodo.",
  },
  {
    key: "boxy",
    label: "Boxy Fit",
    productName: "REMERA PERSONALIZADA - BOXY FIT",
    description: "Ancho parejo de hombro a cintura. El clásico del streetwear.",
  },
  {
    key: "clasico",
    label: "Corte Clásico",
    productName: "REMERA PERSONALIZADA - CLÁSICO",
    description: "Entallado a la medida real. Prolijo y atemporal.",
  },
];

const whatsappUrl = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export default function PersonalizarPage() {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const [selectedCutKey, setSelectedCutKey] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selectedCut = CUTS.find((c) => c.key === selectedCutKey) ?? null;
  const product = selectedCut ? products.find((p) => p.name === selectedCut.productName) : undefined;

  const selectCut = (key: string) => {
    setSelectedCutKey(key);
    setSelectedSize(null);
    setAdded(false);
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      size: selectedSize,
      img: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const whatsappMessage = selectedCut
    ? `¡Hola! Quiero personalizar una remera.\n\nCorte: ${selectedCut.label}${selectedSize ? `\nTalle: ${selectedSize}` : ""}`
    : "¡Hola! Quiero personalizar una remera, ¿me ayudan a elegir el corte?";

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-24 px-4 md:px-8 font-montserrat">
      <div className="max-w-5xl mx-auto">
        {/* CABECERA */}
        <div className="border-b border-neutral-900 pb-8 mb-10 text-center md:text-left">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">Hecha a tu medida</span>
          <h1 className="text-4xl md:text-6xl font-black font-bebas tracking-wider uppercase mt-1">
            Personalizá tu remera
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-2 max-w-xl mx-auto md:mx-0">
            Elegí el corte que más te guste. Mismo precio, mismos talles: la diferencia es cómo te queda.
          </p>
        </div>

        {/* TARJETAS DE CORTE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {CUTS.map((cut) => {
            const isSelected = selectedCutKey === cut.key;
            return (
              <button
                key={cut.key}
                onClick={() => selectCut(cut.key)}
                className={`text-left p-5 rounded-lg border transition-colors cursor-pointer ${
                  isSelected ? "border-red-600 bg-neutral-950" : "border-neutral-900 bg-neutral-950/60 hover:border-neutral-700"
                }`}
              >
                <span className="font-bebas text-2xl tracking-wider uppercase">{cut.label}</span>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{cut.description}</p>
              </button>
            );
          })}
        </div>

        {/* DETALLE DEL CORTE ELEGIDO */}
        {selectedCut && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-5 md:p-8">
            {loading && !product ? (
              <p className="text-neutral-500 text-sm py-8 text-center">Cargando...</p>
            ) : !product ? (
              <p className="text-neutral-400 text-sm py-8 text-center">
                Esta opción todavía no está cargada. Escribinos por WhatsApp y te ayudamos igual.
              </p>
            ) : (
              <div className="grid sm:grid-cols-[160px_1fr] gap-6 items-start">
                <div className="relative aspect-[4/5] w-full sm:w-40 bg-neutral-900 rounded overflow-hidden">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                </div>

                <div>
                  <h2 className="font-bebas text-2xl tracking-wider uppercase">{selectedCut.label}</h2>
                  <p className="text-lg font-black tracking-tighter text-white mt-1">{formatPrice(product.price)}</p>
                  <p className="text-xs text-neutral-500 mt-1">10% de descuento pagando por transferencia</p>

                  {isSoldOut(product) ? (
                    <p className="mt-4 text-sm text-neutral-400">Sin stock por ahora. Escribinos por WhatsApp y te avisamos apenas vuelva.</p>
                  ) : (
                    <div className="mt-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Talle</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableSizes(product).map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-11 h-11 rounded border text-sm font-bold transition-colors cursor-pointer ${
                              selectedSize === size ? "bg-white text-black border-white" : "border-neutral-700 hover:border-white"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={handleAddToCart}
                      disabled={isSoldOut(product) || !selectedSize}
                      className="flex-1 bg-white text-black py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {added ? "¡Agregado! ✓" : "Agregar al carrito"}
                    </button>
                    <Link
                      href={whatsappUrl(whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Consultar por WhatsApp
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedCut && (
          <p className="text-center text-neutral-500 text-sm py-8">Tocá uno de los cortes de arriba para ver el talle y el precio.</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { availableSizes, formatPrice, isSoldOut } from "@/lib/catalog-types";
import { WHATSAPP_NUMBER } from "@/lib/payment-config";
import { uploadBlob } from "@/components/admin/imageTools";

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
    productName: "REMERA PERSONALIZADA - CLASICO",
    description: "Entallado a la medida real. Prolijo y atemporal.",
  },
];

const whatsappUrl = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Ancho fijo del "lienzo" final (alto = ancho * 5/4, mismo aspecto que la foto de la remera).
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1250;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar una de las imágenes."));
    img.src = src;
  });
}

/** Dibuja la remera y el diseño encima (en la posición y tamaño elegidos) en un solo PNG. */
async function buildComposite(
  shirtSrc: string,
  designSrc: string,
  pos: { x: number; y: number },
  scalePct: number
): Promise<Blob> {
  const [shirtImg, designImg] = await Promise.all([loadImage(shirtSrc), loadImage(designSrc)]);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo generar la imagen.");

  ctx.drawImage(shirtImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const designWidth = CANVAS_WIDTH * (scalePct / 100);
  const designHeight = designWidth * (designImg.naturalHeight / designImg.naturalWidth);
  const x = CANVAS_WIDTH * (pos.x / 100) - designWidth / 2;
  const y = CANVAS_HEIGHT * (pos.y / 100) - designHeight / 2;
  ctx.drawImage(designImg, x, y, designWidth, designHeight);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen."))), "image/png")
  );
}

export default function PersonalizarPage() {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const [selectedCutKey, setSelectedCutKey] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Diseño que el cliente sube y ubica sobre la remera.
  const [designObjectUrl, setDesignObjectUrl] = useState<string | null>(null);
  const [designPos, setDesignPos] = useState({ x: 50, y: 42 });
  const [designScale, setDesignScale] = useState(35);
  const [dragging, setDragging] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);

  const [processing, setProcessing] = useState<"cart" | "whatsapp" | null>(null);
  const [actionError, setActionError] = useState("");

  const selectedCut = CUTS.find((c) => c.key === selectedCutKey) ?? null;
  const product = selectedCut ? products.find((p) => p.name === selectedCut.productName) : undefined;

  useEffect(() => {
    // Libera la memoria del blob al reemplazar el diseño o salir de la página.
    return () => {
      if (designObjectUrl) URL.revokeObjectURL(designObjectUrl);
    };
  }, [designObjectUrl]);

  const selectCut = (key: string) => {
    setSelectedCutKey(key);
    setSelectedSize(null);
    setAdded(false);
    setActionError("");
    removeDesign();
  };

  const handleDesignFile = (file: File | undefined) => {
    if (!file) return;
    setActionError("");
    if (designObjectUrl) URL.revokeObjectURL(designObjectUrl);
    setDesignObjectUrl(URL.createObjectURL(file));
    setDesignPos({ x: 50, y: 42 });
    setDesignScale(35);
  };

  const removeDesign = () => {
    if (designObjectUrl) URL.revokeObjectURL(designObjectUrl);
    setDesignObjectUrl(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging || !mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDesignPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  // Genera el PNG final (remera + diseño ubicado) y lo sube; null si no hay diseño para subir.
  const buildAndUploadDesign = async (): Promise<string | null> => {
    if (!designObjectUrl || !product) return null;

    const blob = await buildComposite(product.images[0], designObjectUrl, designPos, designScale);

    const prepRes = await fetch("/api/personalizar/upload", { method: "POST" });
    const prepData = await prepRes.json().catch(() => ({}));
    if (!prepRes.ok) throw new Error(prepData.error || "No se pudo preparar la subida.");

    await uploadBlob(prepData.uploadUrl, blob);
    return prepData.publicUrl as string;
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSize) return;
    setProcessing("cart");
    setActionError("");
    try {
      const designUrl = await buildAndUploadDesign();
      addToCart({
        id: product.id,
        name: product.name,
        price: formatPrice(product.price),
        size: selectedSize,
        img: designUrl ?? product.images[0],
        designUrl: designUrl ?? undefined,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo agregar al carrito.");
    } finally {
      setProcessing(null);
    }
  };

  const handleWhatsApp = async () => {
    // La ventana se abre ya (gesto del usuario) para que el navegador no la bloquee mientras subimos el diseño.
    const win = window.open("", "_blank", "noopener,noreferrer");
    setProcessing("whatsapp");
    setActionError("");
    try {
      const designUrl = await buildAndUploadDesign();
      const message = selectedCut
        ? `¡Hola! Quiero personalizar una remera.\n\nCorte: ${selectedCut.label}${selectedSize ? `\nTalle: ${selectedSize}` : ""}${
            designUrl ? `\nDiseño: ${designUrl}` : ""
          }`
        : "¡Hola! Quiero personalizar una remera, ¿me ayudan a elegir el corte?";
      const url = whatsappUrl(message);
      if (win) win.location.assign(url);
      else window.location.assign(url);
    } catch (error) {
      win?.close();
      setActionError(error instanceof Error ? error.message : "No se pudo abrir WhatsApp.");
    } finally {
      setProcessing(null);
    }
  };

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
            Elegí el corte que más te guste y, si querés, subí tu propio diseño y ubicalo donde quieras.
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
              <div className="grid sm:grid-cols-[minmax(200px,280px)_1fr] gap-6 items-start">
                {/* LIENZO: remera + diseño arrastrable */}
                <div>
                  <div
                    ref={mockupRef}
                    className="relative aspect-[4/5] w-full bg-neutral-900 rounded overflow-hidden select-none"
                  >
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover pointer-events-none" />
                    {designObjectUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={designObjectUrl}
                        alt="Tu diseño"
                        draggable={false}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={() => setDragging(false)}
                        className="absolute cursor-move touch-none drop-shadow-lg"
                        style={{
                          left: `${designPos.x}%`,
                          top: `${designPos.y}%`,
                          width: `${designScale}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    )}
                  </div>

                  <div className="mt-3">
                    <label className="inline-block text-xs border border-neutral-700 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">
                      {designObjectUrl ? "Cambiar diseño" : "Subir mi diseño"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleDesignFile(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {designObjectUrl && (
                      <button onClick={removeDesign} className="ml-3 text-xs text-neutral-400 underline hover:text-white cursor-pointer">
                        Quitar
                      </button>
                    )}
                    {designObjectUrl && (
                      <div className="mt-3">
                        <label className="text-[11px] text-neutral-400 uppercase tracking-wide">Tamaño del diseño</label>
                        <input
                          type="range"
                          min={10}
                          max={70}
                          value={designScale}
                          onChange={(e) => setDesignScale(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                        <p className="text-[11px] text-neutral-500">Arrastrá el diseño sobre la remera para ubicarlo.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* DATOS DE COMPRA */}
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

                  {actionError && <p className="text-sm text-red-400 mt-4">{actionError}</p>}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={handleAddToCart}
                      disabled={isSoldOut(product) || !selectedSize || processing !== null}
                      className="flex-1 bg-white text-black py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {processing === "cart" ? "Generando..." : added ? "¡Agregado! ✓" : "Agregar al carrito"}
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      disabled={processing !== null}
                      className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {processing === "whatsapp" ? "Generando..." : "Consultar por WhatsApp"}
                    </button>
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

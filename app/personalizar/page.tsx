"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { availableSizes, formatPrice, isSoldOut, type Product } from "@/lib/catalog-types";
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

// Tamaño del "lienzo" final (mismo aspecto panorámico que la foto: frente y dorso lado a lado).
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

interface DesignState {
  objectUrl: string | null;
  pos: { x: number; y: number };
  scale: number;
}

const emptyDesign = (): DesignState => ({ objectUrl: null, pos: { x: 50, y: 45 }, scale: 40 });

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar una de las imágenes."));
    img.src = src;
  });
}

function drawDesign(ctx: CanvasRenderingContext2D, img: HTMLImageElement, design: DesignState, offsetX: number, boxWidth: number) {
  const w = boxWidth * (design.scale / 100);
  const h = w * (img.naturalHeight / img.naturalWidth);
  const x = offsetX + boxWidth * (design.pos.x / 100) - w / 2;
  const y = CANVAS_HEIGHT * (design.pos.y / 100) - h / 2;
  ctx.drawImage(img, x, y, w, h);
}

/** Arma el PNG final: remera de frente y de dorso, cada una con su diseño si tiene. Null si ninguna tiene diseño. */
async function buildComposite(shirtSrc: string, front: DesignState, back: DesignState): Promise<Blob | null> {
  if (!front.objectUrl && !back.objectUrl) return null;

  const shirtImg = await loadImage(shirtSrc);
  const [frontImg, backImg] = await Promise.all([
    front.objectUrl ? loadImage(front.objectUrl) : Promise.resolve(null),
    back.objectUrl ? loadImage(back.objectUrl) : Promise.resolve(null),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo generar la imagen.");

  const halfW = CANVAS_WIDTH / 2;
  const srcHalfW = shirtImg.naturalWidth / 2;

  // Mitad izquierda de la foto = frente; mitad derecha = dorso.
  ctx.drawImage(shirtImg, 0, 0, srcHalfW, shirtImg.naturalHeight, 0, 0, halfW, CANVAS_HEIGHT);
  if (frontImg) drawDesign(ctx, frontImg, front, 0, halfW);

  ctx.drawImage(shirtImg, srcHalfW, 0, srcHalfW, shirtImg.naturalHeight, halfW, 0, halfW, CANVAS_HEIGHT);
  if (backImg) drawDesign(ctx, backImg, back, halfW, halfW);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen."))), "image/png")
  );
}

/** Una mitad de la remera (frente o dorso), con su propio diseño opcional para arrastrar y agrandar. */
function DesignSlot({
  label,
  cropSide,
  shirtSrc,
  design,
  onFile,
  onPos,
  onScale,
  onRemove,
}: {
  label: string;
  cropSide: "left" | "right";
  shirtSrc: string;
  design: DesignState;
  onFile: (file: File | undefined) => void;
  onPos: (pos: { x: number; y: number }) => void;
  onScale: (scale: number) => void;
  onRemove: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 text-center">{label}</p>
      <div ref={boxRef} className="relative aspect-[3/4] w-full bg-neutral-900 rounded overflow-hidden select-none">
        {/* Muestra solo la mitad que corresponde (frente o dorso) de la foto completa. */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`relative w-[200%] h-full ${cropSide === "left" ? "left-0" : "left-[-100%]"}`}>
            <Image src={shirtSrc} alt={label} fill className="object-contain" />
          </div>
        </div>
        {design.objectUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={design.objectUrl}
            alt={`Diseño ${label.toLowerCase()}`}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(false)}
            className="absolute cursor-move touch-none drop-shadow-lg"
            style={{
              left: `${design.pos.x}%`,
              top: `${design.pos.y}%`,
              width: `${design.scale}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>

      <div className="mt-3 flex flex-col items-center">
        <label className="inline-block text-xs border border-neutral-700 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">
          {design.objectUrl ? "Cambiar diseño" : `Diseño para el ${label.toLowerCase()}`}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {design.objectUrl && (
          <>
            <button onClick={onRemove} className="mt-2 text-xs text-neutral-400 underline hover:text-white cursor-pointer">
              Quitar
            </button>
            <div className="mt-3 w-full max-w-[220px]">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wide">Tamaño</label>
              <input
                type="range"
                min={15}
                max={70}
                value={design.scale}
                onChange={(e) => onScale(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CutDetail({
  cut,
  product,
  selectedSize,
  onSelectSize,
}: {
  cut: Cut;
  product: Product;
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
}) {
  const { addToCart } = useCart();
  const [front, setFront] = useState<DesignState>(emptyDesign);
  const [back, setBack] = useState<DesignState>(emptyDesign);
  const [added, setAdded] = useState(false);
  const [processing, setProcessing] = useState<"cart" | "whatsapp" | null>(null);
  const [actionError, setActionError] = useState("");

  // Libera la memoria de los blobs al reemplazar un diseño o salir de esta ficha.
  useEffect(() => {
    return () => {
      if (front.objectUrl) URL.revokeObjectURL(front.objectUrl);
    };
  }, [front.objectUrl]);
  useEffect(() => {
    return () => {
      if (back.objectUrl) URL.revokeObjectURL(back.objectUrl);
    };
  }, [back.objectUrl]);

  const handleFile = (side: "front" | "back") => (file: File | undefined) => {
    if (!file) return;
    setActionError("");
    const setSide = side === "front" ? setFront : setBack;
    setSide((prev) => {
      if (prev.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return { ...emptyDesign(), objectUrl: URL.createObjectURL(file) };
    });
  };

  const handleRemove = (side: "front" | "back") => () => {
    const setSide = side === "front" ? setFront : setBack;
    setSide((prev) => {
      if (prev.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return emptyDesign();
    });
  };

  // Genera el PNG final (remera + diseños ubicados) y lo sube; null si no hay ningún diseño.
  const buildAndUploadDesign = async (): Promise<string | null> => {
    const blob = await buildComposite(product.images[0], front, back);
    if (!blob) return null;

    const prepRes = await fetch("/api/personalizar/upload", { method: "POST" });
    const prepData = await prepRes.json().catch(() => ({}));
    if (!prepRes.ok) throw new Error(prepData.error || "No se pudo preparar la subida.");

    await uploadBlob(prepData.uploadUrl, blob);
    return prepData.publicUrl as string;
  };

  const handleAddToCart = async () => {
    if (!selectedSize) return;
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
      const message = `¡Hola! Quiero personalizar una remera.\n\nCorte: ${cut.label}${selectedSize ? `\nTalle: ${selectedSize}` : ""}${
        designUrl ? `\nDiseño: ${designUrl}` : ""
      }`;
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
    <div>
      {/* FRENTE Y DORSO POR SEPARADO: cada uno con su propio diseño opcional */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        <DesignSlot
          label="Frente"
          cropSide="left"
          shirtSrc={product.images[0]}
          design={front}
          onFile={handleFile("front")}
          onPos={(pos) => setFront((prev) => ({ ...prev, pos }))}
          onScale={(scale) => setFront((prev) => ({ ...prev, scale }))}
          onRemove={handleRemove("front")}
        />
        <DesignSlot
          label="Dorso"
          cropSide="right"
          shirtSrc={product.images[0]}
          design={back}
          onFile={handleFile("back")}
          onPos={(pos) => setBack((prev) => ({ ...prev, pos }))}
          onScale={(scale) => setBack((prev) => ({ ...prev, scale }))}
          onRemove={handleRemove("back")}
        />
      </div>
      <p className="text-[11px] text-neutral-500 mt-3 text-center">
        Podés poner diseño solo adelante, solo atrás, en los dos, o en ninguno.
      </p>

      {/* DATOS DE COMPRA */}
      <div className="mt-8 border-t border-neutral-900 pt-6">
        <h2 className="font-bebas text-2xl tracking-wider uppercase">{cut.label}</h2>
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
                  onClick={() => onSelectSize(size)}
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
  );
}

export default function PersonalizarPage() {
  const { products, loading } = useProducts();

  const [selectedCutKey, setSelectedCutKey] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const selectedCut = CUTS.find((c) => c.key === selectedCutKey) ?? null;
  const product = selectedCut ? products.find((p) => p.name === selectedCut.productName) : undefined;

  const selectCut = (key: string) => {
    setSelectedCutKey(key);
    setSelectedSize(null);
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
            Elegí el corte que más te guste y, si querés, subí tu propio diseño para adelante, para atrás, o los dos.
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
              // key: al cambiar de corte se reinicia todo el estado de diseño (no arrastra el de otro corte).
              <CutDetail key={product.id} cut={selectedCut} product={product} selectedSize={selectedSize} onSelectSize={setSelectedSize} />
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

"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import GuiaTallesModal from "@/components/GuiaTallesModal";

const PRODUCTS_DATA: Record<string, {
  id: string;
  name: string;
  price: number;
  description: string;
  details: string[];
  sizes: string[];
  images: string[];
}> = {
  "1": {
    id: "1",
    name: "REMERA 777 WHITE",
    price: 35000,
    description: "Confeccionada en algodón jersey 24/1 de pesado gramaje. Mantiene la forma y estructura con una caída boxy fit ideal para la cultura streetwear.",
    details: [
      "100% Algodón Jersey Heavyweight 240g",
      "Estampa en serigrafía frente y espalda",
      "Corte Boxy / Oversized Fit",
      "Lavar con agua fría y del revés"
    ],
    sizes: ["S", "M", "L", "XL"],
    images: ["/remera777.jpg", "/remera777hover.jpg"]
  },
  "2": {
    id: "2",
    name: "REMERA BLK7 BLACK",
    price: 68000,
    description: "Buzo de frisa invisible pesada con capucha de doble tela y bolsillo canguro. Diseñado para ofrecer máxima durabilidad y confort térmico.",
    details: [
      "Frisa invisible pesada 80/20",
      "Bordado de alta densidad en el pecho",
      "Puños y cintura de morley reinforced",
      "Corte Relaxed Fit"
    ],
    sizes: ["M", "L", "XL"],
    images: ["/remerablk7.jpg", "/remerablk7hover.jpg"]
  },
  "3": {
    id: "3",
    name: "CONJUNTO BLK 777",
    price: 68000,
    description: "Buzo de frisa invisible pesada con capucha de doble tela y bolsillo canguro. Diseñado para ofrecer máxima durabilidad y confort térmico.",
    details: [
      "Frisa invisible pesada 80/20",
      "Bordado de alta densidad en el pecho",
      "Puños y cintura de morley reinforced",
      "Corte Relaxed Fit"
    ],
    sizes: ["M", "L", "XL"],
    images: ["/conjuntoblk777.jpg", "/conjuntoblk777hover.jpg"]
  },
  "4": {
    id: "4",
    name: "CAMPERA BLK 77",
    price: 68000,
    description: "Buzo de frisa invisible pesada con capucha de doble tela y bolsillo canguro. Diseñado para ofrecer máxima durabilidad y confort térmico.",
    details: [
      "Frisa invisible pesada 80/20",
      "Bordado de alta densidad en el pecho",
      "Puños y cintura de morley reinforced",
      "Corte Relaxed Fit"
    ],
    sizes: ["M", "L", "XL"],
    images: ["/camperablk77.jpg", "/camperablk77hover.jpg"]
  },
  "5": {
    id: "5",
    name: "CAMPERA BLACKSEVEN 77",
    price: 68000,
    description: "Buzo de frisa invisible pesada con capucha de doble tela y bolsillo canguro. Diseñado para ofrecer máxima durabilidad y confort térmico.",
    details: [
      "Frisa invisible pesada 80/20",
      "Bordado de alta densidad en el pecho",
      "Puños y cintura de morley reinforced",
      "Corte Relaxed Fit"
    ],
    sizes: ["M", "L", "XL"],
    images: ["/camperablackseven77.jpg", "/camperablackseven77hover.jpg"]
  },
  "6": {
    id: "6",
    name: "BUZO BLACKSEVEN 77",
    price: 68000,
    description: "Buzo de frisa invisible pesada con capucha de doble tela y bolsillo canguro. Diseñado para ofrecer máxima durabilidad y confort térmico.",
    details: [
      "Frisa invisible pesada 80/20",
      "Bordado de alta densidad en el pecho",
      "Puños y cintura de morley reinforced",
      "Corte Relaxed Fit"
    ],
    sizes: ["M", "L", "XL"],
    images: ["/buzoblackseven77_1.jpg", "/buzoblackseven77hover.jpg", "/buzoblackseven77_2.jpg", "/buzoblackseven77_3.jpg"]
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  
  const product = PRODUCTS_DATA[productId] || PRODUCTS_DATA["1"];
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [isGuiaOpen, setIsGuiaOpen] = useState<boolean>(false);

  // Estados de Zoom
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Ref para calcular gestos en móviles
  const lastTapRef = useRef<number>(0);

  const activeImage = selectedImage ?? product.images[0] ?? "/remera777.jpg";
  const activeSize = selectedSize ?? product.sizes[0] ?? "M";

  const { addToCart } = useCart();

  // MANEJADOR DE EVENTOS DE MOUSE Y TOUCH
  const updateZoomCoords = (clientX: number, clientY: number, currentTarget: HTMLDivElement) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    // Posición porcentual para la propiedad transformOrigin
    const x = Math.max(0, Math.min(100, ((clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - top) / height) * 100));
    setZoomPosition({ x, y });

    // Coordenadas en píxeles para la lente táctica
    setCursorPos({
      x: clientX - left,
      y: clientY - top
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateZoomCoords(e.clientX, e.clientY, e.currentTarget);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms

    // Detección de Doble Tap en celis
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setIsZoomed((prev) => !prev);
    } else {
      // Tap simple / Inicio de arrastre
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        updateZoomCoords(touch.clientX, touch.clientY, e.currentTarget);
        setIsZoomed(true);
      }
    }
    lastTapRef.current = now;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isZoomed) {
      const touch = e.touches[0];
      updateZoomCoords(touch.clientX, touch.clientY, e.currentTarget);
    }
  };

  const handleTouchEnd = () => {
    // Si no fue doble tap sostenido, se desactiva al soltar
    // Si preferís que se mantenga fijo tras tocar, podés quitar esta línea.
    setIsZoomed(false);
  };

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: `$${product.price.toLocaleString("es-AR")}`,
      size: activeSize,
      img: activeImage,
    });
    
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20 px-4 md:px-6 font-montserrat">
      <div className="max-w-7xl mx-auto">
        
        {/* BREADCRUMB */}
        <nav className="text-xs text-neutral-500 mb-8 flex items-center gap-2 uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/" className="hover:text-white transition-colors">Colección</Link>
          <span>/</span>
          <span className="text-neutral-300 font-semibold">{product.name}</span>
        </nav>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            
            {/* THUMBNAILS */}
            <div className="flex md:flex-col gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-20 md:w-20 md:h-24 border ${
                    activeImage === img ? "border-red-600" : "border-neutral-800"
                  } bg-neutral-950 overflow-hidden flex-shrink-0 transition-all cursor-pointer`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* IMAGEN PRINCIPAL CON ZOOM PRO Y TOUCH CONTROLS */}
            <div
              className={`relative w-full aspect-[3/4] bg-neutral-950 border transition-all duration-300 rounded-sm overflow-hidden select-none touch-none cursor-none ${
                isZoomed 
                  ? "border-red-600/60 shadow-[0_0_25px_rgba(220,38,38,0.3)]" 
                  : "border-neutral-900"
              }`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className={`object-cover transition-transform duration-150 ease-out ${
                  isZoomed ? "scale-[2.3]" : "scale-100"
                }`}
                style={{
                  transformOrigin: isZoomed
                    ? `${zoomPosition.x}% ${zoomPosition.y}%`
                    : "center center",
                }}
              />

              {/* CARTEL INDICADOR DE TOUCH/HOVER (DESAPARECE AL AMPLIAR) */}
              <div 
                className={`absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-neutral-300 border border-neutral-800 rounded pointer-events-none flex items-center gap-1.5 transition-opacity duration-300 ${
                  isZoomed ? "opacity-0" : "opacity-100"
                }`}
              >
                <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                <span className="hidden md:inline">Hover para Zoom</span>
                <span className="inline md:hidden">Mantén o Toca 2 veces</span>
              </div>

              {/* MIRA TÁCTICA Y LENTE FLOTANTE */}
              {isZoomed && (
                <>
                  {/* Lente flotante centrada en el dedo/mouse */}
                  <div
                    className="absolute w-16 h-16 border border-red-500/60 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(255,0,0,0.4)] bg-red-600/10"
                    style={{
                      left: `${cursorPos.x}px`,
                      top: `${cursorPos.y}px`,
                    }}
                  />

                  {/* Visor táctico de esquinas */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-red-600/80 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-red-600/80 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-red-600/80 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-red-600/80 pointer-events-none" />
                </>
              )}
            </div>

          </div>

          {/* COLUMNA DERECHA: DETALLES Y COMPRA */}
          <div className="flex flex-col gap-6">
            
            <div>
              <span className="text-xs font-bold text-red-600 tracking-widest uppercase">EDICIÓN LIMITADA</span>
              <h1 className="text-3xl font-black font-bebas tracking-wide mt-1 uppercase text-white">
                {product.name}
              </h1>
              <p className="text-2xl font-bold mt-2 text-neutral-200">
                ${product.price.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-neutral-500 mt-1">3 y 6 cuotas sin interés en toda la web</p>
            </div>

            <hr className="border-neutral-900" />

            {/* SELECTOR DE TALLES */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Talle:</span>
                <button 
                  type="button"
                  onClick={() => setIsGuiaOpen(true)}
                  className="text-xs text-neutral-400 underline hover:text-white transition-colors cursor-pointer"
                >
                  Guía de talles
                </button>
              </div>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 text-sm font-bold border transition-all cursor-pointer ${
                      activeSize === size
                        ? "bg-white text-black border-white"
                        : "bg-black text-neutral-400 border-neutral-800 hover:border-neutral-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CANTIDAD Y BOTÓN AGREGAR */}
            <div className="flex gap-4 pt-2">
              <div className="flex items-center border border-neutral-800 bg-neutral-950">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-sm text-neutral-400 hover:text-white cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-3 text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-sm text-neutral-400 hover:text-white cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 font-bebas tracking-wider text-lg py-3 px-6 transition-all uppercase cursor-pointer ${
                  addedAnimation
                    ? "bg-green-600 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {addedAnimation ? "✓ AGREGADO AL CARRITO" : "AGREGAR AL CARRITO"}
              </button>
            </div>

            {/* DESCRIPCIÓN Y ESPECIFICACIONES */}
            <div className="mt-4 flex flex-col gap-4 text-xs text-neutral-400 leading-relaxed">
              <p>{product.description}</p>

              <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-sm">
                <h4 className="font-bold text-white uppercase tracking-wider mb-2">Detalles del Producto</h4>
                <ul className="list-disc list-inside flex flex-col gap-1 text-neutral-400">
                  {product.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL GUÍA DE TALLES */}
      <GuiaTallesModal
        isOpen={isGuiaOpen}
        onClose={() => setIsGuiaOpen(false)}
      />
    </div>
  );
}
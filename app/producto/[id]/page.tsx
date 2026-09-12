"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

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
    name: "REMERA OVERSIZED HEAVYWEIGHT BLACK",
    price: 35000,
    description: "Confeccionada en algodón jersey 24/1 de pesado gramaje. Mantiene la forma y estructura con una caída boxy fit ideal para la cultura streetwear.",
    details: [
      "100% Algodón Jersey Heavyweight 240g",
      "Estampa en serigrafía frente y espalda",
      "Corte Boxy / Oversized Fit",
      "Lavar con agua fría y del revés"
    ],
    sizes: ["S", "M", "L", "XL"],
    images: ["/remera1.jpg", "/remera2.jpg"]
  },
  "2": {
    id: "2",
    name: "HOODIE HEAVYWEIGHT DARK RED",
    price: 68000,
    description: "Buzo de frisa invisible pesada con capucha de doble tela y bolsillo canguro. Diseñado para ofrecer máxima durabilidad y confort térmico.",
    details: [
      "Frisa invisible pesada 80/20",
      "Bordado de alta densidad en el pecho",
      "Puños y cintura de morley reforzado",
      "Corte Relaxed Fit"
    ],
    sizes: ["M", "L", "XL"],
    images: ["/remera2.jpg", "/remera1.jpg"]
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  
  const product = PRODUCTS_DATA[productId] || PRODUCTS_DATA["1"];
  
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "M");
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || "/remera1.jpg");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: Number(product.id),
      name: product.name,
      price: `$${product.price.toLocaleString("es-AR")}`,
      size: selectedSize,
      img: selectedImage,
    });
    
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20 px-6 font-montserrat">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            
            {/* THUMBNAILS */}
            <div className="flex md:flex-col gap-3 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 border ${
                    selectedImage === img ? "border-red-600" : "border-neutral-800"
                  } bg-neutral-950 overflow-hidden flex-shrink-0 transition-all`}
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

            {/* IMAGEN PRINCIPAL */}
            <div className="relative w-full aspect-[3/4] bg-neutral-950 border border-neutral-900 rounded-sm overflow-hidden">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
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
                <button className="text-xs text-neutral-400 underline hover:text-white transition-colors">
                  Guía de talles
                </button>
              </div>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 text-sm font-bold border transition-all ${
                      selectedSize === size
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
                  className="px-4 py-3 text-sm text-neutral-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-4 py-3 text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-sm text-neutral-400 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 font-bebas tracking-wider text-lg py-3 px-6 transition-all uppercase ${
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
    </div>
  );
}
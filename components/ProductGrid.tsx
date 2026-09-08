"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";

const PRODUCTS = [
  { id: 1, name: "777 White", price: "$25.000", tag: "NEW",  img: "/remera2.jpg" },
  { id: 2, name: "BLK 7 Black", price: "$25.000", tag: "HOT", img: "/remera3.jpg" },
  { id: 3, name: "Conjunto BLK 777", price: "$55.000", tag: "DROP", img: "/conjunto1.jpg" },
  { id: 4, name: "Tee Oversize Star", price: "$28.000", tag: "NEW", img: "/campera1.jpg" },
];

const SIZES = ["S", "M", "L", "XL"];

export default function ProductGrid() {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <section id="coleccion" className="py-24 bg-black px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="font-bebas text-5xl text-white tracking-wide">PRODUCTOS DESTACADOS</h2>
          <p className="text-neutral-500 font-montserrat text-xs tracking-widest uppercase">Drops de edición limitada</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
  {PRODUCTS.map((product) => {
    const currentSize = selectedSizes[product.id] || "M";

    return (
      <div 
        key={product.id} 
        className="group relative bg-neutral-950 border border-neutral-900 overflow-hidden hover:border-red-600 transition-colors duration-300 flex flex-col justify-between h-full"
      >
        <span className="absolute top-3 left-3 z-10 bg-red-600 text-white font-bebas text-xs px-2 py-0.5 tracking-wider">
          {product.tag}
        </span>

        {/* 1. Usamos una proporción fija 3/4 y 'object-cover' o 'object-contain' para forzar que todas las imágenes ocupen la misma altura */}
        <div className="relative aspect-[3/4] w-full bg-black overflow-hidden flex items-center justify-center">
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* 2. Flex-1 y min-h para que la parte de abajo de la tarjeta siempre mida lo mismo */}
        <div className="p-4 bg-neutral-950 relative z-10 flex flex-col justify-between flex-1">
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wider line-clamp-1 min-h-[32px]">
              {product.name}
            </h3>
            <p className="font-montserrat text-sm text-neutral-300 font-semibold mb-3">
              {product.price}
            </p>
          </div>

          <div>
            {/* Seleccionar Talle */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-neutral-500 font-montserrat uppercase">Talle:</span>
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(product.id, size)}
                  className={`px-2 py-0.5 text-xs font-bebas border transition-colors ${
                    currentSize === size
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-neutral-800 text-neutral-400 hover:border-neutral-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              onClick={() => addToCart({ ...product, size: currentSize })}
              className="w-full text-xs font-bebas tracking-widest bg-white text-black py-2 hover:bg-red-600 hover:text-white transition-colors uppercase"
            >
              Agregar a la bolsa
            </button>
          </div>
        </div>
      </div>
    );
  })}
</div>
    </section>
  );
}
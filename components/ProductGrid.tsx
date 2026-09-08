"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductGrid() {
  const { addToCart } = useCart();
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);

  const PRODUCTS = [
    { 
      id: 1, 
      name: "777 White", 
      price: "$25.000", 
      tag: "NEW", 
      img: "/remera2.jpg",
      imgHover: "/remera1.jpg"
    },
    { 
      id: 2, 
      name: "BLK 7 Black", 
      price: "$25.000", 
      tag: "HOT", 
      img: "/remera3.jpg",
      imgHover: "/campera1.jpg"
    },
    { 
      id: 3, 
      name: "Conjunto BLK 777", 
      price: "$55.000", 
      tag: "DROP", 
      img: "/conjunto1.jpg",
      imgHover: "/remera2.jpg"
    },
    { 
      id: 4, 
      name: "Tee Oversize Star", 
      price: "$28.000", 
      tag: "NEW", 
      img: "/campera1.jpg",
      imgHover: "/remera3.jpg"
    },
  ];

  return (
    <div className="bg-black text-white px-6 py-12">
      <h2 className="text-3xl font-black tracking-tighter uppercase mb-10 text-center">
        Lo Último
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {PRODUCTS.map((product) => (
          <div 
            key={product.id} 
            className="group relative flex flex-col h-full bg-neutral-950 border border-neutral-900 rounded-lg overflow-hidden transition-all duration-300 hover:border-neutral-700"
            onMouseEnter={() => setHoveredProductId(product.id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            {/* TAG */}
            {product.tag && (
              <span className="absolute top-3 left-3 bg-white text-black font-extrabold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                {product.tag}
              </span>
            )}
            
            {/* IMAGEN CON HOVER */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
              <img
                src={hoveredProductId === product.id ? product.imgHover : product.img}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              />
            </div>
            
            {/* DETALLES */}
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Black Seven</p>
              <h3 className="text-sm font-bold tracking-tight mb-2 flex-grow line-clamp-2">
                {product.name}
              </h3>
              <p className="text-lg font-black tracking-tighter mb-4 text-white">
                {product.price}
              </p>
              
              <button
                onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, size: "M", img: product.img })}
                className="w-full bg-white text-black py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
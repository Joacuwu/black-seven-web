"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function ProductGrid() {
  const { addToCart } = useCart();
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);

  const PRODUCTS = [
    { 
      id: 1, 
      name: "777 White", 
      price: "$25.000", 
      tag: "NEW", 
      img: "/remera777.jpg",
      imgHover: "/remera777hover.jpg"
    },
    { 
      id: 2, 
      name: "BLK 7 Black", 
      price: "$25.000", 
      tag: "HOT", 
      img: "/remerablk7.jpg",
      imgHover: "/remerablk7hover.jpg"
    },
    { 
      id: 3, 
      name: "CONJUNTO BLK 777", 
      price: "$55.000", 
      tag: "DROP", 
      img: "/conjuntoblk777.jpg",
      imgHover: "/conjuntoblk777hover.jpg"
    },
    { 
      id: 4, 
      name: "CAMPERA BLK 77", 
      price: "$25.000", 
      tag: "NEW", 
      img: "/camperablk77.jpg",
      imgHover: "/camperablk77hover.jpg"
    },
    { 
      id: 5, 
      name: "CAMPERA BLACKSEVEN 77", 
      price: "$25.000", 
      tag: "GOD", 
      img: "/camperablackseven77_1.jpg",
      imgHover: "/camperablackseven77_1hover.jpg"
    },
    { 
      id: 4, 
      name: "CAMPERA BLK 77", 
      price: "$25.000", 
      tag: "NEW", 
      img: "/camperablk77.jpg",
      imgHover: "/camperablk77hover.jpg"
    },
    { 
      id: 4, 
      name: "CAMPERA BLK 77", 
      price: "$25.000", 
      tag: "NEW", 
      img: "/camperablk77.jpg",
      imgHover: "/camperablk77hover.jpg"
    },
    { 
      id: 4, 
      name: "CAMPERA BLK 77", 
      price: "$25.000", 
      tag: "NEW", 
      img: "/camperablk77.jpg",
      imgHover: "/camperablk77hover.jpg"
    },
  ];

  return (
    <section className="relative z-10 bg-black text-white px-6 py-16 md:py-24 font-montserrat">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-wider uppercase mb-12 text-center font-bebas">
          Lo Último
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="group relative flex flex-col h-full bg-neutral-950 border border-neutral-900 rounded-lg overflow-hidden transition-all duration-300 hover:border-neutral-700"
              onMouseEnter={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              {/* LINK QUE ENVOLVERÁ IMAGEN Y TÍTULO */}
              <Link href={`/producto/${product.id}`} className="flex flex-col flex-grow">
                
                {/* TAG */}
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-white text-black font-extrabold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                    {product.tag}
                  </span>
                )}
                
                {/* IMAGEN CON HOVER SUAVE */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className={`object-cover transition-opacity duration-500 ${
                      hoveredProductId === product.id ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <Image
                    src={product.imgHover}
                    alt={`${product.name} hover`}
                    fill
                    className={`object-cover transition-opacity duration-500 absolute top-0 left-0 ${
                      hoveredProductId === product.id ? "opacity-100 scale-105" : "opacity-0"
                    }`}
                  />
                </div>
                
                {/* DETALLES DE PRODUCTO */}
                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1 font-semibold">Black Seven</p>
                  <h3 className="text-sm font-bold tracking-tight mb-2 flex-grow line-clamp-2 group-hover:text-neutral-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-black tracking-tighter text-white">
                    {product.price}
                  </p>
                </div>
              </Link>

              {/* BOTÓN MANTENIDO FUERA DEL LINK */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, size: "M", img: product.img })}
                  className="w-full bg-white text-black py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Agregar al Carrito
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import { categoryLabel } from "@/lib/catalog-types";

export default function Navbar() {
  const [isColeccionOpen, setIsColeccionOpen] = useState(false);
  const [isDropsOpen, setIsDropsOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const { products } = useProducts();

  // Categorías y etiquetas salen de los productos cargados en el panel.
  const categories = [...new Set(products.map((p) => p.category))];
  const tags = [...new Set(products.map((p) => p.tag).filter((t): t is string => Boolean(t)))];
  const dropdownItem = "px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase";

  return (
    <nav className="bg-black text-white px-4 md:px-8 py-3 flex justify-between items-center border-b border-neutral-800 relative z-40">
      
      {/* LOGO EN IMAGEN AGRANDADO */}
      <Link href="/" className="flex items-center py-1 shrink-0">
        <Image
          src="/logo.png"
          alt="BLACK SEVEN Logo"
          width={280}
          height={70}
          className="h-12 md:h-16 w-auto object-contain transition-transform hover:scale-105"
          priority
        />
      </Link>

      {/* MENÚ DE NAVEGACIÓN */}
      <div className="flex gap-4 md:gap-8 items-center font-medium text-xs sm:text-sm tracking-wide whitespace-nowrap">
        
        {/* DROPDOWN: COLECCIÓN */}
        <div 
          className="relative py-2 cursor-pointer"
          onMouseEnter={() => setIsColeccionOpen(true)}
          onMouseLeave={() => setIsColeccionOpen(false)}
        >
          <Link href="/coleccion" className="inline-block py-3 hover:text-neutral-400 transition-colors uppercase">
            Colección
          </Link>

          {isColeccionOpen && (
            <div className="absolute top-full left-0 w-52 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl py-2 flex flex-col z-50">
              <Link 
                href="/coleccion" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase font-bold border-b border-neutral-800/60 pb-2 mb-1"
              >
                Ver Todo
              </Link>
              {categories.map((category) => (
                <Link key={category} href={`/coleccion?categoria=${encodeURIComponent(category)}`} onClick={() => setIsColeccionOpen(false)} className={dropdownItem}>
                  {categoryLabel(category)}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* DROPS: una entrada por etiqueta (NEW, HOT, DROP...) */}
        {tags.length > 0 ? (
          <div
            className="relative py-2 cursor-pointer"
            onMouseEnter={() => setIsDropsOpen(true)}
            onMouseLeave={() => setIsDropsOpen(false)}
          >
            <button type="button" onClick={() => setIsDropsOpen((open) => !open)} className="py-3 hover:text-neutral-400 transition-colors uppercase cursor-pointer">
              Drops
            </button>

            {isDropsOpen && (
              <div className="absolute top-full right-0 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl py-2 flex flex-col z-50">
                {tags.map((tag) => (
                  <Link key={tag} href={`/coleccion?etiqueta=${encodeURIComponent(tag)}`} onClick={() => setIsDropsOpen(false)} className={dropdownItem}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link href="/coleccion" className="inline-block py-3 hover:text-neutral-400 transition-colors uppercase">
            Drops
          </Link>
        )}

        {/* SEGUIMIENTO DE PEDIDO */}
        <Link href="/seguimiento" className="inline-block py-3 hover:text-neutral-400 transition-colors uppercase">
          Mi pedido
        </Link>

        {/* ÍCONO DEL CARRITO */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 hover:text-neutral-400 transition-colors cursor-pointer"
          aria-label="Carrito de compras"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

      </div>
    </nav>
  );
}
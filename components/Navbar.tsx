"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isColeccionOpen, setIsColeccionOpen] = useState(false);
  const [isDropsOpen, setIsDropsOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();

  return (
    <nav className="bg-black text-white px-4 md:px-8 py-3 flex justify-between items-center border-b border-neutral-800 relative z-40">
      
      {/* LOGO EN IMAGEN AGRANDADO */}
      <Link href="/" className="flex items-center py-1">
        <Image
          src="/logo.png"
          alt="BLACK SEVEN Logo"
          width={280}
          height={70}
          className="h-14 md:h-16 w-auto object-contain transition-transform hover:scale-105"
          priority
        />
      </Link>

      {/* MENÚ DE NAVEGACIÓN */}
      <div className="flex gap-6 md:gap-8 items-center font-medium text-sm tracking-wide">
        
        {/* DROPDOWN: COLECCIÓN */}
        <div 
          className="relative py-2 cursor-pointer"
          onMouseEnter={() => setIsColeccionOpen(true)}
          onMouseLeave={() => setIsColeccionOpen(false)}
        >
          <Link href="/coleccion" className="hover:text-neutral-400 transition-colors uppercase">
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
              <Link 
                href="/coleccion?categoria=remeras" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase"
              >
                Remeras & Tees
              </Link>
              <Link 
                href="/coleccion?categoria=hoodies" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase"
              >
                Buzos & Hoodies
              </Link>
              <Link 
                href="/coleccion?categoria=conjuntos" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase"
              >
                Conjuntos
              </Link>
              <Link 
                href="/coleccion?categoria=pantalones" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase"
              >
                Pantalones
              </Link>
            </div>
          )}
        </div>

        {/* DROPDOWN: DROPS */}
        <div 
          className="relative py-2 cursor-pointer"
          onMouseEnter={() => setIsDropsOpen(true)}
          onMouseLeave={() => setIsDropsOpen(false)}
        >
          <span className="hover:text-neutral-400 transition-colors uppercase">
            Drops
          </span>

          {isDropsOpen && (
            <div className="absolute top-full right-0 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl py-2 flex flex-col z-50">
              <Link 
                href="/coleccion?categoria=drop-01" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors flex justify-between items-center uppercase"
              >
                <span>DROP #01</span>
                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">HOT</span>
              </Link>
              <Link 
                href="/coleccion" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase"
              >
                Edición Limitada
              </Link>
              <Link 
                href="/coleccion" 
                className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors uppercase"
              >
                Próximos Lanzamientos
              </Link>
            </div>
          )}
        </div>

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
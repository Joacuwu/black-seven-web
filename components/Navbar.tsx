"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isColeccionOpen, setIsColeccionOpen] = useState(false);
  const [isDropsOpen, setIsDropsOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();

  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center relative z-50 border-b border-neutral-800">
      {/* LOGO */}
      <Link href="/" className="text-2xl font-black tracking-tighter">
        BLACK SEVEN
      </Link>

      {/* MENÚ DE NAVEGACIÓN */}
      <div className="flex gap-8 items-center font-medium text-sm tracking-wide">
        
        {/* DROPDOWN: COLECCIÓN */}
        <div 
          className="relative py-2 cursor-pointer"
          onMouseEnter={() => setIsColeccionOpen(true)}
          onMouseLeave={() => setIsColeccionOpen(false)}
        >
          <span className="hover:text-neutral-400 transition-colors uppercase">
            Colección
          </span>

          {isColeccionOpen && (
            <div className="absolute top-full left-0 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl py-2 flex flex-col z-50">
              <Link href="/coleccion/remeras" className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors">
                Remeras & Tees
              </Link>
              <Link href="/coleccion/hoodies" className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors">
                Buzos & Hoodies
              </Link>
              <Link href="/coleccion/conjuntos" className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors">
                Conjuntos
              </Link>
              <Link href="/coleccion/pantalones" className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors">
                Pantalones
              </Link>
            </div>
          )}
        </div>

        {/* DROPDOWN: DROPS (Alineado a la derecha para no cortarse) */}
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
              <Link href="/drops/drop-01" className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors flex justify-between items-center">
                <span>DROP #01</span>
                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">HOT</span>
              </Link>
              <Link href="/drops/edicion-limitada" className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors">
                Edición Limitada
              </Link>
              <Link href="/drops/proximamente" className="px-4 py-2 hover:bg-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors">
                Próximos Lanzamientos
              </Link>
            </div>
          )}
        </div>

        {/* ÍCONO DEL CARRITO */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 hover:text-neutral-400 transition-colors"
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
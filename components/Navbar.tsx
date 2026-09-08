"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isColeccionOpen, setIsColeccionOpen] = useState(false);
  const [isDropsOpen, setIsDropsOpen] = useState(false);

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
            <div className="absolute top-full left-0 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl py-2 flex flex-col">
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
            <div className="absolute top-full left-0 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl py-2 flex flex-col">
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

      </div>
    </nav>
  );
}
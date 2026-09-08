"use client";

import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button className="md:hidden text-white hover:text-red-600">
          <Menu size={24} />
        </button>

        <Link href="/" className="font-bebas text-3xl sm:text-4xl tracking-widest text-white hover:text-red-600 transition-colors">
          BLACK SEVEN
        </Link>

        <nav className="hidden md:flex items-center space-x-8 font-montserrat text-xs tracking-widest uppercase text-neutral-400">
          <Link href="#coleccion" className="hover:text-white transition-colors">Colección</Link>
          <Link href="#coleccion" className="hover:text-white transition-colors">Drops</Link>
        </nav>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-white hover:text-red-600 transition-colors"
        >
          <ShoppingBag size={22} />
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white font-bebas text-xs px-1.5 py-0.5 rounded-full">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
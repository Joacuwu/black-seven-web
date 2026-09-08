"use client";

import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import CartDrawer from "../components/CartDrawer";

export default function Home() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <Hero />
        <ProductGrid />
        <CartDrawer />
        
        <footer className="border-t border-neutral-900 py-12 text-center text-neutral-600 font-montserrat text-xs">
          <p>© {new Date().getFullYear()} BLACK SEVEN. Todos los derechos reservados.</p>
        </footer>
      </main>
    </CartProvider>
  );
}
"use client";

import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ProductGrid />
      <CartDrawer />
      <Footer />
    </main>
  );
}
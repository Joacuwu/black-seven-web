"use client";

import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ProductGrid />
      <Footer />
    </main>
  );
}
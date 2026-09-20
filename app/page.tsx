"use client";

import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/footer";
import FAQ from "@/components/FAQ";
import HowToBuy from "@/components/HowToBuy";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <ProductGrid />
      
      {/* CÓMO COMPRAR (paso a paso) */}
      <HowToBuy />

      {/* SECCIÓN DE PREGUNTAS FRECUENTES */}
      <FAQ />
      
      {/* FOOTER AL FINAL */}
      <Footer />
    </main>
  );
}
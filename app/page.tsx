import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/footer";
import FAQ from "@/components/FAQ";
import HowToBuy from "@/components/HowToBuy";
import { getCachedHero } from "@/lib/hero-cache";
import { FALLBACK_HERO } from "@/lib/hero-types";

export default async function Home() {
  // Si la base de datos no responde, se muestra la portada de respaldo.
  const hero = await getCachedHero().catch(() => FALLBACK_HERO);

  return (
    <main className="min-h-screen bg-black text-white">
      <Hero slides={hero.slides} showProducts={hero.showProducts} />
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
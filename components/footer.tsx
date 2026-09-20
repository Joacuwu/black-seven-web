"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { categoryLabel } from "@/lib/catalog-types";

export default function Footer() {
  const { products } = useProducts();
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <footer className="bg-black text-white border-t border-neutral-800 pt-16 pb-8 px-6 font-montserrat">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-900">
        
        {/* COLUMNA 1: MARCA Y MANIFIESTO */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-black tracking-tighter font-bebas">BLACK SEVEN</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Streetwear & Underground Culture. Drops exclusivos de edición limitada diseñados para marcar la diferencia.
          </p>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN RÁPIDA */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Colección</h4>
          <ul className="flex flex-col gap-2 text-xs text-neutral-400">
            <li><Link href="/coleccion" className="hover:text-white transition-colors">Ver todo</Link></li>
            {categories.map((category) => (
              <li key={category}>
                <Link href={`/coleccion?categoria=${encodeURIComponent(category)}`} className="hover:text-white transition-colors">
                  {categoryLabel(category)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMNA 3: AYUDA Y CONTACTO */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Ayuda</h4>
          <ul className="flex flex-col gap-2 text-xs text-neutral-400">
            <li><Link href="/seguimiento" className="hover:text-white transition-colors">Seguimiento de Pedido</Link></li>
            <li><Link href="/#preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
            <li><a href="https://wa.me/5491127035976" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contacto por WhatsApp</a></li>
          </ul>
        </div>

        {/* COLUMNA 4: COMUNIDAD / REDES */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Comunidad</h4>
          <p className="text-xs text-neutral-400">Seguinos en nuestras redes para no perderte ningún Drop.</p>
          <div className="flex gap-4 pt-1">
            <a href="https://www.instagram.com/black.sevenn7/" target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-300 hover:text-white uppercase tracking-wider underline">
              Instagram
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-300 hover:text-white uppercase tracking-wider underline">
              TikTok
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER INFERIOR: MEDIOS DE PAGO Y COPYRIGHT */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} BLACK SEVEN. Todos los derechos reservados.</p>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-neutral-400">
          <span>Naranja X</span>
          <span>•</span>
          <span>Tarjetas de Crédito / Débito</span>
          <span>•</span>
          <span>Efectivo</span>
        </div>
      </div>
    </footer>
  );
}
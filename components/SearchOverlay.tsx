"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { categoryLabel, formatPrice } from "@/lib/catalog-types";

const MAX_RESULTS = 6;

/** Minúsculas y sin tildes, para que "campera" encuentre "CAMPERA" y "remeras" encuentre "Remeras". */
export const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { products } = useProducts();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Al abrir: foco en el buscador, sin scroll de fondo, y Escape cierra.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const results = useMemo(() => {
    const term = normalizeText(query);
    if (!term) return [];
    return products.filter((p) => normalizeText(`${p.name} ${p.category} ${p.tag ?? ""}`).includes(term));
  }, [products, query]);

  const close = () => {
    setQuery("");
    onClose();
  };

  const goToAll = () => {
    const term = query.trim();
    if (!term) return;
    close();
    router.push(`/coleccion?buscar=${encodeURIComponent(term)}`);
  };

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar productos"
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={close} />

      <div className="relative bg-black border-b border-neutral-800 max-h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToAll();
            }}
            className="flex items-center gap-3 border-b border-neutral-700 focus-within:border-white transition-colors"
          >
            <Search size={20} className="text-neutral-500 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar remeras, buzos, camperas..."
              aria-label="Buscar"
              autoComplete="off"
              className="flex-1 bg-transparent py-3 text-base text-white placeholder-neutral-600 outline-none"
            />
            <button type="button" onClick={close} aria-label="Cerrar buscador" className="p-2 -mr-2 text-neutral-400 hover:text-white cursor-pointer">
              <X size={22} strokeWidth={1.5} />
            </button>
          </form>

          {/* Sin escribir nada: atajos a las categorías */}
          {!query.trim() && categories.length > 0 && (
            <div className="py-5">
              <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 mb-3">Categorías</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/coleccion?categoria=${encodeURIComponent(category)}`}
                    onClick={close}
                    className="px-4 py-2.5 border border-neutral-800 text-xs tracking-[0.15em] uppercase text-neutral-300 hover:border-white hover:text-white transition-colors"
                  >
                    {categoryLabel(category)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <p className="py-8 text-sm text-neutral-500 text-center">No encontramos nada para “{query.trim()}”. Probá con otra palabra.</p>
          )}

          {results.length > 0 && (
            <ul className="py-2">
              {results.slice(0, MAX_RESULTS).map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/producto/${product.id}`}
                    onClick={close}
                    className="flex items-center gap-4 py-3 border-b border-neutral-900 hover:bg-neutral-950 transition-colors"
                  >
                    <div className="relative w-14 h-[4.5rem] bg-neutral-900 flex-shrink-0 overflow-hidden">
                      {product.images[0] && <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm uppercase truncate">{product.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{categoryLabel(product.category)}</p>
                    </div>
                    <p className="ml-auto font-bold text-sm flex-shrink-0">{formatPrice(product.price)}</p>
                  </Link>
                </li>
              ))}
              {results.length > MAX_RESULTS && (
                <li>
                  <button onClick={goToAll} className="w-full py-4 text-xs tracking-[0.15em] uppercase text-neutral-300 hover:text-white cursor-pointer">
                    Ver los {results.length} resultados
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { useFavorites } from "@/context/FavoritesContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice, isSoldOut } from "@/lib/catalog-types";

export default function FavoritosPage() {
  const { ids } = useFavorites();
  const { products, loading } = useProducts();

  // Se muestran en el orden en que se guardaron; si un producto ya no existe, simplemente no aparece.
  const favorites = ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <main className="min-h-[70vh] bg-black text-white px-4 md:px-8 pt-8 pb-24 font-montserrat">
      <div className="max-w-7xl mx-auto">
        <div className="border-b border-neutral-900 pb-6 mb-8 text-center md:text-left">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">TU LISTA</span>
          <h1 className="text-4xl md:text-6xl font-black font-bebas tracking-wider uppercase mt-1">FAVORITOS</h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-2">Los productos que guardaste con el corazón. Quedan en este celular o navegador.</p>
        </div>

        {!loading && favorites.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-sm mb-6">Todavía no guardaste ningún producto. Tocá el corazón de los que te gusten para verlos acá.</p>
            <Link href="/coleccion" className="inline-block bg-white text-black px-8 py-3 font-bebas text-lg tracking-wider hover:bg-neutral-200 transition-colors">
              VER COLECCIÓN
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {favorites.map((product) => (
            <div key={product.id} className="relative flex flex-col bg-neutral-950 border border-neutral-900 overflow-hidden hover:border-neutral-700 transition-colors">
              <FavoriteButton productId={product.id} productName={product.name} className="absolute top-2 right-2 z-10" size={18} />
              <Link href={`/producto/${product.id}`} className="flex flex-col flex-grow">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                  {product.images[0] && (
                    <Image src={product.images[0]} alt={product.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-sm font-bold uppercase line-clamp-2">{product.name}</h2>
                  <p className="text-lg font-black tracking-tighter mt-2">{formatPrice(product.price)}</p>
                  {isSoldOut(product) && <p className="text-xs text-neutral-500 mt-1 uppercase">Agotado</p>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

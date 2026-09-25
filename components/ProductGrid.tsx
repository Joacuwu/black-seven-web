"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { availableSizes, formatPrice, isSoldOut } from "@/lib/catalog-types";
import FavoriteButton from "@/components/FavoriteButton";
import ProductCardImage from "@/components/ProductCardImage";

export default function ProductGrid() {
  const { addToCart } = useCart();
  const { products, loading } = useProducts();

  return (
    <section className="relative z-10 bg-black text-white px-6 py-16 md:py-24 font-montserrat">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-wider uppercase mb-12 text-center font-bebas">
          Lo Último
        </h2>

        {!loading && products.length === 0 && (
          <p className="text-center text-neutral-500 text-sm py-12">Próximamente nuevos productos.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col h-full bg-neutral-950 border border-neutral-900 rounded-lg overflow-hidden transition-all duration-300 hover:border-neutral-700"
            >
              {/* LINK QUE ENVOLVERÁ IMAGEN Y TÍTULO */}
              <Link href={`/producto/${product.id}`} className="flex flex-col flex-grow">

                {/* TAG */}
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-white text-black font-extrabold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                    {product.tag}
                  </span>
                )}

                <FavoriteButton productId={product.id} productName={product.name} className="absolute top-2 right-2 z-10" size={18} />

                <ProductCardImage product={product} />

                {/* DETALLES DE PRODUCTO */}
                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1 font-semibold">Black Seven</p>
                  <h3 className="text-sm font-bold tracking-tight mb-2 flex-grow line-clamp-2 group-hover:text-neutral-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-black tracking-tighter text-white">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>

              {/* BOTÓN: con varios talles hay que elegirlo en la ficha; con uno solo se agrega directo */}
              <div className="p-4 pt-0">
                {isSoldOut(product) ? (
                  <span className="block w-full text-center border border-neutral-800 text-neutral-500 py-3 rounded-md text-xs font-bold uppercase tracking-wider">
                    Agotado
                  </span>
                ) : availableSizes(product).length === 1 ? (
                  <button
                    onClick={() => addToCart({ id: product.id, name: product.name, price: formatPrice(product.price), size: availableSizes(product)[0], img: product.images[0] })}
                    className="w-full bg-white text-black py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Agregar al Carrito
                  </button>
                ) : (
                  <Link
                    href={`/producto/${product.id}`}
                    className="block w-full text-center bg-white text-black py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                  >
                    Elegir talle
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

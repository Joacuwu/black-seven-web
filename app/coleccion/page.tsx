"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import FavoriteButton from "@/components/FavoriteButton";
import ProductCardImage from "@/components/ProductCardImage";
import { normalizeText } from "@/components/SearchOverlay";
import { availableSizes as sizesInStock, formatPrice, categoryLabel, isSoldOut } from "@/lib/catalog-types";


function ColeccionContent() {
  const { addToCart } = useCart();
  const { products: ALL_PRODUCTS, loading } = useProducts();
  const searchParams = useSearchParams();
  const router = useRouter();

  // DERIVACIÓN DIRECTA DE URL (Evita useEffect y llamadas innecesarias a setState)
  const categoryParam = searchParams.get("categoria");
  const selectedCategory = categoryParam ? categoryParam.toLowerCase() : "todas";
  const tagParam = searchParams.get("etiqueta")?.toUpperCase() ?? null;
  const searchParam = searchParams.get("buscar")?.trim() ?? "";

  // ESTADOS DE FILTROS LOCALES
  const [selectedSize, setSelectedSize] = useState<string>("todos");
  const [sortBy, setSortBy] = useState<string>("destacados");

  const handleCategoryChange = (cat: string) => {
    if (cat === "todas") {
      router.push("/coleccion");
    } else {
      router.push(`/coleccion?categoria=${encodeURIComponent(cat)}`);
    }
  };

  // Categorías y talles disponibles según los productos cargados en el panel
  const categories = useMemo(() => [...new Set(ALL_PRODUCTS.map((p) => p.category))], [ALL_PRODUCTS]);
  const availableSizes = useMemo(() => {
    const order = ["XS", "S", "M", "L", "XL", "XXL"];
    const sizes = [...new Set(ALL_PRODUCTS.flatMap((p) => sizesInStock(p)))];
    return sizes.sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  }, [ALL_PRODUCTS]);

  // LÓGICA DE FILTRADO Y ORDENAMIENTO
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      const matchCategory =
        selectedCategory === "todas" || product.category === selectedCategory;
      const matchTag = !tagParam || product.tag === tagParam;
      const matchSearch =
        !searchParam || normalizeText(`${product.name} ${product.category} ${product.tag ?? ""}`).includes(normalizeText(searchParam));

      const matchSize =
        selectedSize === "todos" || sizesInStock(product).includes(selectedSize);

      return matchCategory && matchSize && matchTag && matchSearch;
    }).sort((a, b) => {
      if (sortBy === "precio-bajo") return a.price - b.price;
      if (sortBy === "precio-alto") return b.price - a.price;
      return a.sortOrder - b.sortOrder || a.id - b.id;
    });
  }, [ALL_PRODUCTS, selectedCategory, selectedSize, sortBy, tagParam, searchParam]);

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-24 px-4 md:px-8 font-montserrat">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="border-b border-neutral-900 pb-8 mb-8 text-center md:text-left">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">
            CATÁLOGO COMPLETO
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-bebas tracking-wider uppercase mt-1">
            COLECCIÓN
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 mt-2">
            Diseños limitados. Corte oversized, confección pesada.
          </p>
        </div>

        {/* BARRA DE FILTROS Y CONTROLES */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-neutral-950 p-4 border border-neutral-900 rounded-sm">
          
          {/* CATEGORÍAS */}
          <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
            {["todas", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-2 border transition-all cursor-pointer font-bold ${
                  selectedCategory === cat
                    ? "bg-white text-black border-white"
                    : "bg-black text-neutral-400 border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {searchParam && (
            <button
              onClick={() => router.push("/coleccion")}
              className="px-3 py-2 border border-red-600 text-red-500 text-xs font-bold uppercase cursor-pointer hover:bg-red-600 hover:text-white transition-colors max-w-full truncate"
            >
              Búsqueda: {searchParam} ✕
            </button>
          )}

          {tagParam && (
            <button
              onClick={() => router.push("/coleccion")}
              className="px-3 py-2 border border-red-600 text-red-500 text-xs font-bold uppercase cursor-pointer hover:bg-red-600 hover:text-white transition-colors"
            >
              {tagParam} ✕
            </button>
          )}

          {/* TALLES Y ORDEN */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            
            {/* SELECTOR TALLE */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 uppercase">TALLE:</span>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="bg-black text-white border border-neutral-800 px-3 py-2 rounded-sm focus:outline-none focus:border-red-600 cursor-pointer uppercase"
              >
                <option value="todos">Todos</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECTOR ORDEN */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 uppercase">ORDENAR:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black text-white border border-neutral-800 px-3 py-2 rounded-sm focus:outline-none focus:border-red-600 cursor-pointer uppercase"
              >
                <option value="destacados">Destacados</option>
                <option value="precio-bajo">Menor Precio</option>
                <option value="precio-alto">Mayor Precio</option>
              </select>
            </div>

          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-neutral-500">
            <p className="text-lg font-bold">No se encontraron productos en esta categoría.</p>
            <button
              onClick={() => handleCategoryChange("todas")}
              className="mt-4 text-xs text-red-600 underline uppercase tracking-wider cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col bg-neutral-950 border border-neutral-900 overflow-hidden transition-all duration-300 hover:border-neutral-700"
              >
                <Link href={`/producto/${product.id}`} className="flex flex-col flex-grow">

                  {/* TAG */}
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-white text-black font-extrabold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                      {product.tag}
                    </span>
                  )}

                  <FavoriteButton productId={product.id} productName={product.name} className="absolute top-2 right-2 z-10" size={18} />

                  <ProductCardImage product={product} aspect="aspect-[3/4]" />

                  {/* DATOS */}
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      BLACK SEVEN
                    </span>
                    <h3 className="text-sm font-bold tracking-tight mt-1 flex-grow line-clamp-1 group-hover:text-neutral-300 transition-colors uppercase">
                      {product.name}
                    </h3>
                    <p className="text-lg font-black tracking-tighter text-white mt-2">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>

                {/* BOTÓN: con varios talles hay que elegirlo en la ficha; con uno solo se agrega directo */}
                <div className="p-4 pt-0">
                  {isSoldOut(product) ? (
                    <span className="block w-full text-center border border-neutral-800 text-neutral-500 py-3 text-xs font-bold uppercase tracking-wider">
                      Agotado
                    </span>
                  ) : sizesInStock(product).length === 1 ? (
                    <button
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: formatPrice(product.price),
                          size: sizesInStock(product)[0],
                          img: product.images[0],
                        })
                      }
                      className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    >
                      Agregar
                    </button>
                  ) : (
                    <Link
                      href={`/producto/${product.id}`}
                      className="block w-full text-center bg-white text-black py-3 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Elegir talle
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function ColeccionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Cargando catálogo...</div>}>
      <ColeccionContent />
    </Suspense>
  );
}
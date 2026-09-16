"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

// BASE DE DATOS DE PRODUCTOS
const ALL_PRODUCTS = [
  {
    id: "1",
    name: "REMERA 777 WHITE",
    category: "remeras",
    price: 35000,
    tag: "NEW",
    sizes: ["S", "M", "L", "XL"],
    img: "/remera777.jpg",
    imgHover: "/remera777hover.jpg",
  },
  {
    id: "2",
    name: "REMERA BLK7 BLACK",
    category: "remeras",
    price: 35000,
    tag: "HOT",
    sizes: ["M", "L", "XL"],
    img: "/remerablk7.jpg",
    imgHover: "/remerablk7hover.jpg",
  },
  {
    id: "3",
    name: "CONJUNTO BLK 777",
    category: "conjuntos",
    price: 68000,
    tag: "DROP",
    sizes: ["M", "L", "XL"],
    img: "/conjuntoblk777.jpg",
    imgHover: "/conjuntoblk777hover.jpg",
  },
  {
    id: "4",
    name: "CAMPERA BLK 77",
    category: "camperas",
    price: 52000,
    tag: "NEW",
    sizes: ["S", "M", "L"],
    img: "/camperablk77.jpg",
    imgHover: "/camperablk77hover.jpg",
  },
  {
    id: "5",
    name: "CAMPERA BLACKSEVEN 77",
    category: "camperas",
    price: 52000,
    tag: "NEW",
    sizes: ["S", "M", "L"],
    img: "/camperablackseven77.jpg",
    imgHover: "/camperablackseven77hover.jpg",
  },
  {
    id: "6",
    name: "BUZO BLACKSEVEN 77",
    category: "hoodies", // Corregido de "hoddies" a "hoodies"
    price: 52000,
    tag: "NEW",
    sizes: ["S", "M", "L"],
    img: "/buzoblackseven77_1.jpg",
    imgHover: "/buzoblackseven77hover.jpg",
  },
];

function ColeccionContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("categoria");

  // ESTADOS DE FILTROS
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedSize, setSelectedSize] = useState<string>("todos");
  const [sortBy, setSortBy] = useState<string>("destacados");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // SINCRONIZACIÓN DE NAVEGACIÓN Y QUERY PARAMS
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    } else {
      setSelectedCategory("todas");
    }
  }, [categoryParam]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "todas") {
      router.push("/coleccion");
    } else {
      router.push(`/coleccion?categoria=${cat}`);
    }
  };

  // LÓGICA DE FILTRADO Y ORDENAMIENTO
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      const matchCategory =
        selectedCategory === "todas" || product.category === selectedCategory;

      const matchSize =
        selectedSize === "todos" || product.sizes.includes(selectedSize);

      return matchCategory && matchSize;
    }).sort((a, b) => {
      if (sortBy === "precio-bajo") return a.price - b.price;
      if (sortBy === "precio-alto") return b.price - a.price;
      return Number(a.id) - Number(b.id);
    });
  }, [selectedCategory, selectedSize, sortBy]);

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-24 px-4 md:px-8 font-montserrat">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="border-b border-neutral-900 pb-8 mb-8 text-center md:text-left">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">CATÁLOGO COMPLETO</span>
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
            {["todas", "remeras", "hoodies", "camperas", "conjuntos", "pantalones"].map((cat) => (
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
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
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
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={`/producto/${product.id}`} className="flex flex-col flex-grow">
                  
                  {/* TAG */}
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-white text-black font-extrabold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                      {product.tag}
                    </span>
                  )}

                  {/* IMAGEN CON HOVER SUAVE */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className={`object-cover transition-opacity duration-500 ${
                        hoveredId === product.id ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    <Image
                      src={product.imgHover}
                      alt={`${product.name} hover`}
                      fill
                      className={`object-cover transition-opacity duration-500 absolute top-0 left-0 ${
                        hoveredId === product.id ? "opacity-100 scale-105" : "opacity-0"
                      }`}
                    />
                  </div>

                  {/* DATOS */}
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">BLACK SEVEN</span>
                    <h3 className="text-sm font-bold tracking-tight mt-1 flex-grow line-clamp-1 group-hover:text-neutral-300 transition-colors uppercase">
                      {product.name}
                    </h3>
                    <p className="text-lg font-black tracking-tighter text-white mt-2">
                      ${product.price.toLocaleString("es-AR")}
                    </p>
                  </div>
                </Link>

                {/* BOTÓN RÁPIDO CARRITO */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() =>
                      addToCart({
                        id: Number(product.id),
                        name: product.name,
                        price: `$${product.price.toLocaleString("es-AR")}`,
                        size: product.sizes[0] || "M",
                        img: product.img,
                      })
                    }
                    className="w-full bg-white text-black py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                  >
                    Agregar
                  </button>
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
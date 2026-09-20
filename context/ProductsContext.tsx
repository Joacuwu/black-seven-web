"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog-types";

interface ProductsContextType {
  products: Product[];
  /** true hasta que termina la primera carga del catálogo. */
  loading: boolean;
  error: boolean;
  getProduct: (id: number | string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// `initialProducts` viene ya cargado desde el servidor: la grilla se ve completa desde el primer momento.
export function ProductsProvider({ children, initialProducts }: { children: ReactNode; initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { products: Product[] }) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ProductsContextType>(
    () => ({
      products,
      loading,
      error,
      getProduct: (id) => products.find((p) => p.id === Number(id)),
    }),
    [products, loading, error]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts debe usarse dentro de un ProductsProvider");
  return context;
}

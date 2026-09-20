"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Favoritos guardados en el propio celular/navegador (no hace falta crear cuenta).

const STORAGE_KEY = "favorites_blackseven";

interface FavoritesContextType {
  /** Ids de los productos marcados como favoritos, del más nuevo al más viejo. */
  ids: number[];
  count: number;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Arranca vacío (igual que en el servidor) y se carga al montar: así no hay diferencias entre servidor y celular.
  const [ids, setIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(parsed)) setIds(parsed.filter((id): id is number => Number.isInteger(id)));
    } catch {
      // sin almacenamiento disponible: los favoritos funcionan mientras la página esté abierta
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // modo privado o sin espacio: se ignora
    }
  }, [ids, hydrated]);

  const toggleFavorite = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  const value = useMemo<FavoritesContextType>(
    () => ({ ids, count: ids.length, isFavorite: (id) => ids.includes(id), toggleFavorite }),
    [ids, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites debe usarse dentro de un FavoritesProvider");
  return context;
}

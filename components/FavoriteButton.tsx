"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface FavoriteButtonProps {
  productId: number;
  productName: string;
  className?: string;
  size?: number;
}

/** Corazón para guardar un producto en favoritos. */
export default function FavoriteButton({ productId, productName, className = "", size = 20 }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        // Las tarjetas están dentro de un enlace: se evita abrir el producto al tocar el corazón.
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      aria-pressed={active}
      aria-label={active ? `Quitar ${productName} de favoritos` : `Guardar ${productName} en favoritos`}
      className={`flex items-center justify-center w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors cursor-pointer ${className}`}
    >
      <Heart size={size} strokeWidth={1.75} className={active ? "fill-red-600 text-red-600" : "text-white"} />
    </button>
  );
}

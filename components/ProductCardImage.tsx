"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/catalog-types";

// Un dedo se mueve más de esto en horizontal (y más que en vertical) para contar como deslizamiento.
const SWIPE_THRESHOLD = 40;

/**
 * Foto de la tarjeta de producto. En compu se ve la segunda foto al pasar el mouse;
 * en celular se puede deslizar con el dedo para ver las demás fotos sin entrar al producto.
 */
export default function ProductCardImage({ product, aspect = "aspect-[4/5]" }: { product: Product; aspect?: string }) {
  const [hovered, setHovered] = useState(false);
  const [swipeIndex, setSwipeIndex] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const activeIndex = swipeIndex ?? (hovered && product.images.length > 1 ? 1 : 0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || product.images.length < 2) return;

    const t = e.changedTouches[0];
    const deltaX = t.clientX - start.x;
    const deltaY = t.clientY - start.y;
    // Si el dedo se movió más en vertical (estaba scrolleando la página), no es un deslizamiento de foto.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

    // Evita que el deslizamiento también dispare la navegación al producto (el link envuelve la foto).
    e.preventDefault();
    const length = product.images.length;
    setSwipeIndex((prev) => {
      const current = prev ?? 0;
      return deltaX < 0 ? (current + 1) % length : (current - 1 + length) % length;
    });
  };

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden bg-neutral-900 touch-pan-y`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {product.images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={index === 0 ? product.name : `${product.name}, foto ${index + 1}`}
          fill
          className={`object-cover transition-opacity duration-300 absolute inset-0 ${
            activeIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {product.images.length > 1 && (
        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 md:hidden">
          {product.images.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                activeIndex === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

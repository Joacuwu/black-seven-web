"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice, type Product } from "@/lib/catalog-types";
import { FALLBACK_HERO, type HeroSlide } from "@/lib/hero-types";

const AUTOPLAY_MS = 6000;
const RESUME_AFTER_TOUCH_MS = 10000;
const MAX_FEATURED = 4;

// Diapositiva propia cargada desde el panel (foto + texto y botón opcionales)
function CustomSlide({ slide, first }: { slide: HeroSlide; first: boolean }) {
  const hasText = Boolean(slide.eyebrow || slide.title || slide.subtitle || (slide.buttonLabel && slide.buttonUrl));
  const Title = first ? "h1" : "h2";

  return (
    <div className="relative flex-none w-full h-full snap-center flex items-center justify-center overflow-hidden">
      {/* FOTO PARA COMPUTADORA */}
      <Image
        src={slide.imageUrl}
        alt={slide.title ?? "BLACK SEVEN"}
        fill
        priority={first}
        sizes="100vw"
        className="hidden md:block object-cover object-center"
      />
      {/* FOTO PARA CELULAR (si no hay una propia, se usa la principal) */}
      <Image
        src={slide.mobileImageUrl ?? slide.imageUrl}
        alt={slide.title ?? "BLACK SEVEN"}
        fill
        priority={first}
        sizes="100vw"
        className="md:hidden object-cover object-center"
      />

      {/* Sin texto se ve la foto casi pura; con texto se oscurece para que se lea */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          hasText ? "bg-gradient-to-t from-black/90 via-black/55 to-black/40" : "bg-gradient-to-t from-black/50 via-transparent to-transparent"
        }`}
      />

      {hasText && (
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {slide.eyebrow && (
            <p className="text-red-500 font-montserrat text-xs sm:text-sm tracking-[0.3em] uppercase mb-4 font-bold">{slide.eyebrow}</p>
          )}
          {slide.title && (
            <Title className="font-bebas text-6xl sm:text-9xl tracking-tight leading-none text-white uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              {slide.title}
            </Title>
          )}
          {slide.subtitle && (
            <p className="mt-4 text-neutral-200 font-montserrat max-w-lg mx-auto text-sm sm:text-base drop-shadow-md">{slide.subtitle}</p>
          )}
          {slide.buttonLabel && slide.buttonUrl && (
            <div className="mt-8">
              <Link
                href={slide.buttonUrl}
                className="inline-block px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bebas text-xl md:text-2xl tracking-wider uppercase transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/50"
              >
                {slide.buttonLabel}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProductSlide({ product }: { product: Product }) {
  const photo = product.images[0];

  return (
    <div className="relative flex-none w-full h-full snap-center overflow-hidden">
      {/* CELULAR: foto a pantalla completa */}
      {photo && (
        <Image src={photo} alt={product.name} fill sizes="100vw" className="object-cover object-top md:hidden" />
      )}
      {/* DESKTOP: la misma foto desenfocada de fondo */}
      {photo && (
        <Image
          src={photo}
          alt=""
          aria-hidden
          fill
          sizes="25vw"
          className="hidden md:block object-cover blur-3xl scale-125 opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 md:bg-gradient-to-r md:from-black md:via-black/70 md:to-black/40 pointer-events-none" />

      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 md:px-16 flex flex-col justify-end md:flex-row md:items-center md:justify-between md:gap-12 pb-20 md:pb-0">
        <div className="md:max-w-md">
          <p className="text-red-500 font-montserrat text-xs tracking-[0.3em] uppercase font-bold">
            {product.tag ?? "Colección"}
          </p>
          <h2 className="font-bebas text-5xl sm:text-6xl md:text-7xl leading-[0.95] uppercase mt-2 drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)]">
            {product.name}
          </h2>
          <p className="font-montserrat text-2xl font-bold mt-3">{formatPrice(product.price)}</p>
          <Link
            href={`/producto/${product.id}`}
            className="inline-block mt-6 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bebas text-xl tracking-wider uppercase transition-colors border border-red-500/50"
          >
            Ver producto
          </Link>
        </div>

        {photo && (
          <div className="hidden md:block relative h-[72%] max-h-[620px] aspect-[4/5] border border-neutral-800 shadow-2xl">
            <Image src={photo} alt={product.name} fill sizes="(min-width: 768px) 30vw, 0px" className="object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

interface HeroProps {
  /** Diapositivas propias (fotos cargadas desde el panel). Si no hay ninguna, se usa la portada de respaldo. */
  slides?: HeroSlide[];
  /** Si además se muestran productos del catálogo dentro del carrusel. */
  showProducts?: boolean;
}

export default function Hero({ slides = FALLBACK_HERO.slides, showProducts = true }: HeroProps) {
  const { products } = useProducts();
  const ownSlides = useMemo(() => (slides.length > 0 ? slides : FALLBACK_HERO.slides), [slides]);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);

  // Diapositivas: las fotos propias del panel + hasta 4 productos (primero los que tienen etiqueta NEW, HOT, etc.)
  const featured = useMemo(() => {
    if (!showProducts) return [];
    const withPhoto = products.filter((p) => p.images.length > 0);
    return [...withPhoto.filter((p) => p.tag), ...withPhoto.filter((p) => !p.tag)].slice(0, MAX_FEATURED);
  }, [products, showProducts]);
  const total = ownSlides.length + featured.length;

  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  }, []);

  const pauseAutoplay = useCallback((resumeAfter?: number) => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (resumeAfter) {
      resumeTimer.current = setTimeout(() => {
        pausedRef.current = false;
      }, resumeAfter);
    }
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  // Pasa sola cada unos segundos, salvo que la persona la esté usando o prefiera menos movimiento.
  useEffect(() => {
    if (total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      const track = trackRef.current;
      if (!track) return;
      const current = Math.round(track.scrollLeft / track.clientWidth);
      goTo((current + 1) % total);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [total, goTo]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(Math.min(total - 1, index + 1));
    if (e.key === "ArrowLeft") goTo(Math.max(0, index - 1));
  };

  return (
    <section
      className="relative h-[calc(100svh-8rem)] min-h-[560px] bg-black"
      aria-roledescription="carrusel"
      aria-label="Novedades de BLACK SEVEN"
      onMouseEnter={() => pauseAutoplay()}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => pauseAutoplay(RESUME_AFTER_TOUCH_MS)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {ownSlides.map((slide, i) => (
          <CustomSlide key={slide.id} slide={slide} first={i === 0} />
        ))}
        {featured.map((product) => (
          <ProductSlide key={product.id} product={product} />
        ))}
      </div>

      {total > 1 && (
        <>
          {/* FLECHAS (solo con mouse; en celular se desliza con el dedo) */}
          <button
            onClick={() => goTo(Math.max(0, index - 1))}
            disabled={index === 0}
            aria-label="Anterior"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-black/60 border border-neutral-700 hover:border-white text-white transition-all disabled:opacity-0 cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => goTo(Math.min(total - 1, index + 1))}
            disabled={index === total - 1}
            aria-label="Siguiente"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-black/60 border border-neutral-700 hover:border-white text-white transition-all disabled:opacity-0 cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>

          {/* PUNTOS */}
          <div className="absolute bottom-5 inset-x-0 z-20 flex justify-center gap-1">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  pauseAutoplay(RESUME_AFTER_TOUCH_MS);
                  goTo(i);
                }}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                aria-current={i === index}
                className="p-2.5 cursor-pointer"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-red-600" : "w-3 bg-neutral-500/70"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="absolute bottom-6 right-6 hidden lg:block border border-neutral-800 bg-black/80 backdrop-blur-md px-3 py-1 font-montserrat text-[10px] tracking-widest text-neutral-400 uppercase z-10 rounded-sm pointer-events-none">
        Explicit Content / Streetwear
      </div>
    </section>
  );
}

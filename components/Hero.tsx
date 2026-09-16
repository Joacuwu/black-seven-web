import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20 bg-black">
      
      {/* 1. IMAGEN PARA DESKTOP (Se oculta en mobile) */}
      <div className="hidden md:block absolute inset-0">
        <Image
          src="/hero-bg.jpg" // 1920x1080 en public/
          alt="BLACK SEVEN Background Desktop"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
      </div>

      {/* 2. IMAGEN PARA MOBILE (Se muestra solo en pantallas chicas) */}
      <div className="block md:hidden absolute inset-0">
        <Image
          src="/hero-bg-mobile.jpg" // 1080x1920 en public/
          alt="BLACK SEVEN Background Mobile"
          fill
          priority
          className="object-cover object-center opacity-50"
        />
      </div>

      {/* OVERLAY DEGRADADO BORDÓ/NEGRO TÁCTICO */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-black/80 to-black pointer-events-none" />

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        
        {/* TAG DE LANZAMIENTO */}
        <p className="text-red-600 font-montserrat text-xs sm:text-sm tracking-[0.3em] uppercase mb-4 font-bold flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping" />
          New Drop Available
        </p>

        {/* TÍTULO PRINCIPAL */}
        <h1 className="font-bebas text-7xl sm:text-9xl tracking-tight leading-none text-white uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          BLACK SEVEN
        </h1>

        {/* BAJADA */}
        <p className="mt-4 text-neutral-300 font-montserrat max-w-lg mx-auto text-sm sm:text-base drop-shadow-md">
          Streetwear & Underground Culture. Diseños exclusivos de edición limitada.
        </p>
        
        {/* BOTÓN CTA */}
        <div className="mt-8">
          <Link
            href="/coleccion"
            className="inline-block px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bebas text-xl md:text-2xl tracking-wider uppercase transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/50"
          >
            Ver Colección
          </Link>
        </div>

      </div>

      {/* INDICADOR ANIMADO PARA SCROLLEAR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity z-10 pointer-events-none">
        <span className="text-[10px] font-montserrat tracking-widest text-neutral-400 uppercase">Scroll</span>
        <div className="w-4 h-7 border-2 border-neutral-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-1.5 bg-red-600 rounded-full animate-bounce" />
        </div>
      </div>

      {/* BADGE INFERIOR DERECHA */}
      <div className="absolute bottom-6 right-6 hidden sm:block border border-neutral-800 bg-black/80 backdrop-blur-md px-3 py-1 font-montserrat text-[10px] tracking-widest text-neutral-400 uppercase z-10 rounded-sm">
        Explicit Content / Streetwear
      </div>

    </section>
  );
}
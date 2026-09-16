import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20 bg-black">
      {/* 1. IMAGEN PARA DESKTOP / COMPU (Se oculta en celu) */}
      <div className="hidden md:block absolute inset-0">
        <Image
          src="/hero-bg.jpg" // 1920x1080
          alt="BLACK SEVEN Background Desktop"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
      </div>

      {/* 2. IMAGEN PARA MOBILE / CELU (Se muestra solo en pantallas chicas) */}
      <div className="block md:hidden absolute inset-0">
        <Image
          src="/hero-bg-mobile.jpg" // 1080x1920
          alt="BLACK SEVEN Background Mobile"
          fill
          priority
          className="object-cover object-center opacity-50"
        />
      </div>

      {/* OVERLAY DEGRADADO BORDÓ/NEGRO */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/40 via-black/80 to-black pointer-events-none" />

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <p className="text-red-600 font-montserrat text-xs sm:text-sm tracking-[0.3em] uppercase mb-4 font-semibold">
          New Drop Available
        </p>
        <h1 className="font-bebas text-7xl sm:text-9xl tracking-tight leading-none text-white uppercase drop-shadow-2xl">
          BLACK SEVEN
        </h1>
        <p className="mt-4 text-neutral-300 font-montserrat max-w-lg mx-auto text-sm sm:text-base drop-shadow-md">
          Streetwear & Underground Culture. Diseños exclusivos de edición limitada.
        </p>
        
        <div className="mt-8">
          <a
            href="#coleccion"
            className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bebas text-xl tracking-wider uppercase transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Ver Colección
          </a>
        </div>
      </div>

      {/* BADGE INFERIOR DERECHA */}
      <div className="absolute bottom-6 right-6 hidden sm:block border border-neutral-700 bg-black/60 backdrop-blur-sm px-3 py-1 font-montserrat text-[10px] tracking-widest text-neutral-400 uppercase z-10">
        Explicit Content / Streetwear
      </div>
    </section>
  );
}
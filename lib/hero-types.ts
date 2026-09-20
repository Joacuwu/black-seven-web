// Tipos de la portada (hero) que también usa el navegador (no importar nada del servidor acá).

export interface HeroSlide {
  id: number;
  /** Foto principal (se usa en computadora, y en celular si no hay foto propia para celular). */
  imageUrl: string;
  /** Foto pensada para pantalla vertical de celular (opcional). */
  mobileImageUrl: string | null;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  buttonLabel: string | null;
  /** Dirección interna del sitio (ej: "/coleccion" o "/producto/3"). */
  buttonUrl: string | null;
  active: boolean;
  sortOrder: number;
}

export type HeroSlideInput = Omit<HeroSlide, "id" | "sortOrder">;

export interface HeroData {
  slides: HeroSlide[];
  /** Si además de las diapositivas propias se muestran productos del catálogo. */
  showProducts: boolean;
}

/** Portada de respaldo: si la base de datos no responde, la tienda igual muestra esto. */
export const FALLBACK_HERO: HeroData = {
  showProducts: true,
  slides: [
    {
      id: 0,
      imageUrl: "/hero-bg.jpg",
      mobileImageUrl: "/hero-bg-mobile.jpg",
      eyebrow: "New Drop Available",
      title: "BLACK SEVEN",
      subtitle: "Streetwear & Underground Culture. Diseños exclusivos de edición limitada.",
      buttonLabel: "Ver Colección",
      buttonUrl: "/coleccion",
      active: true,
      sortOrder: 10,
    },
  ],
};

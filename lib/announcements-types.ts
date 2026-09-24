// Tipos del cartel rojo (anuncios) que también usa el navegador (no importar nada del servidor acá).

export interface Announcement {
  id: string;
  text: string;
  active: boolean;
}

/** Cartel de respaldo: si la base de datos no responde, la tienda igual muestra algo. */
export const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { id: "fallback-1", text: "ENVÍOS GRATIS A TODO EL PAÍS EN COMPRAS SUPERIORES A $50.000", active: true },
  { id: "fallback-2", text: "10% DE DESCUENTO PAGANDO POR TRANSFERENCIA", active: true },
];

export const ANNOUNCEMENT_TEXT_LIMIT = 100;
export const ANNOUNCEMENT_MAX_ITEMS = 8;

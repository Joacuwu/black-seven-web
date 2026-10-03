// Datos de pago de la tienda. Se cargan por variables de entorno (ver .env.example) para no
// publicar datos personales en el repositorio. Son NEXT_PUBLIC_ porque el checkout los muestra al comprador.

/** Cuenta que recibe las transferencias. */
export const BANK_DETAILS = {
  /** CBU o CVU (22 dígitos). */
  cbu: process.env.NEXT_PUBLIC_BANK_CBU ?? "",
  alias: process.env.NEXT_PUBLIC_BANK_ALIAS ?? "",
  /** Nombre del titular, si se quiere mostrar (ej: "Juan Pérez"). Sin la variable no se muestra. */
  holder: (process.env.NEXT_PUBLIC_BANK_HOLDER || null) as string | null,
};

/** Número de WhatsApp para mandar el comprobante (sin + ni espacios). */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

/**
 * Pago online con tarjeta (Naranja X). Mientras esté en false, la tienda ofrece solo transferencia:
 * el resto del código ya está listo, se activa poniendo true cuando lleguen las credenciales.
 */
export const ONLINE_PAYMENT_ENABLED = false;

/** Enlace de WhatsApp con el mensaje armado para mandar el comprobante de un pedido. */
export function proofWhatsAppUrl(orderNumber: number | string): string {
  const message = `Hola! Te mando el comprobante de la transferencia del pedido #${orderNumber}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

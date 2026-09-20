// Datos de pago de la tienda. Es el ÚNICO lugar donde hay que cambiarlos.

/** Cuenta que recibe las transferencias. */
export const BANK_DETAILS = {
  /** CBU o CVU (22 dígitos). */
  cbu: "0000168300000022305789",
  alias: "estampados.7",
  /** Nombre del titular, si se quiere mostrar (ej: "Juan Pérez"). Con null no se muestra. */
  holder: "Matias Ariel Colman" as string | null,
};

/** Número de WhatsApp para mandar el comprobante (sin + ni espacios). */
export const WHATSAPP_NUMBER = "5491127035976";

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

import { naranjaXProvider } from "./naranja-x";
import type { PaymentProvider } from "./types";

// Para cambiar de pasarela alcanza con devolver otro proveedor acá.
export function getPaymentProvider(): PaymentProvider {
  return naranjaXProvider;
}

export * from "./types";

export interface PaymentItem {
  id: number;
  title: string;
  /** Precio unitario en ARS, tomado del catálogo del servidor. */
  unitPrice: number;
  quantity: number;
}

export interface CreatePaymentInput {
  orderId: string;
  items: PaymentItem[];
  /** Total en ARS (suma de items + envío). */
  total: number;
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
  notificationUrl: string;
}

export interface CreatePaymentResult {
  /** URL a la que se redirige al cliente para pagar. */
  redirectUrl: string;
  /** ID del pago/checkout del lado de la pasarela. */
  providerPaymentId?: string;
}

export type PaymentStatus = "approved" | "rejected" | "pending";

export interface WebhookEvent {
  orderId: string;
  status: PaymentStatus;
  providerPaymentId?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Valida la autenticidad de la notificación y la traduce a un evento propio. */
  parseWebhook(request: Request): Promise<WebhookEvent>;
}

/** La pasarela todavía no tiene credenciales o la integración no está completa. */
export class PaymentNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentNotConfiguredError";
  }
}

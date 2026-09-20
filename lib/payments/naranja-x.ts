import {
  PaymentNotConfiguredError,
  type CreatePaymentInput,
  type CreatePaymentResult,
  type PaymentProvider,
  type WebhookEvent,
} from "./types";

// Adaptador de Naranja X (API de e-commerce).
//
// Naranja X entrega la documentación y las credenciales al dar de alta el
// comercio, así que los puntos marcados con TODO(naranja-x) hay que completarlos
// con esa documentación. Todo lo demás (validación de precios, armado del pedido,
// rutas, redirecciones) ya está resuelto y no depende de la pasarela.
//
// Variables de entorno (.env.local):
//   NARANJAX_API_URL         base de la API (sandbox o producción)
//   NARANJAX_CLIENT_ID       credencial pública / id de comercio
//   NARANJAX_CLIENT_SECRET   credencial privada
//   NARANJAX_WEBHOOK_SECRET  secreto para validar notificaciones

function getConfig() {
  const apiUrl = process.env.NARANJAX_API_URL;
  const clientId = process.env.NARANJAX_CLIENT_ID;
  const clientSecret = process.env.NARANJAX_CLIENT_SECRET;

  if (!apiUrl || !clientId || !clientSecret) {
    throw new PaymentNotConfiguredError(
      "Faltan NARANJAX_API_URL, NARANJAX_CLIENT_ID o NARANJAX_CLIENT_SECRET en el entorno."
    );
  }

  return { apiUrl, clientId, clientSecret };
}

export const naranjaXProvider: PaymentProvider = {
  name: "naranja-x",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const { apiUrl } = getConfig();

    // TODO(naranja-x): autenticación (token OAuth, header con clientId/secret, etc.).
    // TODO(naranja-x): endpoint y cuerpo reales del alta de pago. El objeto de abajo
    // es un borrador con los datos que ya tenemos; renombrar campos según la doc.
    const payload = {
      reference: input.orderId,
      amount: input.total,
      currency: "ARS",
      items: input.items.map((item) => ({
        id: String(item.id),
        description: item.title,
        unit_price: item.unitPrice,
        quantity: item.quantity,
      })),
      success_url: input.backUrls.success,
      failure_url: input.backUrls.failure,
      pending_url: input.backUrls.pending,
      notification_url: input.notificationUrl,
    };

    const response = await fetch(`${apiUrl}/TODO-endpoint-de-pago`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO(naranja-x): Authorization según la doc.
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Naranja X respondió ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    // TODO(naranja-x): nombres reales de los campos de la respuesta.
    const redirectUrl: string | undefined = data.checkout_url ?? data.redirect_url;
    if (!redirectUrl) {
      throw new Error("Naranja X no devolvió una URL de pago.");
    }

    return { redirectUrl, providerPaymentId: data.id ? String(data.id) : undefined };
  },

  async parseWebhook(request: Request): Promise<WebhookEvent> {
    if (!process.env.NARANJAX_WEBHOOK_SECRET) {
      throw new PaymentNotConfiguredError("Falta NARANJAX_WEBHOOK_SECRET en el entorno.");
    }

    void request;
    // TODO(naranja-x): 1) validar firma/secreto de la notificación según la doc,
    // 2) idealmente confirmar el estado consultando la API de Naranja X,
    // 3) mapear su estado a "approved" | "rejected" | "pending".
    throw new PaymentNotConfiguredError("parseWebhook de Naranja X todavía no está implementado.");
  },
};

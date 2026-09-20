import { getSupabase } from "@/lib/supabase";

// Límite de intentos por dirección IP, guardado en la base de datos (función hit_rate_limit de
// supabase/stock-y-limites.sql) para que valga aunque el servidor tenga varias copias corriendo.

/** Dirección IP de quien hace el pedido (Vercel la manda en x-forwarded-for). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "desconocida";
}

/**
 * Cuenta un intento y dice si todavía está permitido (`true`) o ya se pasó del límite (`false`).
 * Si la base de datos falla o todavía no tiene la función, deja pasar: mejor eso que trabar la tienda.
 */
export async function allowRequest(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const { data, error } = await getSupabase().rpc("hit_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("No se pudo verificar el límite de intentos:", error.message);
    return true;
  }
  return data !== false;
}

export const TOO_MANY_REQUESTS = { error: "Demasiados intentos. Esperá unos minutos y volvé a probar." };

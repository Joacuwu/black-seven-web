import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Autenticación simple del panel: una contraseña (ADMIN_PASSWORD) que da una cookie
// firmada y con vencimiento. La cookie es httpOnly, así que el navegador no puede leerla desde JS.

export const ADMIN_COOKIE = "bs_admin";
const SESSION_SECONDS = 60 * 60 * 12; // 12 horas

function getPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, password: string): string {
  return createHmac("sha256", password).update(payload).digest("hex");
}

/** Compara en tiempo constante para no filtrar información por diferencias de tiempo. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function isAdminConfigured(): boolean {
  return getPassword() !== null;
}

export function checkPassword(input: string): boolean {
  const password = getPassword();
  return password !== null && safeEqual(input, password);
}

export function createSessionToken(): { value: string; maxAge: number } {
  const password = getPassword();
  if (!password) throw new Error("Falta ADMIN_PASSWORD en el entorno.");
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return { value: `${expires}.${sign(expires, password)}`, maxAge: SESSION_SECONDS };
}

function isValidToken(token: string | undefined): boolean {
  const password = getPassword();
  if (!password || !token) return false;

  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires, password))) return false;
  return Number(expires) > Date.now() / 1000;
}

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

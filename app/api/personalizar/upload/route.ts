import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { PRODUCT_IMAGES_BUCKET, publicImagesBase } from "@/lib/catalog";
import { getSupabase } from "@/lib/supabase";
import { allowRequest, clientIp, TOO_MANY_REQUESTS } from "@/lib/rate-limit";

// Sube el diseño que el cliente ubicó sobre la remera en /personalizar. Es público (no hace falta
// estar en el panel), así que va con límite de intentos por IP para que no se abuse.

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await allowRequest(`personalizar-upload:${ip}`, 20, 60 * 60))) {
    return NextResponse.json(TOO_MANY_REQUESTS, { status: 429 });
  }

  const path = `personalizados/${new Date().getFullYear()}/${randomUUID()}.png`;
  const { data, error } = await getSupabase()
    .storage.from(PRODUCT_IMAGES_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("Error creando URL de subida (personalizar):", error);
    return NextResponse.json({ error: "No se pudo preparar la subida." }, { status: 500 });
  }

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    publicUrl: `${publicImagesBase()}/${path}`,
  });
}

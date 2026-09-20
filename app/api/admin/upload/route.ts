import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdminRequest } from "@/lib/admin-auth";
import { PRODUCT_IMAGES_BUCKET, publicImagesBase } from "@/lib/catalog";
import { getSupabase } from "@/lib/supabase";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Devuelve una URL firmada de un solo uso para que el navegador suba la foto directo a Supabase
// (así no pasa por el servidor y no hay límite de tamaño de la función).
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const extension = EXTENSIONS[body?.contentType];
  if (!extension) {
    return NextResponse.json({ error: "Solo se aceptan fotos JPG, PNG o WebP." }, { status: 400 });
  }

  const path = `${new Date().getFullYear()}/${randomUUID()}.${extension}`;
  const { data, error } = await getSupabase()
    .storage.from(PRODUCT_IMAGES_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("Error creando URL de subida:", error);
    return NextResponse.json({ error: "No se pudo preparar la subida." }, { status: 500 });
  }

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    publicUrl: `${publicImagesBase()}/${path}`,
  });
}

// Herramientas para subir fotos desde el panel (se usan en Productos y en Portada).

/** Achica la foto (los celulares sacan fotos de 5 MB+) y la pasa a JPG antes de subirla. */
export async function compressImage(file: File, maxSide = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la foto.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la foto."))), "image/jpeg", 0.85)
  );
}

/** Sube la foto ya achicada a la URL firmada que entregó el servidor. */
export async function uploadBlob(uploadUrl: string, blob: Blob): Promise<void> {
  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", blob);
  const res = await fetch(uploadUrl, { method: "PUT", body });
  if (!res.ok) throw new Error("No se pudo subir la foto.");
}

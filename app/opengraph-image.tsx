import { ImageResponse } from "next/og";

// Imagen que se ve al compartir el sitio por WhatsApp, Instagram, etc.
export const alt = "BLACK SEVEN | Official Store";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          borderTop: "12px solid #dc2626",
        }}
      >
        <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: 8 }}>BLACK SEVEN</div>
        <div style={{ fontSize: 36, color: "#a3a3a3", letterSpacing: 6, marginTop: 16 }}>
          STREETWEAR & UNDERGROUND CULTURE
        </div>
      </div>
    ),
    size
  );
}

import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { Bebas_Neue, Montserrat } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "BLACK SEVEN | Official Store",
  description: "Streetwear & Underground Culture. Drops exclusivos de edición limitada.",
  openGraph: {
    title: "BLACK SEVEN | Official Store",
    description: "Streetwear & Underground Culture.",
    url: "/",
    siteName: "BLACK SEVEN",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bebas.variable} ${montserrat.variable}`}>
      <body className="bg-black text-white font-sans antialiased selection:bg-red-600 selection:text-white">
        <ProductsProvider>
        <CartProvider>
          {/* BLOQUE SUPERIOR FIJO */}
          <header className="sticky top-0 z-50 w-full bg-black">
            <AnnouncementBar />
            <Navbar />
          </header>
          {/* CARRITO LATERAL GLOBAL */}
          <CartDrawer />
          {children}
          {/* BOTÓN FLOTANTE DE WHATSAPP */}
          <WhatsAppButton />
        </CartProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
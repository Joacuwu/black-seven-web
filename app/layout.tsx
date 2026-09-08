import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
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
  title: "BLACK SEVEN | Official Store",
  description: "Streetwear & Underground Culture. Drops exclusivos de edición limitada.",
  openGraph: {
    title: "BLACK SEVEN | Official Store",
    description: "Streetwear & Underground Culture.",
    url: "https://blackseven.com",
    siteName: "BLACK SEVEN",
    images: [
      {
        url: "/remera1.jpg",
        width: 1200,
        height: 630,
      },
    ],
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
        {/* BLOQUE SUPERIOR FIJO */}
        <header className="sticky top-0 z-50 w-full bg-black">
          <AnnouncementBar />
          <Navbar />
        </header>
        {children}
      </body>
    </html>
  );
}
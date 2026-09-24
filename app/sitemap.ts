import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

// Se genera en cada consulta para incluir los productos cargados desde el panel.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/coleccion`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/envios-y-devoluciones`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const products = await listProducts(true);
    return [
      ...pages,
      ...products.map((p) => ({
        url: `${SITE_URL}/producto/${p.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return pages;
  }
}

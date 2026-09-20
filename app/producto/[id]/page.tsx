import type { Metadata } from "next";
import { getActiveProductsByIds } from "@/lib/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Product } from "@/lib/catalog-types";
import ProductView from "./ProductView";

type Props = { params: Promise<{ id: string }> };

async function loadProduct(rawId: string): Promise<Product | null> {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return null;
  try {
    return (await getActiveProductsByIds([id])).get(id) ?? null;
  } catch {
    // Si la base falla, la página igual carga y el navegador reintenta por su cuenta.
    return null;
  }
}

const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await loadProduct((await params).id);
  if (!product) return { title: `Producto no disponible | ${SITE_NAME}` };

  const description = product.description || `${product.name} — ${SITE_NAME}`;
  const image = product.images[0] ? absoluteUrl(product.images[0]) : undefined;

  return {
    title: `${product.name} | ${SITE_NAME}`,
    description,
    alternates: { canonical: `/producto/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      url: `/producto/${product.id}`,
      siteName: SITE_NAME,
      locale: "es_AR",
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await loadProduct((await params).id);

  // Datos estructurados: Google puede mostrar precio y disponibilidad en los resultados.
  const jsonLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map(absoluteUrl),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.id}`,
      priceCurrency: "ARS",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // "<" escapado para que un texto con "</script>" no pueda romper la página.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <ProductView initialProduct={product} />
    </>
  );
}

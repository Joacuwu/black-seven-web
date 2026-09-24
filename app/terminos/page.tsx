// Términos generales para una tienda chica que vende por transferencia. Son un punto de partida
// razonable, no reemplazan la revisión de un abogado si el cliente lo considera necesario.
import type { Metadata } from "next";
import Footer from "@/components/footer";
import { WHATSAPP_NUMBER } from "@/lib/payment-config";

export const metadata: Metadata = {
  title: "Términos y Condiciones | BLACK SEVEN",
  description: "Términos y condiciones de compra en BLACK SEVEN.",
};

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-black text-white font-montserrat">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <span className="text-xs font-bold text-red-600 tracking-widest uppercase">Legal</span>
        <h1 className="text-4xl md:text-5xl font-black font-bebas tracking-wider uppercase mt-1 mb-2">
          Términos y condiciones
        </h1>
        <p className="text-xs text-neutral-500 mb-10">Última actualización: septiembre de 2026.</p>

        <div className="text-sm text-neutral-300 leading-relaxed space-y-8">
          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">1. Quiénes somos</h2>
            <p>
              BLACK SEVEN es una tienda online de indumentaria. Al comprar en este sitio aceptás los términos
              descritos a continuación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">2. Productos y precios</h2>
            <p>
              Los precios se muestran en pesos argentinos (ARS) e incluyen impuestos. Pueden cambiar sin previo
              aviso, pero el precio válido para tu compra es el que figuraba al momento de confirmar el pedido.
              Hacemos lo posible para que las fotos y descripciones sean fieles al producto; pueden existir
              pequeñas diferencias de color según la pantalla.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">3. Stock</h2>
            <p>
              Si un producto se agota entre que lo agregaste al carrito y confirmaste el pedido, te avisamos y
              te reintegramos el pago si ya lo habías hecho.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">4. Medios de pago</h2>
            <p>
              Por el momento aceptamos transferencia bancaria. Tu pedido queda reservado al confirmar la compra
              y se procesa una vez que verificamos el pago con el comprobante que nos enviás por WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">5. Envíos, cambios y devoluciones</h2>
            <p>
              El detalle de tiempos, costos y condiciones de cambio está en{" "}
              <a href="/envios-y-devoluciones" className="text-white underline hover:text-red-500">
                Envíos y devoluciones
              </a>
              , y forma parte de estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">6. Propiedad intelectual</h2>
            <p>
              El nombre, el logo y los diseños de BLACK SEVEN son propiedad de la marca. No se pueden reproducir
              ni usar sin autorización.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">7. Cambios en estos términos</h2>
            <p>
              Podemos actualizar estos términos en cualquier momento. Los cambios rigen desde que se publican en
              esta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">8. Ley aplicable y contacto</h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina. Ante cualquier duda o reclamo,
              podés escribirnos por{" "}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:text-red-500"
              >
                WhatsApp
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}

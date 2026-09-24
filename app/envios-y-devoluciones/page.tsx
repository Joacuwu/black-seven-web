import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/footer";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/pricing-constants";
import { WHATSAPP_NUMBER } from "@/lib/payment-config";

export const metadata: Metadata = {
  title: "Envíos y Devoluciones | BLACK SEVEN",
  description: "Tiempos y costos de envío, y cómo hacer un cambio o devolución en BLACK SEVEN.",
};

const money = (value: number) => value.toLocaleString("es-AR");

export default function EnviosYDevolucionesPage() {
  return (
    <main className="min-h-screen bg-black text-white font-montserrat">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <span className="text-xs font-bold text-red-600 tracking-widest uppercase">Información útil</span>
        <h1 className="text-4xl md:text-5xl font-black font-bebas tracking-wider uppercase mt-1 mb-10">
          Envíos y devoluciones
        </h1>

        <section className="mb-10">
          <h2 className="text-xl font-bebas tracking-wider uppercase text-red-500 mb-3">Envíos</h2>
          <div className="text-sm text-neutral-300 leading-relaxed space-y-3">
            <p>Hacemos envíos a todo el país a través de una empresa de correo/logística.</p>
            <p>
              El costo de envío es de ${money(SHIPPING_COST)}, y es <strong className="text-white">gratis en compras superiores a ${money(FREE_SHIPPING_THRESHOLD)}</strong>.
            </p>
            <p>
              Los pedidos se despachan dentro de las 24 a 48 horas hábiles posteriores a la confirmación del pago. El tiempo estimado de entrega, una vez despachado, es de 2 a 5 días hábiles según la localidad.
            </p>
            <p>
              Cuando tu pedido sale de nuestro depósito te avisamos y podés seguirlo desde{" "}
              <Link href="/seguimiento" className="text-white underline hover:text-red-500">
                Seguimiento de pedido
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bebas tracking-wider uppercase text-red-500 mb-3">Cambios y devoluciones</h2>
          <div className="text-sm text-neutral-300 leading-relaxed space-y-3">
            <p>
              Tenés hasta 30 días corridos desde que recibís tu pedido para solicitar un cambio de talle o prenda. La prenda tiene que estar sin uso, con las etiquetas originales y en perfecto estado.
            </p>
            <p>
              El costo de envío del cambio (ida y vuelta) corre por cuenta del cliente, salvo que se trate de un error nuestro o un producto con falla, en cuyo caso lo cubrimos nosotros.
            </p>
            <p>
              Si preferís la devolución del dinero en lugar de un cambio, se reintegra por el mismo medio de pago utilizado, una vez que recibimos e inspeccionamos la prenda.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bebas tracking-wider uppercase text-red-500 mb-3">Cómo iniciar un cambio</h2>
          <div className="text-sm text-neutral-300 leading-relaxed space-y-3">
            <p>Escribinos por WhatsApp con tu número de pedido, contándonos qué querés cambiar.</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-sm"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bebas tracking-wider uppercase text-red-500 mb-3">Cancelaciones</h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Podés cancelar tu pedido sin costo mientras esté pendiente de pago. Si ya transferiste, te reintegramos el monto por el mismo medio dentro de las 72 horas hábiles.
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}

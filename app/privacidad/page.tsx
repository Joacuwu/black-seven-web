// Política de privacidad genérica para una tienda chica (sin login de usuarios, pago por
// transferencia). Punto de partida razonable, no reemplaza la revisión de un abogado.
import type { Metadata } from "next";
import Footer from "@/components/footer";
import { WHATSAPP_NUMBER } from "@/lib/payment-config";

export const metadata: Metadata = {
  title: "Política de Privacidad | BLACK SEVEN",
  description: "Cómo usamos tus datos personales en BLACK SEVEN.",
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-black text-white font-montserrat">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <span className="text-xs font-bold text-red-600 tracking-widest uppercase">Legal</span>
        <h1 className="text-4xl md:text-5xl font-black font-bebas tracking-wider uppercase mt-1 mb-2">
          Política de privacidad
        </h1>
        <p className="text-xs text-neutral-500 mb-10">Última actualización: septiembre de 2026.</p>

        <div className="text-sm text-neutral-300 leading-relaxed space-y-8">
          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">1. Qué datos pedimos</h2>
            <p>
              Para procesar tu pedido te pedimos nombre, teléfono, email y dirección de envío. Los datos de la
              transferencia (comprobante) nos los mandás vos por WhatsApp; no manejamos ni almacenamos datos de
              tarjetas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">2. Para qué los usamos</h2>
            <p>
              Usamos tus datos únicamente para gestionar tu pedido: confirmarlo, coordinarlo con el envío,
              avisarte por mail o WhatsApp sobre su estado, y resolver cambios o reclamos. No los usamos para
              enviarte publicidad que no pediste.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">3. Con quién los compartimos</h2>
            <p>
              No vendemos ni cedemos tus datos a terceros. Solo los compartimos con los proveedores necesarios
              para operar la tienda (por ejemplo, el servicio que envía los mails de confirmación y la empresa
              de logística para el envío), en la medida necesaria para prestar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">4. Dónde se guardan</h2>
            <p>
              Tus datos se almacenan en servidores con acceso restringido y conexión encriptada (HTTPS). Los
              conservamos mientras sea necesario para atender tu compra y cumplir obligaciones legales o
              impositivas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">5. Cookies</h2>
            <p>
              Usamos almacenamiento local del navegador para recordar tu carrito y tus favoritos mientras
              navegás. No usamos cookies de rastreo publicitario de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bebas tracking-wider uppercase text-red-500 mb-2">6. Tus derechos</h2>
            <p>
              De acuerdo con la Ley 25.326 de Protección de los Datos Personales, podés pedirnos acceder,
              corregir o eliminar tus datos personales cuando quieras, escribiéndonos por{" "}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:text-red-500"
              >
                WhatsApp
              </a>
              . La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley
              25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan por el
              incumplimiento de las normas sobre protección de datos personales.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}

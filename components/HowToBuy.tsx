import Link from "next/link";
import { CreditCard, PackageCheck, Ruler, Truck } from "lucide-react";
import { TRANSFER_DISCOUNT_RATE } from "@/lib/pricing-constants";

const STEPS = [
  {
    icon: Ruler,
    title: "Elegí tu prenda y tu talle",
    text: "Entrá al producto, elegí el talle (tenés la guía de talles ahí mismo) y tocá Agregar.",
  },
  {
    icon: PackageCheck,
    title: "Completá tus datos",
    text: "Abrí el carrito, tocá Finalizar compra y cargá tus datos y tu dirección de envío.",
  },
  {
    icon: CreditCard,
    title: "Elegí cómo pagar",
    text: `Con transferencia tenés ${Math.round(TRANSFER_DISCOUNT_RATE * 100)}% de descuento. Te mandamos un mail con tu número de pedido.`,
  },
  {
    icon: Truck,
    title: "Seguí tu pedido",
    text: "Entrá a “Mi pedido” con tu número y tu email para ver en qué paso está y tu código de envío.",
  },
];

export default function HowToBuy() {
  return (
    <section className="bg-black text-white px-4 md:px-6 py-16 border-t border-neutral-900 font-montserrat">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-wider uppercase text-center font-bebas">Cómo comprar</h2>
        <p className="text-center text-sm text-neutral-400 mt-2 mb-10">Es fácil y lo podés hacer desde tu celular.</p>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="bg-neutral-950 border border-neutral-900 rounded-md p-5 flex sm:flex-col gap-4">
              <div className="flex-shrink-0 relative w-12 h-12 rounded-full bg-red-600/15 border border-red-600/40 flex items-center justify-center text-red-500">
                <Icon size={22} />
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm">{title}</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-center text-xs text-neutral-500 mt-8">
          ¿Dudas? Escribinos por{" "}
          <Link href="https://wa.me/5491127035976" target="_blank" rel="noopener noreferrer" className="text-white underline">
            WhatsApp
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

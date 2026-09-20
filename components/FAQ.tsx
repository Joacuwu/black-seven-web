"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "¿CUÁLES SON LOS TIEMPOS Y COSTOS DE ENVÍO?",
    answer:
      "Realizamos envíos a todo el país. Los despachos se procesan dentro de las 24 a 48 horas hábiles posteriores a la confirmación de la compra. Una vez despachado, el tiempo de entrega estimado es de 2 a 5 días hábiles, según la ubicación.",
  },
  {
    question: "¿CÓMO PUEDO REALIZAR UN CAMBIO DE TALLE O PRENDA?",
    answer:
      "Podés solicitar el cambio dentro de los 30 días posteriores a la recepción de tu compra. La prenda debe encontrarse sin uso, con las etiquetas originales y en perfecto estado. Ponete en contacto mediante nuestro WhatsApp o mail para coordinar la devolución.",
  },
  {
    question: "¿CÓMO SÉ CUÁL ES MI TALLE?",
    answer:
      "En cada ficha de producto contamos con la opción 'Ver Guía de Talles' con las medidas exactas expresadas en centímetros sobre la prenda plana. Te recomendamos comparar esas medidas con una prenda propia.",
  },
  {
    question: "¿QUÉ MEDIOS DE PAGO ACEPTAN?",
    answer:
      "Por ahora aceptamos transferencia bancaria (desde cualquier banco o billetera virtual) con 10% de descuento. Al terminar tu pedido te mostramos el alias y el CBU, y nos mandás el comprobante por WhatsApp para confirmarlo. Muy pronto vamos a sumar pago con tarjeta.",
  },
  {
    question: "¿CÓMO HAGO EL SEGUIMIENTO DE MI PEDIDO?",
    answer:
      "Una vez despachado tu paquete, recibirás un número de guía o código de seguimiento por correo electrónico (o por WhatsApp si coordinaste directo) para rastrear el recorrido en tiempo real desde nuestra sección de seguimiento.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="preguntas-frecuentes" className="py-16 px-6 bg-black border-t border-neutral-900 font-montserrat">
      <div className="max-w-4xl mx-auto">
        {/* ENCABEZADO */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">
            INFORMACIÓN ÚTIL
          </span>
          <h2 className="text-4xl font-black font-bebas tracking-wider text-white mt-1 uppercase">
            PREGUNTAS FRECUENTES
          </h2>
          <p className="text-xs text-neutral-400 mt-2">
            Resolvemos tus dudas sobre envíos, pagos y políticas de cambio.
          </p>
        </div>

        {/* LISTADO DE PREGUNTAS (ACORDEÓN) */}
        <div className="flex flex-col gap-4">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 text-left font-bebas text-xl tracking-wider text-white hover:text-red-500 transition-colors cursor-pointer"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-red-500" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-neutral-900/60 animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

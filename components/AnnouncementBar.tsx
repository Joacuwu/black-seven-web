"use client";

import { useState, useEffect } from "react";
import { FREE_SHIPPING_THRESHOLD, TRANSFER_DISCOUNT_RATE } from "@/lib/pricing-constants";

const ANNOUNCEMENTS = [
  `ENVÍOS GRATIS A TODO EL PAÍS EN COMPRAS SUPERIORES A $${FREE_SHIPPING_THRESHOLD.toLocaleString("es-AR")}`,
  `${TRANSFER_DISCOUNT_RATE * 100}% DE DESCUENTO PAGANDO POR TRANSFERENCIA`,
  "DROP #01 DISPONIBLE - EDICIÓN LIMITADA"
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-red-600 text-white text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase py-1.5 px-4 text-center">
      <p className="animate-fade-in">{ANNOUNCEMENTS[currentIndex]}</p>
    </div>
  );
}
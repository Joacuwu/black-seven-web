"use client";

import { useState, useEffect } from "react";

const ANNOUNCEMENTS = [
  "ENVÍOS GRATIS A TODO EL PAÍS EN COMPRAS SUPERIORES A $80.000",
  "3 Y 6 CUOTAS SIN INTERÉS EN TODA LA WEB",
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
    <div className="bg-neutral-900 text-neutral-300 text-[11px] font-bold tracking-widest uppercase py-2 px-4 text-center border-b border-neutral-800 transition-all duration-500">
      <p className="animate-fade-in">{ANNOUNCEMENTS[currentIndex]}</p>
    </div>
  );
}
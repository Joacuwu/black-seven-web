"use client";

import { useEffect, useRef, useState } from "react";

const PIXELS_PER_SECOND = 110;

export default function AnnouncementBar({ messages }: { messages: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [{ repeat, duration }, setSetup] = useState({ repeat: 3, duration: 20 });

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const recalc = () => {
      const containerWidth = container.clientWidth;
      const contentWidth = measure.scrollWidth || 1;
      // Se repite el bloque las veces que hagan falta para cubrir toda la línea, aunque el
      // texto sea corto, y para que la vuelta del loop no se note.
      const nextRepeat = Math.max(2, Math.ceil(containerWidth / contentWidth) + 1);
      setSetup({ repeat: nextRepeat, duration: (contentWidth * nextRepeat) / PIXELS_PER_SECOND });
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [messages]);

  if (messages.length === 0) return null;

  const messageSpans = (keyPrefix: string) =>
    messages.map((message, index) => (
      <span key={`${keyPrefix}-${index}`} className="px-8 whitespace-nowrap">
        {message}
      </span>
    ));

  return (
    <div
      ref={containerRef}
      className="relative bg-red-600 text-white text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase py-1.5 overflow-hidden"
    >
      {/* Para lectores de pantalla: los mensajes se leen una sola vez, la cinta de abajo es solo visual. */}
      <span className="sr-only">{messages.join(". ")}</span>

      {/* Bloque invisible, solo para medir el ancho real de una vuelta de texto. */}
      <div ref={measureRef} className="absolute invisible flex whitespace-nowrap">
        {messageSpans("measure")}
      </div>

      <div className="flex w-max animate-marquee" style={{ animationDuration: `${duration}s` }} aria-hidden="true">
        {Array.from({ length: repeat }).map((_, i) => (
          <div className="flex shrink-0" key={`a-${i}`}>
            {messageSpans(`a-${i}`)}
          </div>
        ))}
        {Array.from({ length: repeat }).map((_, i) => (
          <div className="flex shrink-0" key={`b-${i}`}>
            {messageSpans(`b-${i}`)}
          </div>
        ))}
      </div>
    </div>
  );
}

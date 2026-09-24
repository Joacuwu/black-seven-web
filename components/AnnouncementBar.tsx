"use client";

import { useState, useEffect } from "react";

export default function AnnouncementBar({ messages }: { messages: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="bg-red-600 text-white text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase py-1.5 px-4 text-center">
      <p className="animate-fade-in">{messages[currentIndex % messages.length]}</p>
    </div>
  );
}

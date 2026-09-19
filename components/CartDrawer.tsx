"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { X, Trash2, CreditCard } from "lucide-react";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
  const [loadingPayment, setLoadingPayment] = useState(false);

  const PHONE_NUMBER = "5491127035976";

  const getWhatsAppUrl = () => {
    if (cart.length === 0) return "#";

    let message = "¡Hola *BLACK SEVEN*! Quiero realizar el siguiente pedido:\n\n";
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* - Talle: ${item.size} - ${item.price}\n`;
    });
    message += "\n¿Tienen stock disponible para coordinar el pago y envío?";

    return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const handleOnlinePayment = async () => {
    setLoadingPayment(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Ocurrió un error al iniciar el pago.");
      }
    } catch (error) {
      console.error("Error en pago:", error);
      alert("Error al conectar con la pasarela de pagos.");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
        isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setIsCartOpen(false)}
    >
      {/* CONTENEDOR LATERAL CON DESLIZAMIENTO */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col justify-between h-full font-montserrat transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        
        {/* HEADER Y PRODUCTOS */}
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
            <h2 className="font-bebas text-3xl tracking-wider text-white">TU CARRITO ({cart.length})</h2>
            <button 
              onClick={() => setIsCartOpen(false)} 
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-8">Tu bolsa está vacía.</p>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="flex items-center justify-between bg-neutral-900 p-3 border border-neutral-800">
                  <img src={item.img} alt={item.name} className="w-16 h-16 object-cover" />
                  <div className="flex-1 ml-4">
                    <h4 className="font-bebas text-lg text-white leading-none">{item.name}</h4>
                    <p className="text-xs text-red-500 mt-1">Talle: {item.size}</p>
                    <p className="text-xs text-neutral-300 font-bold mt-1">{item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.size)} className="text-neutral-500 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACCIONES Y BOTONES */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-3">
            
            {/* BOTÓN 1: FINALIZAR COMPRA EN LA WEB */}
              <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-white hover:bg-neutral-200 text-black font-bebas text-xl py-3 tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                  <CreditCard size={20} />
                    PAGAR ONLINE (TARJETA / MP)
              </Link>

            {/* BOTÓN 2: COMPRAR POR WHATSAPP */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-bebas text-xl py-3 tracking-widest uppercase transition-colors text-center"
            >
              Comprar por WhatsApp
            </a>

          </div>
        )}

      </div>
    </div>
  );
}
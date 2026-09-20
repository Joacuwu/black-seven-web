"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    metodoPago: "transferencia", // 'transferencia' | 'naranjax'
  });

  const [loading, setLoading] = useState(false);

  // Cálculo de envío gratis arriba de $50.000
  const shippingCost = totalPrice > 50000 || cart.length === 0 ? 0 : 4500;
  const finalTotal = totalPrice + shippingCost;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // El servidor recalcula precios y totales con el catálogo; solo enviamos ids, talles y cantidades.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          items: cart.map(({ id, size, quantity }) => ({ id, size, quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Ocurrió un error inesperado");
        setLoading(false);
        return;
      }

      // Pago online: el carrito se vacía recién cuando el cliente vuelve con el pago aprobado.
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }

      clearCart();
      router.push(`/checkout/exito?order=${data.orderNumber}`);
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      alert("Ocurrió un error de conexión al enviar el pedido.");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-black text-white flex flex-col items-center justify-center p-6 text-center font-montserrat">
        <h1 className="text-3xl font-bebas tracking-wide mb-4">
          TU CARRITO ESTÁ VACÍO
        </h1>
        <p className="text-neutral-400 text-sm mb-6">
          No tenés productos cargados para realizar el checkout.
        </p>
        <Link
          href="/coleccion"
          className="bg-white text-black px-6 py-3 font-bebas text-lg tracking-wider hover:bg-neutral-200 transition-colors"
        >
          VER COLECCIÓN
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 md:px-8 font-montserrat">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bebas tracking-wider mb-8 text-center md:text-left">
          FINALIZAR COMPRA
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* DATOS DEL CLIENTE Y ENVÍO */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-sm">
              <h2 className="text-lg font-bold font-bebas tracking-wider mb-4 text-red-600">
                1. DATOS DE CONTACTO
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre *"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="bg-black border border-neutral-800 p-3 text-sm rounded focus:border-white outline-none"
                />
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido *"
                  required
                  value={formData.apellido}
                  onChange={handleChange}
                  className="bg-black border border-neutral-800 p-3 text-sm rounded focus:border-white outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-black border border-neutral-800 p-3 text-sm rounded focus:border-white outline-none"
                />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono / WhatsApp *"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="bg-black border border-neutral-800 p-3 text-sm rounded focus:border-white outline-none"
                />
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-sm">
              <h2 className="text-lg font-bold font-bebas tracking-wider mb-4 text-red-600">
                2. DIRECCIÓN DE ENVÍO
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="direccion"
                  placeholder="Calle y número *"
                  required
                  value={formData.direccion}
                  onChange={handleChange}
                  className="bg-black border border-neutral-800 p-3 text-sm rounded focus:border-white outline-none md:col-span-2"
                />
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ciudad / Localidad *"
                  required
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="bg-black border border-neutral-800 p-3 text-sm rounded focus:border-white outline-none"
                />
                <input
                  type="text"
                  name="codigoPostal"
                  placeholder="Código Postal *"
                  required
                  value={formData.codigoPostal}
                  onChange={handleChange}
                  className="bg-black border border-neutral-800 p-3 text-sm rounded focus:border-white outline-none"
                />
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-sm">
              <h2 className="text-lg font-bold font-bebas tracking-wider mb-4 text-red-600">
                3. MÉTODO DE PAGO
              </h2>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 border border-neutral-800 rounded bg-black cursor-pointer hover:border-neutral-700">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="transferencia"
                    checked={formData.metodoPago === "transferencia"}
                    onChange={handleChange}
                    className="accent-red-600"
                  />
                  <div>
                    <p className="text-sm font-bold">
                      Transferencia Bancaria (-10% OFF)
                    </p>
                    <p className="text-xs text-neutral-500">
                      Recibirás los datos bancarios al finalizar
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-neutral-800 rounded bg-black cursor-pointer hover:border-neutral-700">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="naranjax"
                    checked={formData.metodoPago === "naranjax"}
                    onChange={handleChange}
                    className="accent-red-600"
                  />
                  <div>
                    <p className="text-sm font-bold">Naranja X / Tarjetas</p>
                    <p className="text-xs text-neutral-500">
                      Tarjeta Naranja X, crédito o débito
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RESUMEN DE COMPRA */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-sm sticky top-6 flex flex-col gap-4">
              <h2 className="text-xl font-bebas tracking-wider border-b border-neutral-800 pb-3">
                RESUMEN DE COMPRA
              </h2>

              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${index}`}
                    className="flex items-center gap-3 text-xs border-b border-neutral-900 pb-2"
                  >
                    <div className="relative w-12 h-14 bg-neutral-900 flex-shrink-0">
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white uppercase">
                        {item.name}
                      </p>
                      <p className="text-neutral-500">
                        Talle: {item.size} | Cant: {item.quantity || 1}
                      </p>
                    </div>
                    <p className="font-bold">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 text-xs text-neutral-400 border-t border-neutral-900 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>
                    {shippingCost === 0
                      ? "¡GRATIS!"
                      : `$${shippingCost.toLocaleString("es-AR")}`}
                  </span>
                </div>
                {formData.metodoPago === "transferencia" && (
                  <div className="flex justify-between text-green-500 font-semibold">
                    <span>Descuento Transferencia (10%):</span>
                    <span>-${(totalPrice * 0.1).toLocaleString("es-AR")}</span>
                  </div>
                )}
              </div>

              <hr className="border-neutral-800" />

              <div className="flex justify-between items-center font-bold text-base">
                <span>TOTAL:</span>
                <span className="text-xl text-white">
                  $
                  {(formData.metodoPago === "transferencia"
                    ? finalTotal - totalPrice * 0.1
                    : finalTotal
                  ).toLocaleString("es-AR")}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bebas tracking-wider text-xl py-4 transition-all mt-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "PROCESANDO PEDIDO..." : "CONFIRMAR PEDIDO"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

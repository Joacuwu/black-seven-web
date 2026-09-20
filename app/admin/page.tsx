"use client";

import { useCallback, useEffect, useState } from "react";
import OrdersPanel from "@/components/admin/OrdersPanel";
import ProductsPanel from "@/components/admin/ProductsPanel";

type Tab = "pedidos" | "productos";

export default function AdminPage() {
  const [authState, setAuthState] = useState<"loading" | "out" | "in">("loading");
  const [tab, setTab] = useState<Tab>("pedidos");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch("/api/admin/login")
      .then((res) => res.json())
      .then((data) => setAuthState(data.authenticated ? "in" : "out"))
      .catch(() => setAuthState("out"));
  }, []);

  const handleUnauthorized = useCallback(() => setAuthState("out"), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      setAuthState("in");
    } else {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error || "No se pudo iniciar sesión.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthState("out");
  };

  if (authState === "loading") {
    return <div className="min-h-[60vh] bg-black text-neutral-500 text-sm flex items-center justify-center">Cargando...</div>;
  }

  if (authState === "out") {
    return (
      <div className="min-h-[70vh] bg-black text-white flex items-center justify-center p-4 font-montserrat">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-neutral-950 border border-neutral-900 rounded-md p-6 space-y-4">
          <h1 className="font-bebas text-3xl tracking-wider text-center">PANEL BLACK SEVEN</h1>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-black border border-neutral-800 rounded p-3 text-sm focus:border-white outline-none"
          />
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors cursor-pointer">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 md:px-8 font-montserrat">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-neutral-950 border border-neutral-900 rounded-md p-1">
            {(["pedidos", "productos"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded font-bebas text-2xl tracking-wider uppercase transition-colors cursor-pointer ${
                  tab === t ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="border border-neutral-800 px-3 py-2 rounded text-xs hover:border-white transition-colors cursor-pointer">
            Salir
          </button>
        </div>

        {tab === "pedidos" ? (
          <OrdersPanel onUnauthorized={handleUnauthorized} />
        ) : (
          <ProductsPanel onUnauthorized={handleUnauthorized} />
        )}
      </div>
    </div>
  );
}

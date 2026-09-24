"use client";

import { useCallback, useEffect, useState } from "react";
import type { Announcement } from "@/lib/announcements-types";
import { ANNOUNCEMENT_MAX_ITEMS, ANNOUNCEMENT_TEXT_LIMIT } from "@/lib/announcements-types";

const newAnnouncement = (): Announcement => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `tmp-${Date.now()}`,
  text: "",
  active: true,
});

export default function AnnouncementsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const request = useCallback(
    async (url: string, method: string, body?: unknown) => {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (res.status === 401) {
        onUnauthorized();
        throw new Error("Tu sesión venció. Volvé a entrar.");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ocurrió un error.");
      return data;
    },
    [onUnauthorized]
  );

  const load = useCallback(async () => {
    try {
      const data = await request("/api/admin/announcements", "GET");
      setItems(data.announcements);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el cartel.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const update = (id: string, patch: Partial<Announcement>) => {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const remove = (id: string) => setItems((list) => list.filter((item) => item.id !== id));

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    setItems((list) => {
      const reordered = [...list];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const data = await request("/api/admin/announcements", "PUT", { announcements: items });
      setItems(data.announcements);
      setMessage("Cartel guardado ✓");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <details className="mb-4 bg-neutral-950 border border-neutral-900 rounded-md text-sm">
        <summary className="px-4 py-3 cursor-pointer font-bold">¿Cómo se usa esta pantalla?</summary>
        <ul className="px-4 pb-4 pt-1 list-disc list-inside space-y-1.5 text-neutral-300 text-xs leading-relaxed">
          <li>Es el cartel rojo que rota arriba de todo en la tienda.</li>
          <li>Si cargás más de un mensaje, van rotando solos cada 4 segundos.</li>
          <li><b>Ocultar</b> saca un mensaje de la rotación sin borrarlo.</li>
          <li>Los cambios se guardan recién al tocar <b>Guardar cartel</b>, y se ven enseguida en la tienda.</li>
          <li>Si no dejás ningún mensaje visible, el cartel desaparece de la tienda.</li>
        </ul>
      </details>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-400">{items.length} mensajes</p>
        <button
          onClick={() => setItems((list) => [...list, newAnnouncement()])}
          disabled={items.length >= ANNOUNCEMENT_MAX_ITEMS}
          className="bg-white text-black text-sm md:text-xs font-bold px-4 py-3 md:py-2.5 rounded hover:bg-neutral-200 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          + Agregar mensaje
        </button>
      </div>

      {message && <p className="text-sm text-neutral-300 mb-4">{message}</p>}

      <div className="space-y-3">
        {loading && <p className="text-neutral-500 text-sm text-center py-12">Cargando...</p>}
        {!loading && items.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-12">No hay mensajes. El cartel no se muestra en la tienda.</p>
        )}
        {items.map((item, index) => (
          <div key={item.id} className={`bg-neutral-950 border border-neutral-900 rounded-md p-3 ${item.active ? "" : "opacity-60"}`}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Subir" className="w-10 h-10 border border-neutral-800 rounded disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed">↑</button>
                <button onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Bajar" className="w-10 h-10 border border-neutral-800 rounded disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed">↓</button>
              </div>
              <input
                value={item.text}
                onChange={(e) => update(item.id, { text: e.target.value })}
                maxLength={ANNOUNCEMENT_TEXT_LIMIT}
                placeholder="Ej: ENVÍOS GRATIS EN COMPRAS SUPERIORES A $50.000"
                className="flex-1 min-w-0 bg-black border border-neutral-800 rounded p-2.5 text-sm text-white focus:border-white outline-none uppercase"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs mt-3">
              <button onClick={() => update(item.id, { active: !item.active })} className="border border-neutral-800 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">
                {item.active ? "Ocultar" : "Mostrar"}
              </button>
              <button onClick={() => remove(item.id)} className="border border-red-900 text-red-400 px-4 py-2.5 rounded hover:bg-red-950 transition-colors cursor-pointer">
                Eliminar
              </button>
              {!item.active && <span className="inline-flex items-center text-[10px] font-bold text-amber-300 border border-amber-700/50 bg-amber-900/30 px-1.5 py-0.5 rounded">OCULTO</span>}
            </div>
          </div>
        ))}
      </div>

      {!loading && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? "Guardando..." : "Guardar cartel"}
        </button>
      )}
    </div>
  );
}

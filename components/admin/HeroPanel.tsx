"use client";

import { useCallback, useEffect, useState } from "react";
import { compressImage, uploadBlob } from "@/components/admin/imageTools";
import type { HeroSlide } from "@/lib/hero-types";
import type { Product } from "@/lib/catalog-types";

const HERO_IMAGE_SIDE = 2400;

interface FormState {
  id?: number;
  imageUrl: string;
  mobileImageUrl: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
  active: boolean;
}

const emptyForm: FormState = {
  imageUrl: "",
  mobileImageUrl: "",
  eyebrow: "",
  title: "",
  subtitle: "",
  buttonLabel: "",
  buttonUrl: "",
  active: true,
};

const formFromSlide = (s: HeroSlide): FormState => ({
  id: s.id,
  imageUrl: s.imageUrl,
  mobileImageUrl: s.mobileImageUrl ?? "",
  eyebrow: s.eyebrow ?? "",
  title: s.title ?? "",
  subtitle: s.subtitle ?? "",
  buttonLabel: s.buttonLabel ?? "",
  buttonUrl: s.buttonUrl ?? "",
  active: s.active,
});

const payloadFromSlide = (s: HeroSlide, patch: Partial<HeroSlide>) => ({ ...s, ...patch });

const inputClass =
  "w-full bg-black border border-neutral-800 rounded p-2.5 text-base md:text-sm text-white focus:border-white outline-none";
const labelClass = "block text-xs text-neutral-400 uppercase tracking-wider mb-1";

export default function HeroPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [showProducts, setShowProducts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState<"main" | "mobile" | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

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
      const data = await request("/api/admin/hero", "GET");
      setSlides(data.slides);
      setShowProducts(data.showProducts);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar la portada.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Lista de productos para elegir a dónde lleva el botón
  useEffect(() => {
    if (!form || products.length > 0) return;
    request("/api/admin/products", "GET")
      .then((data) => setProducts(data.products))
      .catch(() => {});
  }, [form, products.length, request]);

  const openForm = (value: FormState) => {
    setMessage("");
    setFormError("");
    setForm(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError("");
    try {
      if (form.id) await request(`/api/admin/hero/${form.id}`, "PUT", form);
      else await request("/api/admin/hero", "POST", form);
      setForm(null);
      setMessage(form.id ? "Diapositiva guardada ✓" : "Diapositiva agregada ✓");
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    setMessage("");
    try {
      await request(`/api/admin/hero/${slide.id}`, "PUT", payloadFromSlide(slide, { active: !slide.active }));
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar.");
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!window.confirm("¿Eliminar esta foto de la portada para siempre?\n\nSi solo querés que deje de verse, usá \"Ocultar\".")) return;
    setMessage("");
    try {
      await request(`/api/admin/hero/${slide.id}`, "DELETE");
      setMessage("Diapositiva eliminada ✓");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar.");
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSlides(reordered);
    setMessage("");
    try {
      await request("/api/admin/hero/reorder", "POST", { ids: reordered.map((s) => s.id) });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el orden.");
      await load();
    }
  };

  const toggleShowProducts = async (value: boolean) => {
    setShowProducts(value);
    setMessage("");
    try {
      await request("/api/admin/hero", "PATCH", { showProducts: value });
      setMessage(value ? "Los productos se muestran en el carrusel ✓" : "Los productos ya no se muestran en el carrusel ✓");
    } catch (error) {
      setShowProducts(!value);
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el ajuste.");
    }
  };

  const uploadPhoto = async (file: File | undefined, target: "main" | "mobile") => {
    if (!file || !form) return;
    setFormError("");
    setUploading(target);
    try {
      const blob = await compressImage(file, HERO_IMAGE_SIDE);
      const { uploadUrl, publicUrl } = await request("/api/admin/upload", "POST", { contentType: "image/jpeg" });
      await uploadBlob(uploadUrl, blob);
      setForm((f) => (f ? { ...f, [target === "main" ? "imageUrl" : "mobileImageUrl"]: publicUrl } : f));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo subir la foto.");
    } finally {
      setUploading(null);
    }
  };

  // ---------------- FORMULARIO ----------------
  if (form) {
    const destinations = [
      { value: "/coleccion", label: "Toda la colección" },
      ...products.map((p) => ({ value: `/producto/${p.id}`, label: `Producto: ${p.name}` })),
    ];
    if (form.buttonUrl && !destinations.some((d) => d.value === form.buttonUrl)) {
      destinations.push({ value: form.buttonUrl, label: `Otro: ${form.buttonUrl}` });
    }

    return (
      <form onSubmit={handleSave} className="bg-neutral-950 border border-neutral-900 rounded-md p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bebas text-3xl tracking-wider">{form.id ? "EDITAR FOTO" : "NUEVA FOTO DE PORTADA"}</h2>
          <button type="button" onClick={() => setForm(null)} className="text-xs border border-neutral-800 px-3 py-2 rounded hover:border-white transition-colors cursor-pointer">
            Cancelar
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Foto principal *</label>
            <div className="relative aspect-video bg-neutral-900 border border-neutral-800 rounded overflow-hidden">
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="Foto principal" className="w-full h-full object-cover" />
              )}
              {uploading === "main" && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs">Subiendo...</div>}
            </div>
            <label className="mt-2 inline-block text-xs border border-neutral-700 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">
              {form.imageUrl ? "Cambiar foto" : "Elegir foto"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { uploadPhoto(e.target.files?.[0], "main"); e.target.value = ""; }} />
            </label>
            <p className="text-[11px] text-neutral-500 mt-1">Ideal: horizontal (como una foto de compu o de celular acostado).</p>
          </div>

          <div>
            <label className={labelClass}>Foto para celular (opcional)</label>
            <div className="relative aspect-[9/16] max-h-56 bg-neutral-900 border border-neutral-800 rounded overflow-hidden">
              {form.mobileImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.mobileImageUrl} alt="Foto para celular" className="w-full h-full object-cover" />
              )}
              {uploading === "mobile" && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs">Subiendo...</div>}
            </div>
            <div className="mt-2 flex gap-2">
              <label className="text-xs border border-neutral-700 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">
                {form.mobileImageUrl ? "Cambiar" : "Elegir foto"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { uploadPhoto(e.target.files?.[0], "mobile"); e.target.value = ""; }} />
              </label>
              {form.mobileImageUrl && (
                <button type="button" onClick={() => setForm({ ...form, mobileImageUrl: "" })} className="text-xs border border-red-900 text-red-400 px-4 py-2.5 rounded cursor-pointer">
                  Quitar
                </button>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Vertical. Si no la cargás, en el celular se usa la foto principal.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Texto chico arriba (opcional)</label>
            <input maxLength={40} value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} className={inputClass} placeholder="Ej: Nueva colección" />
          </div>
          <div>
            <label className={labelClass}>Título (opcional)</label>
            <input maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Ej: DROP #02" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Texto de abajo (opcional)</label>
            <input maxLength={200} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} placeholder="Ej: Ya disponible, stock limitado" />
          </div>
          <div>
            <label className={labelClass}>Botón: texto (opcional)</label>
            <input maxLength={30} value={form.buttonLabel} onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })} className={inputClass} placeholder="Ej: Ver ahora" />
          </div>
          <div>
            <label className={labelClass}>Botón: a dónde lleva</label>
            <select value={form.buttonUrl} onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })} className={inputClass}>
              <option value="">Sin botón</option>
              {destinations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 -mt-2">Si dejás vacíos el título, el texto y el botón, se muestra solo la foto.</p>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-red-600 w-4 h-4" />
          Visible en la tienda
        </label>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button type="submit" disabled={saving || uploading !== null || !form.imageUrl} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed">
          {saving ? "Guardando..." : uploading ? "Esperá que termine de subir la foto..." : !form.imageUrl ? "Primero elegí una foto" : "Guardar"}
        </button>
      </form>
    );
  }

  // ---------------- LISTA ----------------
  return (
    <div>
      <details className="mb-4 bg-neutral-950 border border-neutral-900 rounded-md text-sm">
        <summary className="px-4 py-3 cursor-pointer font-bold">¿Cómo se usa esta pantalla?</summary>
        <ul className="px-4 pb-4 pt-1 list-disc list-inside space-y-1.5 text-neutral-300 text-xs leading-relaxed">
          <li>Estas son las fotos grandes que se deslizan arriba de todo en la tienda.</li>
          <li><b>Agregar:</b> tocá “+ Agregar foto”, elegí la foto y, si querés, escribí un título y un botón.</li>
          <li><b>Orden:</b> usá las flechas ↑ ↓ para subir o bajar una foto.</li>
          <li><b>Ocultar</b> la saca de la tienda sin borrarla. <b>Eliminar</b> la borra para siempre.</li>
          <li>Los cambios se ven enseguida en la tienda (a veces hay que recargar la página).</li>
        </ul>
      </details>

      <label className="flex items-start gap-3 bg-neutral-950 border border-neutral-900 rounded-md p-4 mb-4 cursor-pointer">
        <input type="checkbox" checked={showProducts} onChange={(e) => toggleShowProducts(e.target.checked)} className="accent-red-600 w-4 h-4 mt-0.5" />
        <span className="text-sm">
          Mostrar también productos de la tienda en el carrusel
          <span className="block text-xs text-neutral-500 mt-0.5">Después de tus fotos aparecen hasta 4 productos, con su precio y un botón para comprar.</span>
        </span>
      </label>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-400">{slides.length} fotos</p>
        <button onClick={() => openForm(emptyForm)} className="bg-white text-black text-sm md:text-xs font-bold px-4 py-3 md:py-2.5 rounded hover:bg-neutral-200 transition-colors cursor-pointer">
          + Agregar foto
        </button>
      </div>

      {message && <p className="text-sm text-neutral-300 mb-4">{message}</p>}

      <div className="space-y-3">
        {loading && <p className="text-neutral-500 text-sm text-center py-12">Cargando...</p>}
        {!loading && slides.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-12">No hay fotos. La tienda va a mostrar una portada por defecto.</p>
        )}
        {slides.map((slide, index) => (
          <div key={slide.id} className={`bg-neutral-950 border border-neutral-900 rounded-md p-3 ${slide.active ? "" : "opacity-60"}`}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Subir" className="w-10 h-10 border border-neutral-800 rounded disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed">↑</button>
                <button onClick={() => move(index, 1)} disabled={index === slides.length - 1} aria-label="Bajar" className="w-10 h-10 border border-neutral-800 rounded disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed">↓</button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.imageUrl} alt="" className="w-28 h-20 md:w-40 md:h-24 object-cover rounded bg-neutral-900 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">{slide.title || "(solo foto)"}</p>
                <p className="text-xs text-neutral-400 truncate">{slide.subtitle || slide.eyebrow || "Sin texto"}</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {slide.buttonLabel ? `Botón: ${slide.buttonLabel}` : "Sin botón"}
                  {slide.mobileImageUrl ? " · Foto de celular ✓" : ""}
                </p>
                {!slide.active && <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 border border-amber-700/50 bg-amber-900/30 px-1.5 py-0.5 rounded">OCULTA</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs mt-3">
              <button onClick={() => openForm(formFromSlide(slide))} className="border border-neutral-700 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">Editar</button>
              <button onClick={() => toggleActive(slide)} className="border border-neutral-800 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">{slide.active ? "Ocultar" : "Mostrar"}</button>
              <button onClick={() => handleDelete(slide)} className="border border-red-900 text-red-400 px-4 py-2.5 rounded hover:bg-red-950 transition-colors cursor-pointer">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

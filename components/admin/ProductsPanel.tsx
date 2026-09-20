"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice, type Product } from "@/lib/catalog-types";
import { compressImage, uploadBlob } from "@/components/admin/imageTools";

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_CATEGORIES = ["remeras", "hoodies", "camperas", "conjuntos", "pantalones"];
const MAX_IMAGES = 8;

interface FormState {
  id?: number;
  name: string;
  category: string;
  price: string;
  tag: string;
  sizes: string[];
  /** Unidades por talle, como texto (vacío = sin límite). */
  stock: Record<string, string>;
  images: string[];
  description: string;
  detailsText: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  category: "",
  price: "",
  tag: "",
  sizes: [],
  stock: {},
  images: [],
  description: "",
  detailsText: "",
  active: true,
};

const formFromProduct = (p: Product): FormState => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: String(p.price),
  tag: p.tag ?? "",
  sizes: p.sizes,
  stock: Object.fromEntries(Object.entries(p.stock ?? {}).map(([size, units]) => [size, String(units)])),
  images: p.images,
  description: p.description,
  detailsText: p.details.join("\n"),
  active: p.active,
});

const payloadFromForm = (f: FormState) => ({
  name: f.name,
  category: f.category,
  price: Number(f.price),
  tag: f.tag,
  sizes: f.sizes,
  stock: Object.fromEntries(
    Object.entries(f.stock).filter(([size, units]) => f.sizes.includes(size) && units.trim() !== "").map(([size, units]) => [size, Number(units)])
  ),
  images: f.images,
  description: f.description,
  details: f.detailsText.split("\n"),
  active: f.active,
});

const payloadFromProduct = (p: Product, patch: Partial<Product>) => ({
  ...p,
  ...patch,
  tag: (patch.tag ?? p.tag) || "",
});

const inputClass =
  "w-full bg-black border border-neutral-800 rounded p-2.5 text-base md:text-sm text-white focus:border-white outline-none";
const labelClass = "block text-xs text-neutral-400 uppercase tracking-wider mb-1";

export default function ProductsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [customSize, setCustomSize] = useState("");
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "No se pudieron cargar los productos.");
      else setProducts(data.products);
    } catch {
      setMessage("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  const request = async (url: string, method: string, body?: unknown) => {
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError("");
    try {
      if (form.id) await request(`/api/admin/products/${form.id}`, "PUT", payloadFromForm(form));
      else await request("/api/admin/products", "POST", payloadFromForm(form));
      setForm(null);
      setMessage(form.id ? "Producto guardado ✓" : "Producto creado ✓");
      await loadProducts();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product: Product) => {
    setMessage("");
    try {
      await request(`/api/admin/products/${product.id}`, "PUT", payloadFromProduct(product, { active: !product.active }));
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar.");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`¿Eliminar "${product.name}" para siempre?\n\nSi solo querés que deje de verse, usá "Ocultar".`)) return;
    setMessage("");
    try {
      await request(`/api/admin/products/${product.id}`, "DELETE");
      setMessage("Producto eliminado ✓");
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar.");
    }
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || !form) return;
    const room = MAX_IMAGES - form.images.length;
    const selected = Array.from(files).slice(0, room);
    if (selected.length === 0) return;

    setFormError("");
    setUploading((n) => n + selected.length);
    for (const file of selected) {
      try {
        const blob = await compressImage(file);
        const { uploadUrl, publicUrl } = await request("/api/admin/upload", "POST", { contentType: "image/jpeg" });
        await uploadBlob(uploadUrl, blob);
        setForm((f) => (f ? { ...f, images: [...f.images, publicUrl] } : f));
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "No se pudo subir la foto.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const moveImage = (index: number, delta: -1 | 1) =>
    setForm((f) => {
      if (!f) return f;
      const target = index + delta;
      if (target < 0 || target >= f.images.length) return f;
      const images = [...f.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...f, images };
    });

  const toggleSize = (size: string) =>
    setForm((f) =>
      f ? { ...f, sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size] } : f
    );

  const addCustomSize = () => {
    const size = customSize.trim().toUpperCase();
    if (size && form && !form.sizes.includes(size)) toggleSize(size);
    setCustomSize("");
  };

  // ---------------- FORMULARIO ----------------
  if (form) {
    const categories = [...new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category)])];
    const sizeOptions = [...new Set([...SIZE_PRESETS, ...form.sizes])];

    return (
      <form onSubmit={handleSave} className="bg-neutral-950 border border-neutral-900 rounded-md p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bebas text-3xl tracking-wider">{form.id ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}</h2>
          <button type="button" onClick={() => setForm(null)} className="text-xs border border-neutral-800 px-3 py-2 rounded hover:border-white transition-colors cursor-pointer">
            Cancelar
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nombre *</label>
            <input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Ej: REMERA 777 WHITE" />
          </div>
          <div>
            <label className={labelClass}>Precio (en pesos, sin puntos) *</label>
            <input required type="number" min={1} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} placeholder="35000" />
          </div>
          <div>
            <label className={labelClass}>Categoría *</label>
            <input required list="categorias" maxLength={40} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="Elegí una o escribí una nueva" />
            <datalist id="categorias">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={labelClass}>Etiqueta (opcional)</label>
            <input maxLength={20} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className={inputClass} placeholder="NEW, HOT, DROP..." />
          </div>
          <label className="flex items-center gap-2 text-sm md:mt-6 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-red-600 w-4 h-4" />
            Visible en la tienda
          </label>
        </div>

        <div>
          <label className={labelClass}>Talles disponibles * (sacá el tilde a los que estén agotados)</label>
          <div className="flex flex-wrap gap-2 items-center">
            {sizeOptions.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-2 text-xs font-bold border rounded transition-colors cursor-pointer ${
                  form.sizes.includes(size) ? "bg-white text-black border-white" : "border-neutral-800 text-neutral-500 hover:border-neutral-600"
                }`}
              >
                {size}
              </button>
            ))}
            <input
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
              onBlur={addCustomSize}
              maxLength={10}
              placeholder="Otro talle (ej: 42)"
              className="bg-black border border-neutral-800 rounded p-2 text-xs w-36 focus:border-white outline-none"
            />
          </div>
        </div>

        {form.sizes.length > 0 && (
          <div>
            <label className={labelClass}>Stock por talle (opcional)</label>
            <div className="flex flex-wrap gap-3">
              {form.sizes.map((size) => (
                <label key={size} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-bold">{size}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={form.stock[size] ?? ""}
                    onChange={(e) => setForm({ ...form, stock: { ...form.stock, [size]: e.target.value } })}
                    placeholder="sin límite"
                    className="w-24 bg-black border border-neutral-800 rounded p-2 text-base md:text-sm text-white focus:border-white outline-none"
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              Escribí cuántas unidades hay. Al llegar a 0 el talle aparece como “Agotado” solo. Si lo dejás vacío, no se controla y se puede vender siempre.
            </p>
          </div>
        )}

        <div>
          <label className={labelClass}>Fotos * (la 1ª es la principal, la 2ª se ve al pasar el mouse)</label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((src, i) => (
              <div key={src} className="w-28">
                <div className="relative aspect-[4/5] bg-neutral-900 border border-neutral-800 rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-white text-black text-[10px] font-bold px-1.5 rounded">PRINCIPAL</span>}
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="px-2 py-1 border border-neutral-800 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed" aria-label="Mover a la izquierda">←</button>
                  <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="px-2 py-1 border border-red-900 text-red-400 rounded cursor-pointer" aria-label="Quitar foto">✕</button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="px-2 py-1 border border-neutral-800 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed" aria-label="Mover a la derecha">→</button>
                </div>
              </div>
            ))}
            {uploading > 0 && (
              <div className="w-28 aspect-[4/5] border border-dashed border-neutral-700 rounded flex items-center justify-center text-xs text-neutral-500 text-center p-2">
                Subiendo...
              </div>
            )}
            {form.images.length + uploading < MAX_IMAGES && (
              <label className="w-28 aspect-[4/5] border border-dashed border-neutral-700 rounded flex flex-col items-center justify-center text-xs text-neutral-400 hover:border-white hover:text-white transition-colors cursor-pointer text-center p-2">
                <span className="text-2xl leading-none mb-1">+</span>
                Agregar fotos
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { uploadPhotos(e.target.files); e.target.value = ""; }} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea rows={4} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Detalles (uno por línea)</label>
          <textarea rows={4} value={form.detailsText} onChange={(e) => setForm({ ...form, detailsText: e.target.value })} className={inputClass} placeholder={"100% Algodón\nCorte oversized"} />
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button type="submit" disabled={saving || uploading > 0} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed">
          {saving ? "Guardando..." : uploading > 0 ? "Esperá que terminen de subir las fotos..." : "Guardar producto"}
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
          <li><b>Cambiar un precio o un dato:</b> tocá Editar, cambialo y Guardar producto. En la tienda se ve enseguida.</li>
          <li><b>Producto nuevo:</b> tocá “+ Nuevo producto”, completá los datos y subí las fotos desde tu celular.</li>
          <li><b>Talle agotado:</b> en Editar, sacale el tilde a ese talle.</li>
          <li><b>Que no se vea (sin borrarlo):</b> tocá Ocultar. Con Mostrar vuelve.</li>
          <li><b>Eliminar</b> lo borra para siempre, con sus fotos.</li>
        </ul>
      </details>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-neutral-400">{products.length} productos</p>
        <button
          onClick={() => {
            setMessage("");
            setFormError("");
            setForm(emptyForm);
          }}
          className="bg-white text-black text-sm md:text-xs font-bold px-4 py-3 md:py-2.5 rounded hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          + Nuevo producto
        </button>
      </div>

      {message && <p className="text-sm text-neutral-300 mb-4">{message}</p>}

      <div className="space-y-3">
        {loading && <p className="text-neutral-500 text-sm text-center py-12">Cargando...</p>}
        {!loading && products.length === 0 && <p className="text-neutral-500 text-sm text-center py-12">Todavía no hay productos.</p>}
        {products.map((product) => (
          <div key={product.id} className={`flex items-center gap-3 md:gap-4 bg-neutral-950 border border-neutral-900 rounded-md p-3 ${product.active ? "" : "opacity-60"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0]} alt="" className="w-14 h-[4.5rem] object-cover rounded bg-neutral-900 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{product.name}</p>
              <p className="text-xs text-neutral-400">
                {formatPrice(product.price)} · {product.category} · Talles: {product.sizes.map((size) => (product.stock && size in product.stock ? `${size} (${product.stock[size] > 0 ? product.stock[size] : "agotado"})` : size)).join(", ")}
              </p>
              {!product.active && <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 border border-amber-700/50 bg-amber-900/30 px-1.5 py-0.5 rounded">OCULTO</span>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-xs flex-shrink-0">
              <button
                onClick={() => {
                  setMessage("");
                  setFormError("");
                  setForm(formFromProduct(product));
                }}
                className="border border-neutral-700 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer"
              >
                Editar
              </button>
              <button onClick={() => toggleActive(product)} className="border border-neutral-800 px-4 py-2.5 rounded hover:border-white transition-colors cursor-pointer">
                {product.active ? "Ocultar" : "Mostrar"}
              </button>
              <button onClick={() => handleDelete(product)} className="border border-red-900 text-red-400 px-4 py-2.5 rounded hover:bg-red-950 transition-colors cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

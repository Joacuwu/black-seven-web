"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";
import { categoryLabel } from "@/lib/catalog-types";

// ─────────────────────────────────────────────────────────────────────────────
// CÓMO AGREGAR COSAS AL MENÚ
//  • Un enlace nuevo: sumá una línea en `navItems` (más abajo) con { label, href }.
//  • Un desplegable: agregale `children: [{ label, href }, ...]`.
//  • Un ícono nuevo a la derecha (buscador, cuenta, favoritos...): ponelo en el bloque
//    "ACCIONES" del final del <nav>, al lado del carrito.
// El mismo menú se usa en computadora y en el panel del celular.
// ─────────────────────────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavLink[];
}

const INSTAGRAM_URL = "https://www.instagram.com/black.sevenn7/";
const WHATSAPP_URL = "https://wa.me/5491127035976";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { products } = useProducts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Las categorías y las etiquetas salen solas de los productos cargados en el panel.
  const navItems = useMemo<NavItem[]>(() => {
    const categories = [...new Set(products.map((p) => p.category))];
    const tags = [...new Set(products.map((p) => p.tag).filter((t): t is string => Boolean(t)))];

    return [
      {
        label: "Colección",
        href: "/coleccion",
        children: categories.length
          ? [
              { label: "Ver todo", href: "/coleccion" },
              ...categories.map((c) => ({ label: categoryLabel(c), href: `/coleccion?categoria=${encodeURIComponent(c)}` })),
            ]
          : undefined,
      },
      {
        label: "Drops",
        href: "/coleccion",
        children: tags.length ? tags.map((t) => ({ label: t, href: `/coleccion?etiqueta=${encodeURIComponent(t)}` })) : undefined,
      },
      { label: "Mi pedido", href: "/seguimiento" },
    ];
  }, [products]);

  // Con el menú del celular abierto: no se scrollea el fondo y Escape lo cierra.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      aria-label="Principal"
      className="bg-black text-white border-b border-neutral-900 px-4 md:px-8 h-16 grid grid-cols-[1fr_auto_1fr] md:flex items-center"
    >
      {/* MENÚ (celular) */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          className="-ml-2 p-2 hover:text-neutral-400 transition-colors cursor-pointer"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* LOGO */}
      <Link href="/" aria-label="BLACK SEVEN, ir al inicio" className="justify-self-center shrink-0 md:mr-12">
        <Image
          src="/logo.png"
          alt="BLACK SEVEN"
          width={280}
          height={70}
          priority
          className="h-11 md:h-12 w-auto object-contain"
        />
      </Link>

      {/* ENLACES (computadora) */}
      <ul className="hidden md:flex items-center gap-9 flex-1">
        {navItems.map((item) => (
          <li key={item.label} className="relative group">
            <Link
              href={item.href ?? "#"}
              className="inline-flex items-center gap-1 py-6 text-[13px] tracking-[0.18em] uppercase text-neutral-300 hover:text-white transition-colors"
            >
              {item.label}
              {item.children && <ChevronDown size={13} className="opacity-60 transition-transform group-hover:rotate-180" />}
            </Link>

            {item.children && (
              <ul className="absolute left-0 top-full min-w-48 py-2 bg-black border border-neutral-800 shadow-2xl invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="block px-5 py-2.5 text-xs tracking-[0.15em] uppercase text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* ACCIONES (a la derecha; acá se pueden sumar más íconos a futuro) */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label={`Carrito de compras, ${totalItems} ${totalItems === 1 ? "producto" : "productos"}`}
          className="relative -mr-2 p-2 hover:text-neutral-400 transition-colors cursor-pointer"
        >
          <ShoppingBag size={24} strokeWidth={1.5} />
          {totalItems > 0 && (
            <span className="absolute top-0.5 right-0 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* PANEL DEL MENÚ (celular) */}
      <div
        id="menu-movil"
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeMenu} />

        <div
          className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-black border-r border-neutral-900 flex flex-col transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-900">
            <span className="font-bebas text-2xl tracking-widest">MENÚ</span>
            <button onClick={closeMenu} aria-label="Cerrar menú" className="-mr-2 p-2 hover:text-neutral-400 transition-colors cursor-pointer">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto py-2">
            {navItems.map((item) => {
              const expanded = openSection === item.label;
              return (
                <li key={item.label} className="border-b border-neutral-900">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setOpenSection(expanded ? null : item.label)}
                        aria-expanded={expanded}
                        className="w-full px-6 py-4 flex items-center justify-between font-bebas text-3xl tracking-wider uppercase cursor-pointer"
                      >
                        {item.label}
                        <ChevronDown size={20} className={`text-neutral-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                      {expanded && (
                        <ul className="pb-3">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={closeMenu}
                                className="block px-8 py-3 text-sm tracking-[0.15em] uppercase text-neutral-400 active:text-white"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href ?? "#"} onClick={closeMenu} className="block px-6 py-4 font-bebas text-3xl tracking-wider uppercase">
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="px-6 py-5 border-t border-neutral-900 flex gap-6 text-xs tracking-[0.15em] uppercase text-neutral-400">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white py-2">
              Instagram
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white py-2">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

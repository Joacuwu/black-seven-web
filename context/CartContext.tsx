"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/lib/catalog-types";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  size: string;
  img: string;
  quantity?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, delta: 1 | -1) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useProducts();
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // El carrito arranca vacío (igual que en el servidor) y se carga desde localStorage al montar:
  // así no hay diferencias entre el HTML del servidor y el del celular.
  const [storedCart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart_blackseven");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedCart) setCart(JSON.parse(savedCart) as CartItem[]);
    } catch (e) {
      console.error("Error al leer localStorage:", e);
    }
    setHydrated(true);
  }, []);

  // Guardar cambios en localStorage (recién después de haber cargado lo guardado)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("cart_blackseven", JSON.stringify(storedCart));
    } catch {
      // Sin almacenamiento disponible (modo privado): el carrito funciona igual mientras la página esté abierta.
    }
  }, [storedCart, hydrated]);

  // Los precios siempre salen del catálogo: así un carrito guardado con precios viejos se corrige solo.
  const cart = useMemo(
    () =>
      storedCart.map((item) => {
        const product = getProduct(item.id);
        return product ? { ...item, price: formatPrice(product.price) } : item;
      }),
    [storedCart, getProduct]
  );

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === newItem.id && item.size === newItem.size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity || 1;
        updated[existingIndex].quantity = currentQty + (newItem.quantity || 1);
        return updated;
      }

      return [...prevCart, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  };

  const removeFromCart = (id: number, size: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const updateQuantity = (id: number, size: string, delta: 1 | -1) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: Math.min(10, Math.max(1, (item.quantity || 1) + delta)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Totales
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const totalPrice = cart.reduce((acc, item) => {
    // Mientras carga el catálogo se usa el precio guardado en el carrito ("$35.000" -> 35000).
    const unitPrice = getProduct(item.id)?.price ?? (Number(item.price.replace(/\D/g, "")) || 0);
    return acc + unitPrice * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
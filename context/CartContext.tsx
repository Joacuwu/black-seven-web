"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Inicializamos leyendo de localStorage directamente
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedCart = localStorage.getItem("cart_blackseven");
      return savedCart ? (JSON.parse(savedCart) as CartItem[]) : [];
    } catch (e) {
      console.error("Error al leer localStorage:", e);
      return [];
    }
  });

  // Guardamos en localStorage únicamente cuando el carrito cambia
  useEffect(() => {
    localStorage.setItem("cart_blackseven", JSON.stringify(cart));
  }, [cart]);

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

  const clearCart = () => {
    setCart([]);
  };

  // Cálculos de totales
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const totalPrice = cart.reduce((acc, item) => {
    const numericPrice = Number(item.price.replace(/[^0-9.-]+/g, "")) || 0;
    return acc + numericPrice * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        totalItems,
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
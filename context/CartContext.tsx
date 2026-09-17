"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/data/products";
import { useCustomerAuth } from "./CustomerAuthContext";

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, selectedSize?: string, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useCustomerAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCartKey = (u: any) => (u?.id ? `halo_cart_${u.id}` : "halo_cart_guest");

  // Load cart when user auth status resolves
  useEffect(() => {
    if (isAuthLoading) return;

    try {
      // Purge any legacy un-scoped cart key from prior versions
      localStorage.removeItem("halo_cart");

      const key = getCartKey(user);
      const saved = localStorage.getItem(key);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    }
    setIsLoaded(true);
  }, [user, isAuthLoading]);

  // Listen for logout event to clear cart immediately
  useEffect(() => {
    const handleLogout = () => {
      setItems([]);
      try {
        localStorage.removeItem("halo_cart");
        localStorage.removeItem("halo_cart_guest");
        if (user?.id) {
          localStorage.removeItem(`halo_cart_${user.id}`);
        }
      } catch (e) {}
    };
    window.addEventListener("halo:logout", handleLogout);
    return () => window.removeEventListener("halo:logout", handleLogout);
  }, [user]);

  // Save cart to user-scoped localStorage key on changes
  useEffect(() => {
    if (isLoaded && !isAuthLoading) {
      try {
        const key = getCartKey(user);
        if (items.length > 0) {
          localStorage.setItem(key, JSON.stringify(items));
        } else {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error("Failed to save cart to storage", e);
      }
    }
  }, [items, isLoaded, user, isAuthLoading]);

  const addItem = (
    product: Product,
    selectedSize: string = product.size,
    quantity: number = 1
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, selectedSize, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, size: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("halo_cart");
      localStorage.removeItem("halo_cart_guest");
      if (user?.id) {
        localStorage.removeItem(`halo_cart_${user.id}`);
      }
    } catch (e) {
      console.error("Failed to clear cart storage", e);
    }
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
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
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

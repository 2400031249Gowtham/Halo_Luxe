"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal } = useCustomerAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Listen for logout event
  useEffect(() => {
    const handleLogout = () => {
      setWishlistIds([]);
      try {
        localStorage.removeItem("halo_wishlist");
      } catch (e) {}
    };
    window.addEventListener("halo:logout", handleLogout);
    return () => window.removeEventListener("halo:logout", handleLogout);
  }, []);

  // Initialize wishlist from user data or local storage
  useEffect(() => {
    if (user && user.wishlist) {
      setWishlistIds(user.wishlist);
      setIsLoaded(true);
    } else {
      try {
        const saved = localStorage.getItem("halo_wishlist");
        if (saved) {
          setWishlistIds(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load wishlist from storage", e);
      }
      setIsLoaded(true);
    }
  }, [user]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    if (isLoaded && !user) {
      try {
        localStorage.setItem("halo_wishlist", JSON.stringify(wishlistIds));
      } catch (e) {
        console.error("Failed to save wishlist to storage", e);
      }
    }
  }, [wishlistIds, isLoaded, user]);

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId.toString());
  };

  const toggleWishlist = async (productId: string) => {
    const prodIdStr = productId.toString();
    const isCurrentlyWishlisted = isInWishlist(prodIdStr);

    // Optimistic UI update
    setWishlistIds((prev) =>
      isCurrentlyWishlisted
        ? prev.filter((id) => id !== prodIdStr)
        : [...prev, prodIdStr]
    );

    if (user) {
      try {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: prodIdStr }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.wishlistIds) {
            setWishlistIds(data.wishlistIds);
          }
        }
      } catch (err) {
        console.error("Failed to sync wishlist with database", err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

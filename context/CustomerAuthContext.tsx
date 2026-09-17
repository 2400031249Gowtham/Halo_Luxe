"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  pinCode: string;
  state: string;
  city: string;
  area?: string;
  type: "Home" | "Work";
  isDefault?: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  addresses?: SavedAddress[];
  wishlist?: string[];
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register" | "forgot_password";
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openAuthModal: (tab?: "login" | "register" | "forgot_password") => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<CustomerUser | null>>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined
);

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUserState] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<
    "login" | "register" | "forgot_password"
  >("login");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync with localStorage
  const setUser: React.Dispatch<React.SetStateAction<CustomerUser | null>> = (
    value
  ) => {
    setUserState((prev) => {
      const resolved = typeof value === "function" ? (value as any)(prev) : value;
      try {
        if (resolved) {
          localStorage.setItem("halo_customer_user", JSON.stringify(resolved));
        } else {
          localStorage.removeItem("halo_customer_user");
        }
      } catch (e) {
        // localStorage may be unavailable in some private windows
      }
      return resolved;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          try {
            localStorage.removeItem("halo_customer_user");
          } catch (e) {}
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem("halo_customer_user");
        } catch (e) {}
      }
    } catch (err) {
      console.error("Failed to load user", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const openAuthModal = (tab: "login" | "register" | "forgot_password" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      setIsDrawerOpen(false);
      try {
        localStorage.removeItem("halo_customer_user");
        localStorage.removeItem("halo_cart");
        localStorage.removeItem("halo_wishlist");
      } catch (e) {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("halo:logout"));
      }
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        isDrawerOpen,
        setIsDrawerOpen,
        openAuthModal,
        closeAuthModal,
        refreshUser,
        logout,
        setUser,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }
  return context;
}

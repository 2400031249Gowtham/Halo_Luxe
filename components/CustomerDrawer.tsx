"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  X,
  LayoutDashboard,
  User as UserIcon,
  Heart,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

export function CustomerDrawer() {
  const { user, isDrawerOpen, setIsDrawerOpen, logout } = useCustomerAuth();
  const { totalItems, clearCart } = useCart();
  const { wishlistCount } = useWishlist();
  const pathname = usePathname();

  const handleSignOut = async () => {
    clearCart();
    await logout();
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen || !user) return null;

  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  const navItems = [
    {
      label: "Dashboard",
      href: "/account",
      icon: LayoutDashboard,
    },
    {
      label: "Profile",
      href: "/account/profile",
      icon: UserIcon,
    },
    {
      label: "Wishlist",
      href: "/account/wishlist",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : undefined,
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : undefined,
    },
    {
      label: "Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "Settings",
      href: "/account/profile",
      icon: Settings,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#02281E]/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over panel matching reference Image 1 in HALO luxury theme */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#063C2D] text-[#F4EEE4] shadow-2xl flex flex-col h-full border-l border-[#C8A15A]/30 z-10">
        {/* Top Close Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 text-[#F4EEE4]/70 hover:text-[#D9BD82] hover:bg-white/5 rounded transition-colors"
            aria-label="Close account menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Hero Section (Matching Image 1) */}
        <div className="flex flex-col items-center text-center px-6 pb-8 border-b border-[#C8A15A]/20">
          {/* Avatar Circle with initial */}
          <div className="w-20 h-20 rounded-full bg-[#C8A15A] text-[#02281E] font-serif text-3xl font-bold flex items-center justify-center shadow-lg border-2 border-[#D9BD82] mb-4">
            {initial}
          </div>

          <h3 className="font-serif text-2xl font-normal text-[#F4EEE4] leading-tight">
            Welcome back
          </h3>
          <p className="text-sm font-sans text-[#D9BD82] font-semibold mt-0.5 truncate max-w-[240px]">
            {user.name || "User"}
          </p>
          <p className="text-xs font-sans text-[#F4EEE4]/75 mt-1 truncate max-w-[240px]">
            {user.email}
          </p>
          {user.phone ? (
            <p className="text-[11px] font-mono text-[#D9BD82]/85 mt-0.5">
              +91 {user.phone}
            </p>
          ) : null}

          {/* Online status indicator */}
          <div className="flex items-center gap-1.5 mt-3 bg-[#02281E]/80 px-3 py-1 rounded-full border border-[#C8A15A]/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-sans text-emerald-300 font-medium">
              Active Member
            </span>
          </div>
        </div>

        {/* Navigation List (Matching Image 1) */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsDrawerOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm font-sans tracking-wide rounded transition-colors ${
                  isActive
                    ? "bg-[#C8A15A] text-[#02281E] font-semibold"
                    : "text-[#F4EEE4]/85 hover:bg-white/10 hover:text-[#D9BD82]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-[#02281E]" : "text-[#C8A15A]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#02281E] text-[#D9BD82]"
                          : "bg-[#C8A15A] text-[#02281E]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 opacity-50 ${
                      isActive ? "text-[#02281E]" : "text-[#F4EEE4]/50"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer: Sign Out Button */}
        <div className="p-4 border-t border-[#C8A15A]/20 bg-[#02281E]/60">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-sans uppercase tracking-[0.16em] font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 rounded transition-colors border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

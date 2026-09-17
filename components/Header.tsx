"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { ShoppingBag, Menu, User as UserIcon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, openAuthModal, setIsDrawerOpen } = useCustomerAuth();
  const { wishlistCount } = useWishlist();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHomepage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Header background state
  const isSolid = isScrolled || !isHomepage;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          isSolid
            ? "bg-[#02281E]/95 backdrop-blur-md border-b border-[#C8A15A]/20 py-4 shadow-sm"
            : "bg-gradient-to-b from-[#02281E]/80 via-[#02281E]/40 to-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Logo theme="dark" />
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {siteConfig.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "font-sans text-xs uppercase tracking-[0.18em] transition-colors duration-300 relative py-1 focus-visible:outline-none focus-visible:text-[#C8A15A]",
                    isActive
                      ? "text-[#D9BD82] font-medium"
                      : "text-[#F4EEE4]/85 hover:text-[#C8A15A]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C8A15A]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Wishlist, Account, Cart, Mobile Menu */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/contact"
              className="hidden lg:inline-flex items-center font-sans text-xs uppercase tracking-[0.18em] text-[#F4EEE4]/85 hover:text-[#C8A15A] transition-colors py-1"
            >
              CONTACT
            </Link>

            {/* Wishlist Link */}
            <Link
              href={user ? "/account/wishlist" : "#"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal("login");
                }
              }}
              className="relative p-2 text-[#F4EEE4] hover:text-[#C8A15A] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A15A] rounded"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8A15A] text-[#02281E] text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-200">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#F4EEE4] hover:text-[#C8A15A] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A15A] rounded"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8A15A] text-[#02281E] text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-200">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Customer Account Trigger */}
            {user ? (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-full hover:bg-white/5 transition-colors focus-visible:outline-none group"
                aria-label="Open customer account menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#C8A15A] text-[#02281E] font-serif font-bold text-sm flex items-center justify-center border border-[#D9BD82] group-hover:scale-105 transition-transform shadow-xs shrink-0">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-sans text-xs text-[#F4EEE4] font-medium tracking-wide max-w-[120px] truncate group-hover:text-[#D9BD82] transition-colors">
                  {user.name ? user.name.split(" ")[0] : "Account"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C8A15A]/40 bg-[#02281E]/80 text-[#D9BD82] hover:bg-[#C8A15A] hover:text-[#02281E] transition-colors font-sans text-xs uppercase tracking-[0.14em] font-medium"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#F4EEE4] hover:text-[#C8A15A] transition-colors md:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A15A] rounded"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

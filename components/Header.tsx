"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { useCart } from "@/context/CartContext";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
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

          {/* Right: Contact & Cart */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center font-sans text-xs uppercase tracking-[0.18em] text-[#F4EEE4]/85 hover:text-[#C8A15A] transition-colors py-1"
            >
              CONTACT
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

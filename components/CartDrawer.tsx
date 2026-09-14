"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "./Button";

export function CartDrawer() {
  const pathname = usePathname();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    totalItems,
  } = useCart();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Your Dental Supply Cart"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#02281E]/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#F4EEE4] text-[#1C211E] shadow-2xl flex flex-col h-full border-l border-[#C8A15A]/30 z-10">
        {/* Header */}
        <div className="p-6 border-b border-[#C8A15A]/20 flex items-center justify-between bg-[#EDE4D5]/60">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#063C2D]" />
            <h2 className="font-serif text-2xl font-normal text-[#02281E]">
              Clinic Order ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-[#02281E]/70 hover:text-[#02281E] hover:bg-[#063C2D]/5 rounded transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#EDE4D5] flex items-center justify-center mb-4 text-[#C8A15A]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="font-serif text-2xl text-[#02281E] mb-2">
                Your cart is empty
              </p>
              <p className="text-xs font-sans text-[#1C211E]/70 max-w-xs mb-8">
                Explore our genuine Swarovski® Flat Back crystals curated specifically for qualified dental professionals.
              </p>
              <Button
                variant="dark"
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                arrow
              >
                Browse Crystals
              </Button>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-[#C8A15A]/15">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="pt-4 first:pt-0 flex gap-4"
                >
                  <div className="relative w-20 h-20 rounded bg-[#EDE4D5] overflow-hidden shrink-0 border border-[#C8A15A]/20">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base font-normal text-[#02281E] truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-[11px] font-sans text-[#063C2D] font-medium tracking-wide">
                      {item.selectedSize} · Pack of 10
                    </p>
                    <p className="text-xs font-sans text-[#1C211E]/70 mt-0.5">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#063C2D]/20 rounded bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.quantity - 1
                            )
                          }
                          className="p-1 hover:bg-[#EDE4D5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 text-[#063C2D]" />
                        </button>
                        <span className="px-3 text-xs font-sans font-medium text-[#02281E]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.quantity + 1
                            )
                          }
                          className="p-1 hover:bg-[#EDE4D5] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#063C2D]" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.product.id, item.selectedSize)
                        }
                        className="text-[11px] font-sans text-red-800/80 hover:text-red-900 underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#C8A15A]/20 bg-[#EDE4D5]/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-[0.16em] text-[#1C211E]/80">
                Clinic Subtotal
              </span>
              <span className="font-serif text-2xl font-normal text-[#02281E]">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="text-[11px] font-sans text-[#063C2D] bg-[#063C2D]/5 p-3 rounded border border-[#063C2D]/10">
              ✓ Shipping across India. Sourced through an authorised Swarovski® distribution partner for professional dental application.
            </p>

            <Link
              href={`/contact?type=Product+enquiry&order=${encodeURIComponent(
                items
                  .map((i) => `${i.product.name} (${i.selectedSize}) x${i.quantity}`)
                  .join(", ")
              )}`}
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3.5 px-6 bg-[#063C2D] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#0B5942] transition-colors text-center flex items-center justify-center gap-2"
            >
              <span>Submit Clinic Order Inquiry</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-[11px] font-sans uppercase tracking-[0.16em] text-[#02281E]/70 hover:text-[#02281E] pt-1"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

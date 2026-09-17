"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { SparkleStar } from "@/components/SparkleStar";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Check,
  ShieldCheck,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } =
    useCart();

  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError("");
    const code = discountCode.trim().toUpperCase();

    if (code === "HALO10") {
      setDiscountPercent(10);
      setDiscountApplied(true);
    } else if (code === "HALO20" || code === "LUXE20") {
      setDiscountPercent(20);
      setDiscountApplied(true);
    } else if (!code) {
      setDiscountError("Please enter a coupon code.");
    } else {
      setDiscountError("Invalid or expired coupon code. Try 'HALO10' for 10% off.");
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-screen bg-[#F4EEE4] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Heading */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <SparkleStar size={12} color="#C8A15A" />
            <span className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#063C2D]">
              Clinical Procurement
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E]">
            Shopping Bag
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/30 p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#02281E]/10 flex items-center justify-center mx-auto mb-4 text-[#02281E]">
              <ShoppingBag className="w-8 h-8 text-[#C8A15A]" />
            </div>
            <h2 className="font-serif text-2xl text-[#02281E] mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-xs font-sans text-[#1C211E]/70 mb-6">
              Explore our genuine Swarovski® Flat Back dental crystals curated for qualified dental professionals.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-[0.18em] font-semibold"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 text-[#D9BD82]" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Cart Items (Matching Image 2) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#C8A15A]/25">
                <div className="flex items-center gap-2 text-sm font-sans uppercase tracking-wider text-[#02281E] font-semibold">
                  <ShoppingBag className="w-4 h-4 text-[#C8A15A]" />
                  <span>Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                </div>
                <button
                  onClick={clearCart}
                  className="text-xs font-sans text-rose-700 hover:text-rose-900 transition-colors uppercase tracking-wider"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="p-4 sm:p-5 bg-white/70 border border-[#C8A15A]/25 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-[#C8A15A]/50"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 bg-[#EDE4D5] border border-[#C8A15A]/20 shrink-0 overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg text-[#02281E] truncate">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="hover:text-[#C8A15A] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      <div className="text-[11px] font-sans text-[#1C211E]/70 space-y-0.5 mt-0.5">
                        <p>
                          <span className="font-medium text-[#063C2D]">SKU:</span>{" "}
                          {item.product.article || item.product.id}
                        </p>
                        <p>
                          <span className="font-medium text-[#063C2D]">Size:</span>{" "}
                          {item.selectedSize} ·{" "}
                          <span className="font-medium text-[#063C2D]">Colour:</span>{" "}
                          {item.product.colour}
                        </p>
                        <span className="inline-block text-[10px] font-semibold text-emerald-700 font-sans tracking-wide">
                          ● In stock
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Trash */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#C8A15A]/40 bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 text-[#063C2D] hover:bg-[#EDE4D5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-sans font-semibold text-[#02281E]">
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
                          className="p-1.5 text-[#063C2D] hover:bg-[#EDE4D5] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.product.id, item.selectedSize)
                        }
                        className="p-1.5 text-rose-600 hover:text-rose-800 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right sm:w-28 shrink-0">
                      <p className="font-serif text-lg text-[#02281E] font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <p className="text-[10px] font-sans text-[#1C211E]/60">
                        {formatPrice(item.product.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Box (Matching Image 2) */}
              <div className="p-5 bg-white/70 border border-[#C8A15A]/25 space-y-3">
                <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-[#02281E] font-semibold">
                  <Tag className="w-4 h-4 text-[#C8A15A]" />
                  <span>Apply Discount Code</span>
                </div>

                <form
                  onSubmit={handleApplyDiscount}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter discount code (e.g. HALO10)"
                    className="flex-1 px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] uppercase tracking-wider focus:outline-none focus:border-[#C8A15A]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#C8A15A] text-[#02281E] hover:bg-[#D9BD82] transition-colors text-xs font-sans uppercase tracking-wider font-semibold"
                  >
                    Apply
                  </button>
                </form>

                {discountApplied && (
                  <p className="text-xs font-sans text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Coupon applied: {discountPercent}% off subtotal!</span>
                  </p>
                )}
                {discountError && (
                  <p className="text-xs font-sans text-rose-700">
                    {discountError}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary (Matching Image 2) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="p-6 bg-white/80 border border-[#C8A15A]/30 shadow-sm space-y-5">
                <h2 className="font-serif text-2xl text-[#02281E] border-b border-[#C8A15A]/20 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs font-sans">
                  <div className="flex items-center justify-between text-[#1C211E]/80">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-[#02281E]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[#C8A15A] font-semibold">
                      <span>Product Discounts ({discountPercent}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[#1C211E]/80">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-700">Free</span>
                  </div>

                  <div className="flex items-center justify-between text-[#1C211E]/60 text-[11px]">
                    <span>Tax Included</span>
                    <span>(GST 18%)</span>
                  </div>

                  <div className="pt-3 border-t border-[#C8A15A]/20 flex items-baseline justify-between">
                    <span className="font-serif text-lg text-[#02281E] font-medium">
                      Total
                    </span>
                    <span className="font-serif text-2xl text-[#02281E] font-bold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#D9BD82] transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="text-center">
                  <Link
                    href="/shop"
                    className="text-xs font-sans text-[#063C2D] hover:text-[#C8A15A] uppercase tracking-wider font-semibold transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <p className="text-[10px] font-sans text-center text-[#1C211E]/60 pt-2 border-t border-[#C8A15A]/15">
                  All prices include applicable taxes. Secured by Razorpay.
                </p>
              </div>

              {/* Quality Guarantee Mini Card */}
              <div className="p-4 bg-[#EDE4D5]/40 border border-[#C8A15A]/20 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#C8A15A] shrink-0" />
                <div className="text-[11px] font-sans text-[#1C211E]/80">
                  <p className="font-semibold text-[#02281E]">Guaranteed Authentic</p>
                  <p>100% Swarovski® Lead-Free crystals with clinical tracking.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

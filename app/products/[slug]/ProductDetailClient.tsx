"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { SparkleStar } from "@/components/SparkleStar";
import { Plus, Minus, Check, ShieldCheck, Award, Truck } from "lucide-react";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(product.size);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAddToCart = () => {
    addItem(product, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      {/* Left: Product Imagery Showcase */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-square w-full overflow-hidden bg-[#EDE4D5] border border-[#C8A15A]/30 shadow-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute top-4 left-4 bg-[#02281E]/90 px-3 py-1.5 text-xs font-sans uppercase tracking-[0.2em] text-[#D9BD82] border border-[#C8A15A]/30">
            Pack of 10
          </div>
        </div>

        {/* Clinical Quality Assurance Badges */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-[#EDE4D5]/40 border border-[#C8A15A]/20 text-center">
            <Award className="w-4 h-4 text-[#C8A15A] mx-auto mb-1" />
            <span className="text-[10px] font-sans uppercase tracking-wider text-[#063C2D] block font-medium">
              Swarovski®
            </span>
            <span className="text-[9px] font-sans text-[#1C211E]/70 block">
              Authorised Sourcing
            </span>
          </div>
          <div className="p-3 bg-[#EDE4D5]/40 border border-[#C8A15A]/20 text-center">
            <ShieldCheck className="w-4 h-4 text-[#C8A15A] mx-auto mb-1" />
            <span className="text-[10px] font-sans uppercase tracking-wider text-[#063C2D] block font-medium">
              Lead-Free
            </span>
            <span className="text-[9px] font-sans text-[#1C211E]/70 block">
              Safe Dental Glass
            </span>
          </div>
          <div className="p-3 bg-[#EDE4D5]/40 border border-[#C8A15A]/20 text-center">
            <Truck className="w-4 h-4 text-[#C8A15A] mx-auto mb-1" />
            <span className="text-[10px] font-sans uppercase tracking-wider text-[#063C2D] block font-medium">
              Insured Express
            </span>
            <span className="text-[9px] font-sans text-[#1C211E]/70 block">
              All India Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Right: Product Specification & Order Architecture */}
      <div className="lg:col-span-6 flex flex-col justify-between">
        <div>
          {/* Eyebrow / Category */}
          <div className="flex items-center gap-2 mb-3">
            <SparkleStar size={12} color="#C8A15A" />
            <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#063C2D] font-medium">
              Swarovski® Flat Back No Hotfix
            </span>
          </div>

          {/* Product Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#02281E] leading-[1.15]">
            {product.name}
          </h1>

          {/* Type & Pack Subtitles */}
          <div className="mt-3 flex items-center gap-4 text-xs font-sans uppercase tracking-[0.18em] text-[#063C2D]">
            <span>Flat Back No Hotfix</span>
            <span>·</span>
            <span className="text-[#C8A15A] font-semibold">Pack of 10</span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-4xl text-[#02281E] font-normal">
              {formatPrice(product.price * quantity)}
            </span>
            <span className="text-xs font-sans text-[#1C211E]/60 uppercase tracking-wider">
              (₹{product.price} / pack) · Tax Included
            </span>
          </div>

          <div className="w-full h-[1px] bg-[#C8A15A]/20 my-6" />

          {/* Size Selection (if available) */}
          {product.availableSizes && product.availableSizes.length > 1 && (
            <div className="mb-6">
              <label className="block text-xs font-sans uppercase tracking-[0.18em] text-[#02281E] font-medium mb-3">
                Select Crystal Dimension:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 text-xs font-sans uppercase tracking-wider border transition-all ${
                      selectedSize === sz
                        ? "bg-[#063C2D] text-[#F4EEE4] border-[#063C2D]"
                        : "bg-[#EDE4D5]/40 text-[#1C211E]/80 border-[#C8A15A]/30 hover:border-[#C8A15A]"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add To Cart Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border border-[#063C2D]/30 bg-white px-4 py-3 min-w-[130px]">
              <span className="text-xs font-sans uppercase tracking-wider text-[#1C211E]/60">
                Qty:
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-[#063C2D] hover:bg-[#EDE4D5] rounded"
                  aria-label="Decrease pack quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-sans text-sm font-semibold text-[#02281E]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-[#063C2D] hover:bg-[#EDE4D5] rounded"
                  aria-label="Increase pack quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 px-8 bg-[#063C2D] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#0B5942] transition-colors flex items-center justify-center gap-2 group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A15A]"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 text-[#D9BD82]" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <span>ADD TO CART</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Mandated Sections from Phase 15 */}
          <div className="space-y-6 pt-4 border-t border-[#C8A15A]/20">
            {/* PRODUCT DETAILS TABLE */}
            <div>
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-[#C8A15A] font-semibold mb-3">
                Product Details
              </h2>
              <dl className="grid grid-cols-2 gap-y-2.5 text-xs font-sans border border-[#C8A15A]/25 bg-[#EDE4D5]/30 p-4">
                <dt className="text-[#1C211E]/60 uppercase tracking-wider">Brand:</dt>
                <dd className="font-medium text-[#02281E]">Swarovski®</dd>

                <dt className="text-[#1C211E]/60 uppercase tracking-wider">Article:</dt>
                <dd className="font-medium text-[#02281E]">{product.article}</dd>

                <dt className="text-[#1C211E]/60 uppercase tracking-wider">Type:</dt>
                <dd className="font-medium text-[#02281E]">Flat Back No Hotfix</dd>

                <dt className="text-[#1C211E]/60 uppercase tracking-wider">Backing:</dt>
                <dd className="font-medium text-[#02281E]">{product.backing}</dd>

                <dt className="text-[#1C211E]/60 uppercase tracking-wider">Quantity:</dt>
                <dd className="font-medium text-[#02281E]">{product.packQuantity}</dd>

                <dt className="text-[#1C211E]/60 uppercase tracking-wider">Application:</dt>
                <dd className="font-medium text-[#02281E]">{product.application}</dd>
              </dl>
            </div>

            {/* ABOUT THE CRYSTAL */}
            <div>
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-[#C8A15A] font-semibold mb-2">
                About the Crystal
              </h2>
              <p className="text-xs sm:text-sm font-sans font-light text-[#1C211E]/80 leading-relaxed">
                Swarovski® Flat Backs No Hotfix are loose crystal components with platinum foiling for added brilliance and protection. They are available in a variety of sizes, colours, shapes and cuts.
              </p>
            </div>

            {/* PROFESSIONAL APPLICATION */}
            <div className="bg-[#063C2D]/5 p-4 border border-[#063C2D]/15">
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-[#063C2D] font-semibold mb-2">
                Professional Application
              </h2>
              <p className="text-xs font-sans font-light text-[#1C211E]/80 leading-relaxed">
                HALO tooth crystals are intended for application by qualified dental professionals using suitable dental materials and appropriate clinical protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

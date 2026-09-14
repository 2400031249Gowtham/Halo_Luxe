"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { SparkleStar } from "./SparkleStar";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col bg-[#EDE4D5]/40 border border-[#C8A15A]/25 transition-all duration-300 hover:border-[#C8A15A]/60 hover:shadow-md">
      {/* Product Image Frame */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-[#EDE4D5] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A15A]"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Swarovski Flat Back Badge */}
        <div className="absolute top-3 left-3 bg-[#02281E]/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-sans uppercase tracking-[0.16em] text-[#D9BD82] border border-[#C8A15A]/20">
          Pack of 10
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-1 justify-between bg-[#F4EEE4]">
        <div>
          {/* Article & Category note */}
          <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.18em] text-[#063C2D]/80 mb-1.5">
            <span>{product.article}</span>
            <span className="text-[#C8A15A]">Flat Back No Hotfix</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-xl sm:text-2xl text-[#02281E] font-normal leading-snug group-hover:text-[#063C2D] transition-colors line-clamp-2">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Size / Colour */}
          <p className="mt-2 text-xs font-sans text-[#1C211E]/75 tracking-wide">
            {product.size} · {product.colour}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="mt-6 pt-4 border-t border-[#C8A15A]/20 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl text-[#02281E] font-normal">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-[#063C2D]/70">
              Tax Included
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center text-xs font-sans uppercase tracking-[0.16em] font-semibold text-[#063C2D] hover:text-[#C8A15A] transition-colors group/link"
            >
              <span>VIEW CRYSTAL</span>
              <span className="ml-1 transition-transform duration-300 group-hover/link:translate-x-1">
                →
              </span>
            </Link>

            <button
              onClick={() => addItem(product)}
              className="px-3 py-1.5 text-[11px] font-sans uppercase tracking-[0.14em] bg-[#063C2D] text-[#F4EEE4] hover:bg-[#C8A15A] hover:text-[#02281E] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A15A]"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

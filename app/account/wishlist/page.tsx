"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { SparkleStar } from "@/components/SparkleStar";
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Product } from "@/data/products";

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/public/products");
        if (res.ok) {
          const data = await res.json();
          const allProds: Product[] = data.products || [];
          const wishlisted = allProds.filter((p) => {
            const pid = (p.id || (p as any)._id)?.toString();
            return pid ? wishlistIds.includes(pid) : false;
          });
          setProducts(wishlisted);
        }
      } catch (err) {
        console.error("Failed to load wishlist products", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [wishlistIds]);

  return (
    <div className="min-h-screen bg-[#F4EEE4] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SparkleStar size={12} color="#C8A15A" />
            <span className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#063C2D]">
              Saved Selections
            </span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E]">
              My Wishlist ({products.length})
            </h1>
            <Link
              href="/shop"
              className="text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D] hover:text-[#C8A15A] font-semibold flex items-center gap-1.5"
            >
              <span>Explore All Crystals</span>
              <ArrowRight className="w-4 h-4 text-[#C8A15A]" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8A15A]" />
            <span className="text-xs font-sans text-[#02281E]/70 uppercase tracking-widest">
              Loading Wishlist...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/80 border border-[#C8A15A]/30 p-12 text-center max-w-md mx-auto">
            <Heart className="w-12 h-12 text-[#C8A15A] mx-auto mb-3" />
            <h3 className="font-serif text-2xl text-[#02281E] mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-xs font-sans text-[#1C211E]/70 mb-6">
              Click the heart icon on any crystal product to save it here for future procurement.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#02281E] text-[#F4EEE4] text-xs font-sans uppercase tracking-[0.18em] font-semibold hover:bg-[#0B5942] transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const pid = (product.id || (product as any)._id)?.toString() || "";
              return (
                <div
                  key={pid}
                  className="bg-white border border-[#C8A15A]/30 shadow-xs flex flex-col overflow-hidden group hover:border-[#C8A15A] transition-colors"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-[#EDE4D5] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => toggleWishlist(pid)}
                      className="absolute top-3 right-3 p-2 bg-[#02281E] text-[#C8A15A] rounded-full hover:bg-rose-900 transition-colors shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  <div className="absolute top-3 left-3 bg-[#02281E]/90 px-2.5 py-1 text-[10px] font-sans uppercase tracking-widest text-[#D9BD82] border border-[#C8A15A]/20">
                    {product.size || "Standard"}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-1 justify-between bg-[#F4EEE4]">
                  <div>
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#063C2D]">
                      {product.article || "Swarovski®"}
                    </span>
                    <h3 className="font-serif text-xl text-[#02281E] mt-1 font-normal line-clamp-1">
                      <Link
                        href={`/products/${product.slug}`}
                        className="hover:text-[#C8A15A]"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-xs font-sans text-[#1C211E]/70 mt-0.5">
                      {product.colour}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#C8A15A]/20 flex items-center justify-between gap-3">
                    <span className="font-serif text-xl text-[#02281E] font-medium">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => addItem(product)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#02281E] text-[#F4EEE4] hover:bg-[#C8A15A] hover:text-[#02281E] transition-colors text-[11px] font-sans uppercase tracking-wider font-semibold"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}

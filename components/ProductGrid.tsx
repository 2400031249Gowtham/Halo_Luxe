"use client";

import React, { useState, useEffect } from "react";
import { Product, products as fallbackProducts } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  initialCategory?: string;
  showHeading?: boolean;
  limit?: number;
  initialProducts?: Product[];
  categoriesList?: { id: string; label: string }[];
}

export function ProductGrid({
  initialCategory = "all",
  showHeading = true,
  limit,
  initialProducts,
  categoriesList,
}: ProductGridProps) {
  const [filter, setFilter] = useState<string>(initialCategory);
  const [productList, setProductList] = useState<Product[]>(
    initialProducts || fallbackProducts
  );
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    categoriesList || [
      { id: "all", label: "ALL CRYSTALS" },
      { id: "individual", label: "INDIVIDUAL CRYSTALS" },
      { id: "sets", label: "HALO SETS" },
    ]
  );

  // Sync initialProducts if updated by parent
  useEffect(() => {
    if (initialProducts) {
      setProductList(initialProducts);
    }
  }, [initialProducts]);

  // If initialProducts was not passed, load dynamically from public MongoDB API
  useEffect(() => {
    if (!initialProducts) {
      async function loadDbProducts() {
        try {
          const res = await fetch("/api/public/products");
          if (res.ok) {
            const data = await res.json();
            if (data.products && data.products.length > 0) {
              setProductList(data.products);
            }
          }
        } catch (e) {
          console.warn("Using fallback products", e);
        }
      }
      loadDbProducts();
    }
  }, [initialProducts]);

  // Load categories if not passed
  useEffect(() => {
    if (!categoriesList) {
      async function loadCategories() {
        try {
          const res = await fetch("/api/public/categories");
          if (res.ok) {
            const data = await res.json();
            if (data.categories && data.categories.length > 0) {
              const pills = [
                { id: "all", label: "ALL CRYSTALS" },
                ...data.categories.map((c: any) => ({
                  id: c.slug.includes("set") ? "sets" : c.slug,
                  label: c.name.toUpperCase(),
                })),
              ];
              setCategories(pills);
            }
          }
        } catch (e) {
          console.warn("Using fallback categories", e);
        }
      }
      loadCategories();
    } else {
      setCategories(categoriesList);
    }
  }, [categoriesList]);

  const filteredProducts = productList.filter((p) => {
    if (filter === "all") return true;
    const catSlug = (
      (p as any).categorySlug ||
      (p as any).categoryId?.slug ||
      p.category ||
      ""
    ).toLowerCase();
    const filterKey = filter.toLowerCase();

    // Specific set check
    if (filterKey === "sets") {
      return catSlug === "sets" || catSlug === "halo-sets" || catSlug.includes("set");
    }

    // Specific individual crystals check
    if (filterKey === "individual" || filterKey === "individual-crystals") {
      return (
        catSlug === "individual" ||
        catSlug === "individual-crystals" ||
        (!catSlug.includes("set") && catSlug !== "crystals")
      );
    }

    // Direct match against category slug or id
    return (
      catSlug === filterKey ||
      p.category?.toLowerCase() === filterKey ||
      (p as any).categoryId?.slug?.toLowerCase() === filterKey ||
      (p as any).categoryId?._id === filter ||
      (p as any).categoryId === filter
    );
  });

  const displayedProducts = limit
    ? filteredProducts.slice(0, limit)
    : filteredProducts;

  return (
    <section className="py-8 md:py-12 px-6 sm:px-8 lg:px-12 bg-[#F4EEE4] text-[#1C211E]">
      <div className="max-w-7xl mx-auto">
        {showHeading && (
          <SectionHeading
            eyebrow="Clinical Collection"
            title="CHOOSE YOUR SPARKLE."
            subtitle="Genuine Swarovski® Flat Backs No Hotfix with platinum foiling, curated for dental professionals."
            align="center"
          />
        )}

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-6 md:mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "px-4 py-2 text-xs font-sans uppercase tracking-[0.16em] transition-all duration-300 border cursor-pointer",
                filter === cat.id
                  ? "bg-[#063C2D] text-[#F4EEE4] border-[#063C2D] shadow-xs"
                  : "bg-[#EDE4D5]/60 text-[#1C211E]/80 border-[#C8A15A]/25 hover:border-[#C8A15A]/60"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>

        {displayedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="font-serif text-xl text-[#02281E]">
              No crystals found in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

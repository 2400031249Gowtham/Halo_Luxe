import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SparkleStar } from "@/components/SparkleStar";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, Award, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getCategoryBySlug, getPublishedProducts } from "@/lib/db/catalogue";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | HALO",
    };
  }

  return {
    title: `${category.name} | HALO Swarovski® Tooth Crystals`,
    description:
      category.description ||
      `Explore genuine Swarovski® ${category.name} tooth crystals for dental professionals across India.`,
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getPublishedProducts({ categoryId: category._id });

  return (
    <div className="pt-28 pb-24 bg-[#F4EEE4]">
      {/* Editorial Category Header Banner */}
      <div className="bg-[#02281E] text-[#F4EEE4] py-16 md:py-20 px-6 sm:px-8 border-b border-[#C8A15A]/25 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparkleStar size={12} color="#D9BD82" />
            <span className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#D9BD82]">
              Clinical Collection
            </span>
            <SparkleStar size={12} color="#D9BD82" />
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide">
            {category.name}
          </h1>

          {category.description && (
            <p className="mt-4 text-sm sm:text-base font-sans font-light text-[#EDE4D5]/80 max-w-2xl mx-auto leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Quick breadcrumb */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-[0.16em] text-[#D9BD82]/80">
            <Link href="/shop" className="hover:text-[#F4EEE4] transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-[#F4EEE4] font-medium">{category.name}</span>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 px-4 text-left">
          <div className="flex items-center gap-3 p-3 bg-[#063C2D]/60 border border-[#C8A15A]/20">
            <Award className="w-5 h-5 text-[#C8A15A] shrink-0" />
            <span className="text-[11px] font-sans text-[#EDE4D5]">
              Authorised Distribution Sourcing
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#063C2D]/60 border border-[#C8A15A]/20">
            <Sparkles className="w-5 h-5 text-[#C8A15A] shrink-0" />
            <span className="text-[11px] font-sans text-[#EDE4D5]">
              Platinum Foiling Backing
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#063C2D]/60 border border-[#C8A15A]/20">
            <ShieldCheck className="w-5 h-5 text-[#C8A15A] shrink-0" />
            <span className="text-[11px] font-sans text-[#EDE4D5]">
              Safe Dental Bonding
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#063C2D]/60 border border-[#C8A15A]/20">
            <Truck className="w-5 h-5 text-[#C8A15A] shrink-0" />
            <span className="text-[11px] font-sans text-[#EDE4D5]">
              Nationwide Insured Courier
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 md:py-16 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D] font-medium">
            Showing {products.length} item{products.length === 1 ? "" : "s"} in this collection
          </p>
          <Link
            href="/shop"
            className="text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D] hover:text-[#C8A15A] transition-colors flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Crystals</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-[#EDE4D5]/30 border border-[#C8A15A]/20 p-8">
            <p className="font-serif text-2xl text-[#02281E]">
              No crystals in this category yet.
            </p>
            <p className="mt-2 text-xs font-sans text-[#1C211E]/70 max-w-md mx-auto">
              Crystals assigned to this collection in the admin dashboard will automatically appear here.
            </p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-[#063C2D] text-[#F4EEE4] text-xs font-sans uppercase tracking-[0.18em] font-medium hover:bg-[#0B5942] transition-colors"
              >
                Browse All Crystals
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

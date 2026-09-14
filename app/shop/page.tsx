import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductGrid";
import { SparkleStar } from "@/components/SparkleStar";
import { ShieldCheck, Truck, Sparkles, Award } from "lucide-react";
import { getPublishedProducts, getPublishedCategories } from "@/lib/db/catalogue";

export const metadata: Metadata = {
  title: "Shop Swarovski® Tooth Crystals | HALO Dental Supplies",
  description:
    "Explore genuine Swarovski® Flat Back No Hotfix tooth crystals with platinum foiling for dental professionals across India. Available in packs of 10.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const [products, dbCategories] = await Promise.all([
    getPublishedProducts(),
    getPublishedCategories(),
  ]);

  const categoriesList = [
    { id: "all", label: "ALL CRYSTALS" },
    ...dbCategories.map((c) => ({
      id: c.slug.includes("set") ? "sets" : c.slug,
      label: c.name.toUpperCase(),
    })),
  ];

  return (
    <div className="pt-28 pb-20 bg-[#F4EEE4]">
      {/* Header Banner */}
      <div className="bg-[#02281E] text-[#F4EEE4] py-16 md:py-20 px-6 sm:px-8 border-b border-[#C8A15A]/25 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparkleStar size={12} color="#D9BD82" />
            <span className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#D9BD82]">
              B2B Dental Supply
            </span>
            <SparkleStar size={12} color="#D9BD82" />
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide">
            Shop Swarovski® Tooth Crystals
          </h1>

          <p className="mt-4 text-sm sm:text-base font-sans font-light text-[#EDE4D5]/80 max-w-2xl mx-auto leading-relaxed">
            Authentic Swarovski® Flat Back No Hotfix components with platinum foiling, sealed in sterile blister packs of 10 for qualified dental clinics across India.
          </p>
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

      {/* Main Grid with Dynamic MongoDB Data */}
      <ProductGrid
        showHeading={false}
        initialProducts={products}
        categoriesList={categoriesList}
      />
    </div>
  );
}

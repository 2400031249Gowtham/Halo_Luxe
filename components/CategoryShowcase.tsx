import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import { getPublishedCategories } from "@/lib/db/catalogue";

export async function CategoryShowcase() {
  const dbCategories = await getPublishedCategories();

  const categories = dbCategories.slice(0, 2).map((cat) => ({
    title: cat.name.toUpperCase(),
    tagline: cat.description || "Choose your sparkle.",
    cta: "SHOP NOW",
    href: `/category/${cat.slug}`,
    image: cat.imageUrl || "/images/crystal-individual.jpg",
    alt: `Authentic Swarovski ${cat.name} tooth crystals`,
  }));

  return (
    <section className="pt-12 pb-8 md:pt-16 md:pb-10 px-6 sm:px-8 lg:px-12 bg-[#F4EEE4] text-[#1C211E]">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Curated Collections"
          title="SHOP HALO"
          subtitle="Swarovski® tooth crystals for dental professionals"
          align="center"
          theme="light"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6 md:mt-8">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative block overflow-hidden bg-[#EDE4D5] border border-[#C8A15A]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A15A]"
            >
              {/* Image Frame with hover zoom */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Gradient overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#02281E]/85 via-[#02281E]/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
              </div>

              {/* Editorial Text Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 flex flex-col items-start text-[#F4EEE4]">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase">
                  {cat.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base font-light font-serif text-[#EDE4D5]/90">
                  {cat.tagline}
                </p>

                {/* Elegant Gold Line & Arrow CTA */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative w-10 group-hover:w-16 h-[1px] bg-[#C8A15A] transition-all duration-500" />
                  <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#D9BD82] font-semibold flex items-center gap-2">
                    {cat.cta}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

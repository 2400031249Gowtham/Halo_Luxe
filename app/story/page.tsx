import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SparkleStar } from "@/components/SparkleStar";
import { BrandValues } from "@/components/BrandValues";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Our Story | HALO — Curated by a Dentist. Made for Dentists.",
  description:
    "Discover the origin of HALO, founded by aesthetic dentist Dr. Suprasna Sharan in Chennai to supply genuine Swarovski® tooth crystals to dental professionals across India.",
};

export default function StoryPage() {
  return (
    <div className="pt-28 pb-24 bg-[#F4EEE4] text-[#1C211E]">
      {/* Editorial Header */}
      <section className="px-6 sm:px-8 lg:px-12 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <SparkleStar size={12} color="#C8A15A" />
          <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#063C2D] font-medium">
            Our Story
          </span>
          <SparkleStar size={12} color="#C8A15A" />
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal uppercase leading-[1.08] text-[#02281E]">
          It Started With
          <br />
          <span className="italic font-light">A Little Sparkle.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl font-serif italic text-[#063C2D] max-w-2xl mx-auto leading-relaxed">
          “HALO began in the dental chair.”
        </p>

        <div className="w-16 h-[1px] bg-[#C8A15A] mx-auto my-8" />
      </section>

      {/* Narrative Section with Large Editorial Imagery */}
      <section className="px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] bg-[#EDE4D5] border border-[#C8A15A]/30 overflow-hidden shadow-xl">
              <Image
                src="/images/editorial-smile.jpg"
                alt="Dr. Suprasna Sharan clinical smile transformation"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-sm sm:text-base font-sans font-light text-[#1C211E]/85 leading-relaxed">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#02281E]">
              From Clinical Chairside to Nationwide Supply
            </h2>

            <p>
              While working with patients, Dr. Suprasna Sharan, an aesthetic dentist, began incorporating tooth gems and tooth grills into smile transformations.
            </p>

            <p>
              She observed the genuine delight patients felt seeing their smiles catch the light with subtle, tailored brilliance. However, the dental industry lacked a reliable, medical-grade source for authentic crystal components. Clinicians were often forced to navigate non-sterile hobbyist materials or questionable imports lacking safe enamel backing.
            </p>

            <p>
              HALO was established to eliminate this compromise. By curating genuine Swarovski® crystal components—sourced exclusively through an authorised Swarovski® distribution partner—HALO delivers the optical perfection of high jewellery paired with clinical protocols dentists trust.
            </p>

            <div className="p-6 bg-[#EDE4D5]/60 border-l-2 border-[#C8A15A] my-6">
              <p className="font-serif text-lg text-[#02281E] italic">
                “Tooth crystals are not merely accessories; in the hands of a skilled dentist, they are miniature jewels that celebrate a patient’s unique smile architecture.”
              </p>
              <span className="block mt-2 text-xs font-sans uppercase tracking-widest text-[#063C2D]">
                — Dr. Suprasna Sharan, Aesthetic Dentist
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Visually Powerful Center Statement */}
      <section className="my-28 py-20 px-6 bg-[#02281E] text-[#F4EEE4] text-center relative overflow-hidden border-y border-[#C8A15A]/30">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/images/hero-silk.jpg"
            alt="Emerald silk"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <SparkleStar size={20} color="#D9BD82" className="mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl uppercase tracking-[0.1em] font-normal leading-tight">
            Curated By A Dentist.
            <br />
            <span className="text-[#D9BD82] italic font-light">
              Made For Dentists.
            </span>
          </h2>

          <p className="mt-6 text-xs sm:text-sm font-sans font-light text-[#EDE4D5]/80 max-w-xl mx-auto tracking-wide leading-relaxed">
            Every size, cut, and colour in the HALO collection is selected based on clinical bonding behavior, patient wear comfort, and oral light refraction.
          </p>

          <div className="mt-10">
            <Button variant="primary" href="/shop" arrow>
              Explore The Collection
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <BrandValues />
    </div>
  );
}

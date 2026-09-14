import React from "react";
import Image from "next/image";
import { Button } from "./Button";
import { SparkleStar } from "./SparkleStar";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#02281E] text-[#F4EEE4] pt-28 pb-16">
      {/* Background Emerald Silk with refined overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/images/hero-silk.jpg"
          alt="Dark emerald luxury silk texture"
          fill
          priority
          className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Subtle vignette and ambient dark emerald overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02281E] via-[#02281E]/60 to-[#02281E]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(11,89,66,0.35)_0%,rgba(2,40,30,0.85)_75%)]" />
      </div>

      {/* Subtle Architectural Editorial Hairlines on Left & Right Margins (Desktop Only) */}
      <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-6 z-10 select-none pointer-events-none opacity-45">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#C8A15A] to-[#C8A15A]" />
        <span className="[writing-mode:vertical-lr] text-[9px] font-sans uppercase tracking-[0.32em] text-[#D9BD82] rotate-180">
          Swarovski® Clinical Components
        </span>
        <div className="w-[1px] h-24 bg-gradient-to-b from-[#C8A15A] via-[#C8A15A] to-transparent" />
      </div>

      <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-6 z-10 select-none pointer-events-none opacity-45">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#C8A15A] to-[#C8A15A]" />
        <span className="[writing-mode:vertical-lr] text-[9px] font-sans uppercase tracking-[0.32em] text-[#D9BD82]">
          Pan-India Clinic Dispatch · Chennai Studio
        </span>
        <div className="w-[1px] h-24 bg-gradient-to-b from-[#C8A15A] via-[#C8A15A] to-transparent" />
      </div>

      {/* Hero Content Container - Expansive Editorial Typography */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center flex flex-col items-center w-full">
        {/* Small Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#C8A15A]/30 bg-[#063C2D]/50 backdrop-blur-sm mb-6">
          <SparkleStar size={11} color="#D9BD82" />
          <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.24em] text-[#D9BD82] font-medium">
            Curated for Dental Professionals
          </span>
          <SparkleStar size={11} color="#D9BD82" />
        </div>

        {/* Main Heading - Expansive Widescreen Grandeur */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[92px] xl:text-[108px] font-normal tracking-[0.06em] leading-[1.04] text-[#F4EEE4] uppercase max-w-5xl">
          Every Smile
          <br />
          <span className="italic font-light text-[#EDE4D5]">Deserves Its Own</span>{" "}
          Halo.
        </h1>

        {/* Supporting and Secondary Text - Wide, balanced editorial layout */}
        <div className="mt-6 sm:mt-8 max-w-3xl mx-auto space-y-2">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl text-[#EDE4D5]/95 font-light leading-relaxed">
            Swarovski® tooth crystals, curated for dental professionals.
          </p>
          <p className="text-xs sm:text-sm font-sans text-[#F4EEE4]/75 font-light tracking-wider leading-relaxed max-w-xl mx-auto">
            Tooth crystals and professional tooth gem supplies for dentists across India.
          </p>
        </div>

        {/* Delicate Gold Accent Line */}
        <div className="w-16 h-[1px] bg-[#C8A15A]/40 my-8" />

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            href="/shop"
            arrow
            className="w-full sm:w-auto"
          >
            Shop Tooth Crystals
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href="/story"
            className="w-full sm:w-auto"
          >
            Discover HALO
          </Button>
        </div>

        {/* Subtle scroll cue */}
        <div className="mt-12 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#D9BD82]">
            Scroll to explore
          </span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-[#C8A15A] to-transparent" />
        </div>
      </div>
    </section>
  );
}

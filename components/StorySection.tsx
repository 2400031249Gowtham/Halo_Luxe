import React from "react";
import Image from "next/image";
import { SparkleStar } from "./SparkleStar";
import { Button } from "./Button";

export function StorySection() {
  return (
    <section className="py-12 md:py-16 px-6 sm:px-8 lg:px-12 bg-[#EDE4D5]/35 border-y border-[#C8A15A]/20 text-[#1C211E] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Image with Luxury Floating Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full max-w-lg mx-auto bg-[#EDE4D5] border border-[#C8A15A]/30 overflow-hidden shadow-xl">
              <Image
                src="/images/editorial-smile.jpg"
                alt="Dr. Suprasna Sharan smile transformation with subtle Swarovski crystal"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02281E]/40 via-transparent to-transparent" />
            </div>

            {/* Subtle decorative gold badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-8 bg-[#02281E] text-[#F4EEE4] p-6 border border-[#C8A15A]/40 max-w-[240px] shadow-lg hidden sm:block">
              <div className="flex items-center gap-2 mb-2">
                <SparkleStar size={14} color="#D9BD82" />
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D9BD82]">
                  Clinical Heritage
                </span>
              </div>
              <p className="font-serif text-sm text-[#EDE4D5] leading-snug">
                Founded by Dr. Suprasna Sharan, Aesthetic Dentist.
              </p>
            </div>
          </div>

          {/* Right: Editorial Typography Story */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-4">
              <SparkleStar size={12} color="#C8A15A" />
              <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#063C2D] font-medium">
                Our Story
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] text-[#02281E] tracking-tight uppercase">
              It Started
              <br />
              <span className="italic font-light">With A Little</span>
              <br />
              Sparkle.
            </h2>

            {/* Subtle Gold Line */}
            <div className="w-16 h-[1px] bg-[#C8A15A] my-4" />

            {/* Body Copy */}
            <div className="space-y-4 text-sm sm:text-base font-sans font-light text-[#1C211E]/80 leading-relaxed max-w-xl">
              <p className="font-serif text-lg sm:text-xl text-[#02281E] italic leading-relaxed">
                “HALO began in the dental chair.”
              </p>

              <p>
                While working with patients, Dr. Suprasna Sharan, an aesthetic dentist, began incorporating tooth gems and tooth grills into bespoke smile transformations.
              </p>

              <p>
                She saw firsthand how a delicate sparkle could transform a patient’s confidence, individuality, and self-expression. Yet qualified dental professionals across India lacked direct access to genuine, sterile, and clinical-grade crystal components designed specifically for safe enamel bonding.
              </p>

              <p>
                HALO was born to bridge the gap between luxury high-jewellery aesthetics and uncompromising clinical dental protocols. Every crystal component is genuine Swarovski®, sourced through an authorised distribution partner, and selected for clinical excellence.
              </p>
            </div>

            {/* Powerful End Statement */}
            <div className="mt-6 pt-5 border-t border-[#C8A15A]/25 w-full">
              <p className="font-serif text-2xl sm:text-3xl text-[#02281E] tracking-[0.08em] uppercase font-normal">
                Curated By A Dentist.
                <br />
                <span className="text-[#0B5942] italic">Made For Dentists.</span>
              </p>

              <div className="mt-5">
                <Button variant="dark" href="/story" arrow>
                  Read Our Full Story
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

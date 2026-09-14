import React from "react";
import Image from "next/image";
import { Button } from "./Button";
import { SparkleStar } from "./SparkleStar";

export function FinalCTA() {
  return (
    <section className="relative py-16 md:py-24 px-6 sm:px-8 lg:px-12 bg-[#02281E] text-[#F4EEE4] overflow-hidden">
      {/* Background silk layer */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <Image
          src="/images/hero-silk.jpg"
          alt="Emerald silk background"
          fill
          className="object-cover opacity-30 mix-blend-luminosity"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02281E] via-[#02281E]/80 to-[#02281E]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,89,66,0.3)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <SparkleStar size={14} color="#D9BD82" />
          <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#D9BD82] font-medium">
            Elevate Your Aesthetic Practice
          </span>
          <SparkleStar size={14} color="#D9BD82" />
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-[0.06em] uppercase leading-[1.08] text-[#F4EEE4] max-w-3xl">
          Every Smile
          <br />
          <span className="italic font-light text-[#EDE4D5]">Deserves Its</span>
          <br />
          Own Halo.
        </h2>

        <p className="mt-4 text-sm sm:text-base font-sans font-light text-[#EDE4D5]/80 max-w-xl leading-relaxed">
          Join leading dentists across India offering genuine Swarovski® tooth crystals and safe clinical tooth gem smile transformations.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
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
            href="/contact"
            arrow
            className="w-full sm:w-auto"
          >
            Get in Touch
          </Button>
        </div>
      </div>
    </section>
  );
}

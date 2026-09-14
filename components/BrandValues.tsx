import React from "react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "./SectionHeading";

export function BrandValues() {
  return (
    <section className="py-10 md:py-14 px-6 sm:px-8 lg:px-12 bg-[#F4EEE4] text-[#1C211E]">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="The HALO Standard"
          title="WHY HALO"
          subtitle="A commitment to authenticity, aesthetic dentistry, and uncompromising clinical quality."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mt-6 md:mt-8">
          {siteConfig.brandValues.map((val, idx) => (
            <div
              key={val.title}
              className="flex flex-col p-6 sm:p-7 bg-[#EDE4D5]/40 border border-[#C8A15A]/25 transition-all duration-300 hover:border-[#C8A15A]/60 hover:-translate-y-1"
            >
              {/* Refined Numbering */}
              <div className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#C8A15A] font-semibold mb-4">
                0{idx + 1}
              </div>

              {/* Title in Serif */}
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#02281E] tracking-wide uppercase">
                {val.title}
              </h3>

              {/* Fine Gold Line */}
              <div className="w-8 h-[1px] bg-[#C8A15A] my-3" />

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm text-[#1C211E]/75 leading-relaxed font-light">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

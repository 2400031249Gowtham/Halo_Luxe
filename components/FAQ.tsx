"use client";

import React, { useState } from "react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "./SectionHeading";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQProps {
  showHeading?: boolean;
}

export function FAQ({ showHeading = true }: FAQProps) {
  // Allow toggling open items (default first one open)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-10 md:py-14 px-6 sm:px-8 lg:px-12 bg-[#F4EEE4] text-[#1C211E]">
      <div className="max-w-4xl mx-auto">
        {showHeading && (
          <SectionHeading
            eyebrow="Clinical Knowledge"
            title="QUESTIONS, ANSWERED."
            subtitle="Essential information regarding Swarovski® tooth crystals, safety, clinical protocols, and nationwide clinic fulfillment."
            align="center"
          />
        )}

        {/* Accordion List */}
        <div className="divide-y divide-[#C8A15A]/25 border-y border-[#C8A15A]/25">
          {siteConfig.faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const headingId = `faq-heading-${idx}`;
            const panelId = `faq-panel-${idx}`;

            return (
              <div key={idx} className="group transition-colors duration-200">
                <button
                  type="button"
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(idx)}
                  className="w-full py-4 sm:py-5 flex items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A15A] cursor-pointer"
                >
                  <span
                    className={cn(
                      "font-serif text-xl sm:text-2xl font-normal transition-colors duration-300",
                      isOpen ? "text-[#063C2D]" : "text-[#02281E] group-hover:text-[#063C2D]"
                    )}
                  >
                    {faq.question}
                  </span>

                  {/* Gold Plus/Minus Indicator */}
                  <span
                    className={cn(
                      "p-1.5 rounded-full border border-[#C8A15A]/40 shrink-0 text-[#C8A15A] transition-transform duration-300",
                      isOpen
                        ? "bg-[#063C2D] text-[#D9BD82] rotate-180"
                        : "bg-[#EDE4D5]/60 group-hover:border-[#C8A15A]"
                    )}
                    aria-hidden="true"
                  >
                    {isOpen ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Answer Content Panel */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out font-sans",
                    isOpen ? "max-h-96 pb-7 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="text-sm sm:text-base font-light text-[#1C211E]/80 leading-relaxed pr-8 sm:pr-12">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

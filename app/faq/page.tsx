import type { Metadata } from "next";
import { FAQ } from "@/components/FAQ";
import { SparkleStar } from "@/components/SparkleStar";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Swarovski® Tooth Crystals | HALO",
  description:
    "Find answers to common questions about Swarovski® tooth crystals, clinical safety, dental bonding techniques, shipping across India, and bulk wholesale inquiries.",
};

export default function FAQPage() {
  return (
    <div className="pt-28 pb-24 bg-[#F4EEE4]">
      {/* Header Banner */}
      <section className="bg-[#02281E] text-[#F4EEE4] py-16 md:py-20 px-6 sm:px-8 border-b border-[#C8A15A]/25 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparkleStar size={12} color="#D9BD82" />
            <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#D9BD82]">
              Assistance & Clinical Knowledge
            </span>
            <SparkleStar size={12} color="#D9BD82" />
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-normal uppercase tracking-wide">
            Frequently Asked Questions
          </h1>

          <p className="mt-4 text-sm sm:text-base font-sans font-light text-[#EDE4D5]/80 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about HALO crystal components, safety standards, clinical application, and wholesale ordering.
          </p>
        </div>
      </section>

      {/* Accordion Component */}
      <FAQ showHeading={false} />

      {/* Support Box */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 mt-12 text-center p-8 bg-[#EDE4D5]/50 border border-[#C8A15A]/25">
        <h2 className="font-serif text-2xl text-[#02281E]">
          Have a specific question about clinic orders?
        </h2>
        <p className="text-xs sm:text-sm font-sans text-[#1C211E]/75 mt-2 mb-6 max-w-lg mx-auto">
          Our dental concierge team is available to assist doctors, clinics, and distributors with sample packs and custom wholesale arrangements.
        </p>
        <Button variant="dark" href="/contact" arrow>
          Contact Our Concierge
        </Button>
      </div>
    </div>
  );
}

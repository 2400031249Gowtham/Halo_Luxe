import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { SparkleStar } from "@/components/SparkleStar";
import { siteConfig } from "@/data/site";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact & Wholesale Inquiries | HALO",
  description:
    "Get in touch with HALO for B2B Swarovski® tooth crystal supplies, wholesale dental clinic orders, and Chennai tooth gem appointments.",
};

export default function ContactPage() {
  return (
    <div className="pt-28 pb-24 bg-[#F4EEE4] text-[#1C211E]">
      {/* Header Banner */}
      <section className="bg-[#02281E] text-[#F4EEE4] py-16 md:py-20 px-6 sm:px-8 border-b border-[#C8A15A]/25 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparkleStar size={12} color="#D9BD82" />
            <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#D9BD82]">
              Concierge & Clinic Support
            </span>
            <SparkleStar size={12} color="#D9BD82" />
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-normal uppercase tracking-wide">
            Get In Touch
          </h1>

          <p className="mt-4 font-serif text-lg sm:text-xl italic text-[#EDE4D5]">
            “{siteConfig.tagline}”
          </p>

          <p className="mt-2 text-xs sm:text-sm font-sans font-light text-[#F4EEE4]/70 tracking-wide">
            Tooth crystals for dental professionals across India.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Contact Info & Chennai Studio Details */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#063C2D] font-medium block mb-2">
                HALO Concierge
              </span>
              <h2 className="font-serif text-3xl font-normal text-[#02281E]">
                Dedicated Dental Support
              </h2>
              <p className="text-xs sm:text-sm font-sans text-[#1C211E]/75 mt-3 leading-relaxed">
                Whether you are placing your clinic’s first crystal order, requesting wholesale tier pricing, or inquiring about Chennai tooth gem application, we are here to support your practice.
              </p>
            </div>

            {/* Studio Info Card */}
            <div className="p-6 bg-[#EDE4D5]/60 border border-[#C8A15A]/30 space-y-5">
              <div>
                <h3 className="font-serif text-xl text-[#02281E] mb-1">
                  Chennai Aesthetic Studio
                </h3>
                <p className="text-xs font-sans text-[#063C2D] font-medium">
                  {siteConfig.clinic.doctor} · {siteConfig.clinic.specialty}
                </p>
              </div>

              <div className="space-y-3 text-xs font-sans text-[#1C211E]/80">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C8A15A] shrink-0 mt-0.5" />
                  <span>{siteConfig.clinic.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#C8A15A] shrink-0" />
                  <span>{siteConfig.clinic.hours}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#C8A15A] shrink-0" />
                  <a
                    href={`mailto:${siteConfig.clinic.email}`}
                    className="hover:text-[#063C2D] underline"
                  >
                    {siteConfig.clinic.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <InstagramIcon className="w-4 h-4 text-[#C8A15A] shrink-0" />
                  <a
                    href={siteConfig.clinic.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#063C2D] underline"
                  >
                    {siteConfig.clinic.instagram}
                  </a>
                </div>
              </div>
            </div>

            {/* B2B Assurance Note */}
            <div className="p-5 border-l-2 border-[#063C2D] bg-[#063C2D]/5 text-xs font-sans text-[#1C211E]/80 leading-relaxed">
              <strong>B2B Clinical Wholesale:</strong> We supply registered dental clinics, cosmetic practitioners, and orthodontic centres across India with authentic Swarovski® Flat Back No Hotfix components.
            </div>
          </div>

          {/* Right: Interactive Form */}
          <div className="lg:col-span-7">
            <Suspense fallback={<div className="p-12 text-center">Loading form...</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

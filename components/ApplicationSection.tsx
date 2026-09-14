import React from "react";
import Image from "next/image";
import { Button } from "./Button";
import { SparkleStar } from "./SparkleStar";
import { MapPin, Calendar } from "lucide-react";

export function ApplicationSection() {
  return (
    <section className="py-12 md:py-16 px-6 sm:px-8 lg:px-12 bg-[#063C2D] text-[#F4EEE4] relative overflow-hidden border-t border-[#C8A15A]/20">
      {/* Subtle background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(11,89,66,0.5)_0%,rgba(6,60,45,0.95)_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Clinic Photo Feature */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-none overflow-hidden border border-[#C8A15A]/30 shadow-lg bg-[#02281E]">
              <Image
                src="/images/chennai-clinic.jpg"
                alt="HALO Aesthetic Dentistry Studio in T. Nagar, Chennai"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02281E]/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Details & Inquiries */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2">
              <SparkleStar size={12} color="#D9BD82" />
              <span className="text-[11px] font-sans uppercase tracking-[0.22em] text-[#D9BD82] font-medium">
                Aesthetic Dental Clinic
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.15] text-[#F4EEE4] uppercase tracking-wide">
              Tooth Gem Application
              <br />
              <span className="italic text-[#EDE4D5] font-light">In Chennai</span>
            </h2>

            <div className="w-12 h-[1px] bg-[#C8A15A] my-4" />

            <p className="font-serif text-lg text-[#EDE4D5] italic mb-1.5">
              Looking for tooth gem application?
            </p>

            <p className="font-sans text-sm sm:text-base text-[#F4EEE4]/80 font-light leading-relaxed max-w-xl mb-4">
              HALO also offers professional tooth gem application in Chennai, by Dr. Suprasna Sharan, aesthetic dentist. Experience custom smile consultation and painless clinical bonding using genuine Swarovski® crystal components.
            </p>

            <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm font-sans text-[#EDE4D5]/90 mb-6 border-y border-[#C8A15A]/20 py-3 w-full max-w-xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C8A15A] shrink-0" />
                <span>25, Krishnabai St, T. Nagar, Chennai</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C8A15A] shrink-0" />
                <span>Consultations by Prior Appointment</span>
              </div>
            </div>

            <Button
              variant="primary"
              href="/contact?type=Tooth+gem+application"
              arrow
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

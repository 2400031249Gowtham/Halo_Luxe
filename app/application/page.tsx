import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SparkleStar } from "@/components/SparkleStar";
import { Button } from "@/components/Button";
import { MapPin, Calendar, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Tooth Gem Application | Clinical Protocol & Chennai Studio | HALO",
  description:
    "Professional tooth crystal application protocol for dental professionals and boutique tooth gem appointments in T. Nagar, Chennai with Dr. Suprasna Sharan.",
};

export default function ApplicationPage() {
  const clinicalSteps = [
    {
      step: "01",
      title: "Preparation & Isolation",
      detail:
        "Isolate the treatment quadrant using lip retractors and dry cotton rolls. Clean the target enamel surface thoroughly with non-fluoridated pumice slurry. Rinse and air dry completely with oil-free air.",
    },
    {
      step: "02",
      title: "Enamel Acid Etch",
      detail:
        "Apply 37% phosphoric acid gel to the precise placement area for 20 seconds. Thoroughly rinse for 15 seconds, and gently dry until a characteristic frosty-white enamel appearance is achieved.",
    },
    {
      step: "03",
      title: "Bonding Adhesive",
      detail:
        "Apply a micro-drop of dental adhesive resin (such as 3M Single Bond or equivalent). Gently air thin for 5 seconds to evaporate solvents, then light cure for 10–20 seconds according to adhesive manufacturer instructions.",
    },
    {
      step: "04",
      title: "Composite & Crystal Seating",
      detail:
        "Place a miniature pinpoint of light-cured flowable composite resin. Using a precision gem applicator, gently pick up the Swarovski® Flat Back and press into position. Verify alignment and remove any excess marginal flash.",
    },
    {
      step: "05",
      title: "Polymerisation & Verification",
      detail:
        "Light cure for 40–60 seconds from buccal, incisal, and interproximal angles. Verify that the crystal is completely mechanically locked without impeding patient occlusion or canine guidance.",
    },
  ];

  return (
    <div className="pt-28 pb-24 bg-[#F4EEE4] text-[#1C211E]">
      {/* Header */}
      <section className="bg-[#02281E] text-[#F4EEE4] py-16 md:py-24 px-6 sm:px-8 border-b border-[#C8A15A]/25 text-center relative">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparkleStar size={12} color="#D9BD82" />
            <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#D9BD82]">
              Clinical Protocol & Practice
            </span>
            <SparkleStar size={12} color="#D9BD82" />
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-normal uppercase tracking-wide">
            Professional Application
          </h1>

          <p className="mt-4 text-sm sm:text-base font-sans font-light text-[#EDE4D5]/80 max-w-2xl mx-auto leading-relaxed">
            Standardised chairside protocols for qualified dental surgeons, alongside bespoke in-clinic applications at our Chennai aesthetic studio.
          </p>
        </div>
      </section>

      {/* Part 1: Dental Professional Protocol (B2B Focus) */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-sans uppercase tracking-[0.22em] text-[#063C2D] font-medium">
            For Dentists & Cosmetic Clinics
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#02281E] mt-2">
            Chairside Clinical Bonding Protocol
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#1C211E]/75 mt-3 leading-relaxed">
            HALO tooth crystals are strictly intended for professional dental bonding. Following standard enamel adhesive protocol ensures maximum retention (6–24+ months) with zero irreversible enamel alteration.
          </p>
        </div>

        <div className="space-y-6">
          {clinicalSteps.map((s) => (
            <div
              key={s.step}
              className="p-6 sm:p-8 bg-[#EDE4D5]/40 border border-[#C8A15A]/30 flex flex-col sm:flex-row gap-6 sm:items-baseline"
            >
              <span className="font-serif text-3xl text-[#C8A15A] sm:w-16 shrink-0">
                {s.step}
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-xl sm:text-2xl text-[#02281E] font-normal mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm font-sans font-light text-[#1C211E]/80 leading-relaxed">
                  {s.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 bg-[#063C2D]/5 border border-[#063C2D]/15 flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-[#063C2D] shrink-0 mt-0.5" />
          <p className="text-xs font-sans text-[#1C211E]/80 leading-relaxed">
            <strong className="font-semibold text-[#063C2D]">Clinical Note:</strong> Never drill or grind enamel to place a tooth crystal. Swarovski® Flat Backs No Hotfix feature ultra-thin, low-profile geometry engineered to rest flush upon the enamel contour using flowable composite retention.
          </p>
        </div>
      </section>

      {/* Part 2: Chennai In-Clinic Application Section */}
      <section className="mt-16 py-20 px-6 sm:px-8 lg:px-12 bg-[#02281E] text-[#F4EEE4] border-t border-[#C8A15A]/25">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] border border-[#C8A15A]/30 shadow-xl overflow-hidden bg-[#063C2D]">
                <Image
                  src="/images/chennai-clinic.jpg"
                  alt="HALO Aesthetic Dentistry Clinic Chennai"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2">
                <SparkleStar size={12} color="#D9BD82" />
                <span className="text-xs font-sans uppercase tracking-[0.24em] text-[#D9BD82]">
                  Chennai Aesthetic Studio
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-[#F4EEE4] uppercase">
                Tooth Gem Application
                <br />
                <span className="italic text-[#EDE4D5]">In Chennai</span>
              </h2>

              <p className="font-serif text-lg text-[#EDE4D5] italic">
                Looking for tooth gem application?
              </p>

              <p className="font-sans text-xs sm:text-sm font-light text-[#F4EEE4]/80 leading-relaxed">
                HALO also offers professional tooth gem application in Chennai, by Dr. Suprasna Sharan, aesthetic dentist. Receive an individualised smile curation in our comfortable, private boutique studio in T. Nagar.
              </p>

              <div className="space-y-2.5 pt-2 text-xs font-sans text-[#EDE4D5]/90 border-t border-[#C8A15A]/20">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C8A15A]" />
                  <span>25, Krishnabai Street, Habibullah Road, T. Nagar, Chennai 600017</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#C8A15A]" />
                  <span>Appointments Available Monday through Saturday</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  href="/contact?type=Tooth+gem+application"
                  arrow
                >
                  Book Chennai Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

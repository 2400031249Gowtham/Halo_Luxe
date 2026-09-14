"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { Logo } from "./Logo";
import { MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "./Icons";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#02281E] text-[#F4EEE4] border-t border-[#C8A15A]/25 pt-12 pb-8 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-[#C8A15A]/20">
          {/* Brand Col */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Logo theme="dark" />
            <p className="mt-4 font-serif text-lg text-[#D9BD82] tracking-wider uppercase">
              {siteConfig.tagline}
            </p>
            <p className="mt-2 text-xs sm:text-sm font-sans font-light text-[#F4EEE4]/70 max-w-sm leading-relaxed">
              Tooth crystals and professional tooth gem supplies for dental professionals across India.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <a
                href={siteConfig.clinic.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-sans text-[#D9BD82] hover:text-[#F4EEE4] transition-colors group"
                aria-label="Follow HALO on Instagram"
              >
                <InstagramIcon className="w-4 h-4 text-[#C8A15A]" />
                <span>{siteConfig.clinic.instagram}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold mb-6">
              Navigation
            </h3>
            <ul className="space-y-3.5">
              {siteConfig.footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs uppercase tracking-[0.16em] text-[#F4EEE4]/80 hover:text-[#C8A15A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chennai Clinic & Address */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold mb-6">
              Chennai Studio
            </h3>
            <div className="space-y-3 text-xs font-sans font-light text-[#F4EEE4]/80 leading-relaxed">
              <p className="font-serif text-base text-[#EDE4D5] font-normal">
                {siteConfig.clinic.doctor}
                <span className="block text-[11px] font-sans text-[#D9BD82] uppercase tracking-wider">
                  {siteConfig.clinic.specialty}
                </span>
              </p>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-[#C8A15A] shrink-0 mt-0.5" />
                <span>
                  25, Krishnabai Street,
                  <br />
                  Habibullah Road, T. Nagar,
                  <br />
                  Chennai 600017
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-4 h-4 text-[#C8A15A] shrink-0" />
                <span>{siteConfig.clinic.email}</span>
              </div>
            </div>
          </div>

          {/* Inquiries CTA */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold mb-6">
              Inquiries
            </h3>
            <p className="text-xs font-sans font-light text-[#F4EEE4]/70 mb-6">
              Dentists, clinics and wholesale orders.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 border border-[#C8A15A] text-[#D9BD82] text-xs font-sans uppercase tracking-[0.18em] hover:bg-[#C8A15A] hover:text-[#02281E] transition-all duration-300"
            >
              <span>Get in Touch</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] font-sans text-[#F4EEE4]/60 font-light">
          <p className="max-w-xl">
            {siteConfig.legalDisclaimer}
          </p>
          <p>
            © {new Date().getFullYear()} HALO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

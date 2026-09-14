"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { X, ArrowRight, Phone, MapPin } from "lucide-react";
import { InstagramIcon } from "./Icons";
import { SparkleStar } from "./SparkleStar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#02281E] text-[#F4EEE4] animate-in fade-in duration-300 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6 border-b border-[#C8A15A]/20">
        <Link
          href="/"
          onClick={onClose}
          className="font-serif text-2xl font-normal tracking-[0.25em] text-[#F4EEE4] flex items-center gap-2"
        >
          <span>HALO</span>
          <SparkleStar size={14} color="#C8A15A" />
        </Link>
        <button
          onClick={onClose}
          className="p-2 text-[#F4EEE4]/80 hover:text-[#C8A15A] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A15A]"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-8 py-10 flex flex-col justify-center space-y-6">
        {siteConfig.navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={onClose}
            className="font-serif text-3xl sm:text-4xl tracking-wider text-[#F4EEE4] hover:text-[#C8A15A] transition-colors flex items-center justify-between group"
          >
            <span>{link.label}</span>
            <ArrowRight className="w-5 h-5 text-[#C8A15A] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </Link>
        ))}

        <Link
          href="/contact"
          onClick={onClose}
          className="font-serif text-3xl sm:text-4xl tracking-wider text-[#D9BD82] hover:text-[#F4EEE4] transition-colors flex items-center justify-between group pt-2"
        >
          <span>CONTACT</span>
          <ArrowRight className="w-5 h-5 text-[#C8A15A] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </Link>
      </div>

      {/* Footer Info in Drawer */}
      <div className="p-8 border-t border-[#C8A15A]/20 bg-[#063C2D]/40 space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#D9BD82]">
          {siteConfig.tagline}
        </p>

        <div className="text-xs text-[#F4EEE4]/70 space-y-1 font-sans">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#C8A15A] shrink-0" />
            <span>T. Nagar, Chennai 600017</span>
          </div>
          <div className="flex items-center gap-2">
            <InstagramIcon className="w-3.5 h-3.5 text-[#C8A15A] shrink-0" />
            <span>{siteConfig.clinic.instagram}</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/shop"
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-[#C8A15A] text-[#02281E] font-sans text-xs uppercase tracking-[0.16em] font-semibold text-center block hover:bg-[#D9BD82] transition-colors"
          >
            Shop Tooth Crystals →
          </Link>
        </div>
      </div>
    </div>
  );
}

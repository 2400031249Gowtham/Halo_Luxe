import React from "react";
import Link from "next/link";
import { SparkleStar } from "./SparkleStar";
import { cn } from "@/lib/utils";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
}

export function Logo({ theme = "dark", className }: LogoProps) {
  const isDark = theme === "dark";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A15A]",
        className
      )}
      aria-label="HALO Home"
    >
      <span
        className={cn(
          "font-serif text-2xl md:text-3xl font-normal tracking-[0.28em] transition-colors duration-300",
          isDark
            ? "text-[#F4EEE4] group-hover:text-[#D9BD82]"
            : "text-[#02281E] group-hover:text-[#063C2D]"
        )}
      >
        HALO
      </span>
      <SparkleStar
        size={14}
        color="#C8A15A"
        className="transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110"
      />
    </Link>
  );
}

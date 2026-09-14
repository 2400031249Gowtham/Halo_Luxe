import React from "react";
import { SparkleStar } from "./SparkleStar";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  theme?: "dark" | "light";
  className?: string;
  showSparkle?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  theme = "light",
  className,
  showSparkle = true,
}: SectionHeadingProps) {
  const isDark = theme === "dark";

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn(
        "flex flex-col mb-6 md:mb-8",
        alignmentClasses[align],
        className
      )}
    >
      {eyebrow && (
        <div className="flex items-center gap-2 mb-3">
          {showSparkle && (
            <SparkleStar
              size={12}
              color={isDark ? "#D9BD82" : "#C8A15A"}
            />
          )}
          <span
            className={cn(
              "text-[11px] uppercase tracking-[0.25em] font-sans font-medium",
              isDark ? "text-[#D9BD82]" : "text-[#063C2D]/80"
            )}
          >
            {eyebrow}
          </span>
          {showSparkle && (
            <SparkleStar
              size={12}
              color={isDark ? "#D9BD82" : "#C8A15A"}
            />
          )}
        </div>
      )}

      <h2
        className={cn(
          "font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide font-normal leading-[1.15]",
          isDark ? "text-[#F4EEE4]" : "text-[#02281E]"
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-sm md:text-base font-sans font-light leading-relaxed",
            isDark ? "text-[#EDE4D5]/80" : "text-[#1C211E]/75"
          )}
        >
          {subtitle}
        </p>
      )}

      <div
        className={cn(
          "w-12 h-[1px] mt-3",
          isDark ? "bg-[#C8A15A]/40" : "bg-[#C8A15A]/50"
        )}
      />
    </div>
  );
}

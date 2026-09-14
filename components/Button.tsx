import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline-dark" | "link";
  size?: "sm" | "md" | "lg";
  href?: string;
  arrow?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans uppercase tracking-[0.16em] text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A15A] disabled:opacity-50 disabled:pointer-events-none group";

  const sizeStyles = {
    sm: "px-4 py-2 text-[11px]",
    md: "px-7 py-3.5 text-xs",
    lg: "px-9 py-4 text-xs",
  };

  const variantStyles = {
    primary:
      "bg-[#C8A15A] text-[#02281E] hover:bg-[#D9BD82] shadow-sm hover:shadow active:scale-[0.99]",
    secondary:
      "border border-[#C8A15A] text-[#F4EEE4] hover:bg-[#C8A15A]/15 active:scale-[0.99]",
    dark: "bg-[#063C2D] text-[#F4EEE4] hover:bg-[#0B5942] active:scale-[0.99]",
    "outline-dark":
      "border border-[#063C2D]/30 text-[#063C2D] hover:border-[#063C2D] hover:bg-[#063C2D]/5 active:scale-[0.99]",
    link: "px-0 py-1 text-[#C8A15A] hover:text-[#D9BD82] font-semibold tracking-[0.18em]",
  };

  const combinedClasses = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1 inline-block">
          →
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
}

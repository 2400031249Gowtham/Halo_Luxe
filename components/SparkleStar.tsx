import React from "react";

interface SparkleStarProps {
  className?: string;
  size?: number;
  color?: string;
}

export function SparkleStar({
  className = "",
  size = 18,
  color = "#C8A15A",
}: SparkleStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 transition-transform duration-500 hover:rotate-45 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 0C12 7 12 12 19 12C12 12 12 17 12 24C12 17 12 12 5 12C12 12 12 7 12 0Z"
        fill={color}
      />
    </svg>
  );
}

export function DoubleSparkle({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <SparkleStar size={16} />
      <SparkleStar
        size={10}
        className="-mt-2 -ml-1 opacity-75"
        color="#D9BD82"
      />
    </div>
  );
}

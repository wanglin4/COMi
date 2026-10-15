"use client";

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer shield/hexagon representing security and gated assets */}
      <path 
        d="M20 4L34 12V28L20 36L6 28V12L20 4Z" 
        stroke="#10b981" 
        strokeWidth="2" 
        fill="rgba(16, 185, 129, 0.05)"
      />
      {/* Inner geometric gate motif */}
      <path 
        d="M14 14H26M14 20H22M14 26H26" 
        stroke="#fafafa" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}

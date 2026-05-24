"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

interface ToolCardProps {
  href: string;
  name: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  accentGlow: string;
  badge?: "new" | "hot";
}

export function ToolCard({
  href,
  name,
  description,
  icon,
  gradient,
  accentGlow,
  badge,
}: ToolCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mouse-x", `${x}%`);
    ref.current.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      className="tool-card group relative flex flex-col gap-4 p-6"
      style={{ ["--accent-glow" as string]: accentGlow }}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute right-4 top-4">
          <span className={badge === "new" ? "badge-new" : "badge-hot"}>
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative">{icon}</div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold tracking-tight text-slate-100 transition-colors group-hover:text-white">
          {name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors group-hover:text-slate-200">
        <span>Open tool</span>
        <svg
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </div>
    </Link>
  );
}

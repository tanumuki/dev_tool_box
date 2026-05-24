"use client";

import Link from "next/link";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}

export default function ToolLayout({
  title,
  description,
  icon,
  children,
}: ToolLayoutProps) {
  return (
    <div className="gradient-bg grid-pattern min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/"
            className="transition-colors hover:text-slate-300"
          >
            DevToolBox
          </Link>
          <svg
            className="h-3.5 w-3.5 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          <span className="text-slate-300">{title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-2xl shadow-lg shadow-blue-500/20">
              <span>{icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700/50 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            All Tools
          </Link>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Tool content area */}
        <div className="animate-fade-in-up">{children}</div>
      </div>
    </div>
  );
}

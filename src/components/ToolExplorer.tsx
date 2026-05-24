"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "./ToolCard";
import {
  Braces,
  GitCompareArrows,
  Regex,
  Clock,
  Palette,
  QrCode,
  Image as ImageIcon,
  Pipette,
  Eye,
  Timer,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

type Category = "all" | "developer" | "design" | "file" | "utility";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All Tools" },
  { id: "developer", label: "Developer" },
  { id: "design", label: "Design" },
  { id: "file", label: "File & PDF" },
  { id: "utility", label: "Utility" },
];

const TOOLS = [
  {
    href: "/json-explorer",
    name: "JSON Explorer",
    description: "Visualize, search & compare JSON with an interactive tree view.",
    icon: <Braces className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-blue-500 to-cyan-400",
    accentGlow: "rgba(59, 130, 246, 0.25)",
    category: "developer" as Category,
    keywords: ["json", "format", "viewer", "tree", "api"],
    badge: "hot" as const,
  },
  {
    href: "/diff-checker",
    name: "Diff Checker",
    description: "Side-by-side and inline text comparison with character-level highlighting.",
    icon: <GitCompareArrows className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-emerald-500 to-teal-400",
    accentGlow: "rgba(16, 185, 129, 0.25)",
    category: "developer" as Category,
    keywords: ["diff", "compare", "text", "code"],
  },
  {
    href: "/regex-playground",
    name: "Regex Playground",
    description: "Test regex live with capture groups, explanations and code snippets.",
    icon: <Regex className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-violet-500 to-purple-400",
    accentGlow: "rgba(139, 92, 246, 0.25)",
    category: "developer" as Category,
    keywords: ["regex", "regular expression", "pattern", "match"],
  },
  {
    href: "/cron-visualizer",
    name: "Cron Visualizer",
    description: "Build and explain cron schedules with timeline and plain English.",
    icon: <Clock className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-amber-500 to-orange-400",
    accentGlow: "rgba(245, 158, 11, 0.25)",
    category: "developer" as Category,
    keywords: ["cron", "schedule", "crontab", "interval"],
  },
  {
    href: "/css-generators",
    name: "CSS Generators",
    description: "Box shadows, gradients, flexbox & glassmorphism — visual editors.",
    icon: <Palette className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-pink-500 to-rose-400",
    accentGlow: "rgba(236, 72, 153, 0.25)",
    category: "design" as Category,
    keywords: ["css", "shadow", "gradient", "flexbox", "design"],
  },
  {
    href: "/qr-generator",
    name: "QR Generator",
    description: "Generate QR codes instantly with custom colors. Download PNG or SVG.",
    icon: <QrCode className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-sky-500 to-blue-400",
    accentGlow: "rgba(14, 165, 233, 0.25)",
    category: "utility" as Category,
    keywords: ["qr", "code", "barcode", "generator"],
  },
  {
    href: "/image-compressor",
    name: "Image Compressor",
    description: "Compress & resize images in your browser. Nothing gets uploaded.",
    icon: <ImageIcon className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-lime-500 to-green-400",
    accentGlow: "rgba(132, 204, 22, 0.25)",
    category: "file" as Category,
    keywords: ["image", "compress", "resize", "jpg", "png", "webp"],
  },
  {
    href: "/color-palette",
    name: "Color Palette",
    description: "Generate palettes, convert formats, check WCAG contrast ratios.",
    icon: <Pipette className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-fuchsia-500 to-pink-400",
    accentGlow: "rgba(217, 70, 239, 0.25)",
    category: "design" as Category,
    keywords: ["color", "palette", "hex", "rgb", "hsl", "contrast"],
  },
  {
    href: "/og-preview",
    name: "OG Preview",
    description: "Preview how your site appears on Google, Twitter, Slack & Discord.",
    icon: <Eye className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-indigo-500 to-blue-400",
    accentGlow: "rgba(99, 102, 241, 0.25)",
    category: "design" as Category,
    keywords: ["og", "open graph", "meta", "social", "preview"],
  },
  {
    href: "/timestamp-converter",
    name: "Timestamp",
    description: "Convert Unix epochs, compare timezones, format dates instantly.",
    icon: <Timer className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-teal-500 to-cyan-400",
    accentGlow: "rgba(20, 184, 166, 0.25)",
    category: "utility" as Category,
    keywords: ["time", "timestamp", "epoch", "timezone", "date"],
  },
  {
    href: "/pdf-tools",
    name: "PDF Tools",
    description: "Merge, split, compress, rotate, watermark & convert PDFs. 100% private.",
    icon: <FileText className="h-5 w-5" strokeWidth={2.25} />,
    gradient: "from-red-500 to-orange-400",
    accentGlow: "rgba(239, 68, 68, 0.25)",
    category: "file" as Category,
    keywords: ["pdf", "merge", "split", "compress", "convert", "watermark"],
    badge: "new" as const,
  },
];

export function ToolExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q))
      );
    });
  }, [query, category]);

  return (
    <div className="relative">
      {/* Search + filters */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-xl border border-slate-800/80 bg-slate-900/40 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 backdrop-blur transition focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                category === cat.id
                  ? "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 px-6 py-16 text-center backdrop-blur">
          <Sparkles className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-4 text-sm text-slate-400">
            No tools match &quot;{query}&quot;. Try a different search.
          </p>
        </div>
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard
              key={tool.href}
              href={tool.href}
              name={tool.name}
              description={tool.description}
              icon={tool.icon}
              gradient={tool.gradient}
              accentGlow={tool.accentGlow}
              badge={tool.badge}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <p className="mt-8 text-center text-xs text-slate-500">
        Showing {filtered.length} of {TOOLS.length} tools
      </p>
    </div>
  );
}

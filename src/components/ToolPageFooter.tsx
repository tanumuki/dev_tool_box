"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
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
  KeyRound,
  Binary,
  Link as LinkIcon,
  BookOpen,
  Hash,
  ArrowRight,
} from "lucide-react";
import { TOOL_SEO_DATA } from "@/data/seo-data";
import type { ToolFAQ } from "@/data/seo-data";

/* ── Icon + gradient map ─────────────────────────────── */
const TOOL_VISUALS: Record<
  string,
  { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; gradient: string }
> = {
  "json-explorer": { icon: Braces, gradient: "from-blue-500 to-cyan-400" },
  "diff-checker": { icon: GitCompareArrows, gradient: "from-emerald-500 to-teal-400" },
  "regex-playground": { icon: Regex, gradient: "from-violet-500 to-purple-400" },
  "cron-visualizer": { icon: Clock, gradient: "from-amber-500 to-orange-400" },
  "css-generators": { icon: Palette, gradient: "from-pink-500 to-rose-400" },
  "qr-generator": { icon: QrCode, gradient: "from-sky-500 to-blue-400" },
  "image-compressor": { icon: ImageIcon, gradient: "from-lime-500 to-green-400" },
  "color-palette": { icon: Pipette, gradient: "from-fuchsia-500 to-pink-400" },
  "og-preview": { icon: Eye, gradient: "from-indigo-500 to-blue-400" },
  "timestamp-converter": { icon: Timer, gradient: "from-teal-500 to-cyan-400" },
  "pdf-tools": { icon: FileText, gradient: "from-red-500 to-orange-400" },
  "jwt-decoder": { icon: KeyRound, gradient: "from-orange-500 to-amber-400" },
  "base64-encoder": { icon: Binary, gradient: "from-cyan-500 to-blue-400" },
  "url-encoder": { icon: LinkIcon, gradient: "from-emerald-500 to-green-400" },
  "markdown-preview": { icon: BookOpen, gradient: "from-purple-500 to-violet-400" },
  "hash-generator": { icon: Hash, gradient: "from-rose-500 to-pink-400" },
};

/* ── FAQ Accordion Item ──────────────────────────────── */
function FAQItem({ faq, index }: { faq: ToolFAQ; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border-b border-slate-800/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-slate-100"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-slate-200">{faq.question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-slate-400">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export function ToolPageFooter({ toolId }: { toolId: string }) {
  const data = TOOL_SEO_DATA[toolId];
  if (!data) return null;

  const relatedTools = data.relatedTools
    .map((id) => {
      const t = TOOL_SEO_DATA[id];
      if (!t) return null;
      const vis = TOOL_VISUALS[id];
      return { ...t, ...vis };
    })
    .filter(Boolean) as (typeof data & { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; gradient: string })[];

  /* ── JSON-LD: WebApplication ── */
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: data.name,
    headline: data.headline,
    description: data.longDescription,
    url: `https://devtoolboxes.net${data.href}`,
    applicationCategory: data.applicationCategory,
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "DevToolBox",
      url: "https://devtoolboxes.net",
    },
    featureList: [
      "100% client-side processing",
      "Works offline",
      "No sign-up required",
      "No data uploads",
      "Free forever",
    ],
  };

  /* ── JSON-LD: FAQPage ── */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  /* ── JSON-LD: BreadcrumbList ── */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://devtoolboxes.net",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://devtoolboxes.net/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.name,
        item: `https://devtoolboxes.net${data.href}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* FAQ Section */}
      <section className="mx-auto mt-16 max-w-3xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-sm sm:p-8">
          <h2 className="mb-1 text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Common questions about {data.name}
          </p>
          <div>
            {data.faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-lg font-bold text-slate-200">
            You Might Also Like
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group rounded-2xl border border-slate-800/50 bg-slate-900/30 p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-700/50 hover:bg-slate-900/50"
                >
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-semibold text-slate-200 group-hover:text-white">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {tool.shortDescription.split(".")[0]}.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-400 group-hover:text-blue-300">
                    Try it
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

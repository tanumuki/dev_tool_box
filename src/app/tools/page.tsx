import Link from "next/link";
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
  KeyRound,
  Binary,
  Link as LinkIcon,
  BookOpen,
  Hash,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { TOOL_SEO_DATA, ALL_TOOL_IDS } from "@/data/seo-data";

/* ── Icon + gradient lookup (matches ToolExplorer & ToolPageFooter) ── */
const TOOL_ICONS: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    gradient: string;
  }
> = {
  "json-explorer": { icon: Braces, gradient: "from-blue-500 to-cyan-400" },
  "diff-checker": {
    icon: GitCompareArrows,
    gradient: "from-emerald-500 to-teal-400",
  },
  "regex-playground": { icon: Regex, gradient: "from-violet-500 to-purple-400" },
  "cron-visualizer": { icon: Clock, gradient: "from-amber-500 to-orange-400" },
  "css-generators": { icon: Palette, gradient: "from-pink-500 to-rose-400" },
  "qr-generator": { icon: QrCode, gradient: "from-sky-500 to-blue-400" },
  "image-compressor": {
    icon: ImageIcon,
    gradient: "from-lime-500 to-green-400",
  },
  "color-palette": { icon: Pipette, gradient: "from-fuchsia-500 to-pink-400" },
  "og-preview": { icon: Eye, gradient: "from-indigo-500 to-blue-400" },
  "timestamp-converter": {
    icon: Timer,
    gradient: "from-teal-500 to-cyan-400",
  },
  "pdf-tools": { icon: FileText, gradient: "from-red-500 to-orange-400" },
  "jwt-decoder": { icon: KeyRound, gradient: "from-orange-500 to-amber-400" },
  "base64-encoder": { icon: Binary, gradient: "from-cyan-500 to-blue-400" },
  "url-encoder": { icon: LinkIcon, gradient: "from-emerald-500 to-green-400" },
  "markdown-preview": {
    icon: BookOpen,
    gradient: "from-purple-500 to-violet-400",
  },
  "hash-generator": { icon: Hash, gradient: "from-rose-500 to-pink-400" },
};

/** Extract the first two sentences from a string. */
function firstTwoSentences(text: string): string {
  const match = text.match(/^(.*?\.)\s+(.*?\.)/);
  if (match) return `${match[1]} ${match[2]}`;
  // Fallback: return first sentence
  const first = text.match(/^(.*?\.)/);
  return first ? first[1] : text;
}

/* ── JSON-LD structured data ── */
function buildJsonLd() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All DevToolBox Developer Tools",
    description:
      "A collection of 16 free, privacy-first developer tools that run entirely in your browser.",
    numberOfItems: ALL_TOOL_IDS.length,
    itemListElement: ALL_TOOL_IDS.map((id, index) => {
      const tool = TOOL_SEO_DATA[id];
      return {
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `https://devtoolboxes.net${tool.href}`,
      };
    }),
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "All 16 Free Developer Tools",
    description:
      "Browse all 16 free developer tools: JSON formatter, diff checker, regex tester, JWT decoder, Base64 encoder, hash generator, PDF tools, and more. 100% client-side, no sign-up.",
    url: "https://devtoolboxes.net/tools",
    isPartOf: {
      "@type": "WebSite",
      name: "DevToolBox",
      url: "https://devtoolboxes.net",
    },
    breadcrumb: {
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
          name: "All Tools",
          item: "https://devtoolboxes.net/tools",
        },
      ],
    },
  };

  return { itemList, webPage };
}

export default function ToolsPage() {
  const { itemList, webPage } = buildJsonLd();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="mb-14 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
            <Wrench className="h-7 w-7" strokeWidth={2.25} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            All Tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            16 free, private developer tools that run entirely in your browser.
            No sign-up, no data uploads, no tracking. Pick a tool and get to
            work.
          </p>
        </header>

        {/* ── Intro text for SEO ── */}
        <section className="mb-12">
          <h2 className="sr-only">Developer Tool Collection</h2>
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-slate-500">
            Every tool below processes data 100% client-side using your
            browser&apos;s built-in APIs. Your JSON, code, images, and PDFs
            never leave your device. Bookmark this page for quick access to the
            full collection.
          </p>
        </section>

        {/* ── Tool grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_TOOL_IDS.map((id) => {
            const tool = TOOL_SEO_DATA[id];
            const visual = TOOL_ICONS[id];
            if (!tool || !visual) return null;

            const Icon = visual.icon;
            const snippet = firstTwoSentences(tool.longDescription);

            return (
              <Link
                key={id}
                href={tool.href}
                className="group rounded-2xl border border-slate-800/50 bg-slate-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-700/50 hover:bg-slate-900/50"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${visual.gradient} text-white shadow-lg`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>

                <h3 className="text-base font-semibold text-slate-200 group-hover:text-white">
                  {tool.name}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {snippet}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 group-hover:text-blue-300">
                  Use Tool
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── Bottom section ── */}
        <footer className="mt-16 text-center">
          <p className="mb-6 text-sm text-slate-500">
            All tools are free forever. Open source on GitHub.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800/50 bg-slate-900/40 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-700/50 hover:bg-slate-900/60 hover:text-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}

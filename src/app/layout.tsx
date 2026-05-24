import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Wrench } from "lucide-react";
import "./globals.css";
import { NavMenu } from "@/components/NavMenu";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://devtoolboxes.net"),
  title: {
    default: "DevToolBox — 16 Free Tools for Developers & Creators",
    template: "%s | DevToolBox",
  },
  description:
    "Fast, beautiful, client-side tools that work offline. JSON, regex, diff, cron, CSS, QR, PDF, JWT, Base64, hashing and more. No sign-up. No tracking. No uploads.",
  keywords: [
    "developer tools",
    "JSON formatter",
    "diff checker",
    "regex tester",
    "cron expression",
    "CSS generator",
    "QR code generator",
    "image compressor",
    "color palette",
    "OG preview",
    "timestamp converter",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf tools",
    "free tools",
    "offline tools",
    "client-side tools",
  ],
  openGraph: {
    title: "DevToolBox — 16 Free Tools for Developers & Creators",
    description:
      "Fast, private, client-side tools that work offline. JSON, regex, diff, cron, CSS, QR, PDF, JWT, Base64, hashing and more.",
    type: "website",
    siteName: "DevToolBox",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevToolBox — 16 Free Tools for Developers & Creators",
    description:
      "Fast, private, client-side tools that work offline. JSON, regex, diff, cron, CSS, QR, PDF, JWT, Base64, hashing and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://devtoolboxes.net",
  },
};

const NAV_TOOLS = [
  { href: "/json-explorer", label: "JSON" },
  { href: "/diff-checker", label: "Diff" },
  { href: "/regex-playground", label: "Regex" },
  { href: "/pdf-tools", label: "PDF" },
  { href: "/css-generators", label: "CSS" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect — shaves 100-300ms off first load for external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9790074481240768" crossOrigin="anonymous"></script>

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-P9LHJ259C1"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-P9LHJ259C1');` }} />

        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DevToolBox",
              url: "https://devtoolboxes.net",
              logo: "https://devtoolboxes.net/favicon.ico",
              description: "Free, fast, private developer tools that run 100% in your browser.",
              sameAs: ["https://github.com/tanumuki/dev_tool_box"],
            }),
          }}
        />

        {/* JSON-LD: WebSite with SearchAction (enables Google Sitelinks Searchbox) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DevToolBox",
              url: "https://devtoolboxes.net",
              description: "16 free, fast, private tools for developers and creators. 100% client-side.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://devtoolboxes.net/tools?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100">
        {/* Navigation */}
        <nav className="nav-glass sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="group flex items-center gap-2.5"
                aria-label="DevToolBox home"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:shadow-blue-500/40 group-hover:rotate-6">
                  <Wrench className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold tracking-tight glow-text">
                  DevToolBox
                </span>
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:flex md:items-center md:gap-1">
                {NAV_TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
                  >
                    {tool.label}
                  </Link>
                ))}
                <Link
                  href="/#tools"
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                >
                  All Tools →
                </Link>
                <div className="ml-3 h-5 w-px bg-slate-700/50" />
                <a
                  href="https://github.com/tanumuki/dev_tool_box"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                  aria-label="GitHub"
                >
                  <GithubIcon className="h-[18px] w-[18px]" />
                </a>
              </div>

              {/* Mobile menu */}
              <NavMenu />
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 bg-[#030712]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
              {/* Brand */}
              <div className="lg:col-span-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400">
                    <Wrench className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold tracking-tight glow-text">
                    DevToolBox
                  </span>
                </Link>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                  16 free, fast, private tools for developers and creators.
                  Everything runs in your browser. Nothing gets uploaded.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                    100% Client-Side
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-blue-500/20">
                    Zero Tracking
                  </span>
                </div>
              </div>

              {/* Tools */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Developer
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link
                      href="/json-explorer"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      JSON Explorer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/diff-checker"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Diff Checker
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/regex-playground"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Regex Playground
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cron-visualizer"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Cron Visualizer
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Files & Design
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link
                      href="/pdf-tools"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      PDF Tools
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/image-compressor"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Image Compressor
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/css-generators"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      CSS Generators
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/color-palette"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Color Palette
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  New Tools
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <Link
                      href="/jwt-decoder"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      JWT Decoder
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/base64-encoder"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Base64 Encoder
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/url-encoder"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      URL Encoder
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/markdown-preview"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Markdown Preview
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/hash-generator"
                      className="text-slate-500 transition-colors hover:text-slate-200"
                    >
                      Hash Generator
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3 border-t border-slate-800/50 pt-6 sm:flex-row sm:justify-between">
              <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} DevToolBox. Open source. Built for
                developers, by developers.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <a
                  href="https://github.com/tanumuki/dev_tool_box"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-slate-400"
                >
                  GitHub
                </a>
                <span>·</span>
                <Link
                  href="/#tools"
                  className="transition-colors hover:text-slate-400"
                >
                  All Tools
                </Link>
                <span>·</span>
                <Link
                  href="/about"
                  className="transition-colors hover:text-slate-400"
                >
                  About
                </Link>
                <span>·</span>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-slate-400"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

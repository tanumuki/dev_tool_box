import Link from "next/link";
import { ToolExplorer } from "@/components/ToolExplorer";
import {
  Zap,
  ShieldCheck,
  Heart,
  Sparkles,
  ArrowDown,
  Code2,
  Wifi,
  Lock,
} from "lucide-react";

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

const FEATURES = [
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "Everything runs in your browser. No network latency, no cold starts, no loading spinners.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: ShieldCheck,
    title: "Private by Default",
    description:
      "Your data never leaves your machine. No analytics, no cookies, no third-party scripts.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: Heart,
    title: "Always Free",
    description:
      "No sign-up walls, no premium tiers, no feature gates. Every tool is fully unlocked, forever.",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Smart Features",
    description:
      "Pattern libraries, live previews, shareable URLs, copy-to-clipboard, and bulk export.",
    gradient: "from-violet-400 to-purple-500",
  },
];

const STATS = [
  { value: "11", label: "Tools" },
  { value: "100%", label: "Free" },
  { value: "0", label: "Servers" },
  { value: "0", label: "Trackers" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ===== Hero Section ===== */}
      <section className="relative px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
        {/* Floating orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] animate-float"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-purple-500/8 blur-[120px] animate-float-delayed"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[100px]"
        />

        {/* Grid pattern, fading at edges */}
        <div
          aria-hidden
          className="grid-pattern-fade pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Status badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/40 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-slate-300">
              Open source
              <span className="mx-2 text-slate-600">·</span>
              Works offline
              <span className="mx-2 text-slate-600">·</span>
              Zero telemetry
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl lg:text-7xl">
            <span className="shimmer-text">DevToolBox</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-200 sm:text-xl">
            11 beautifully crafted tools for developers and creators.
          </p>

          <p className="mx-auto mt-3 max-w-xl text-base text-slate-400">
            Fast, private, client-side. No sign-up, no servers, no surveillance.
            Just tools that work.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="#tools"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Explore Tools</span>
              <ArrowDown className="relative h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </Link>
            <a
              href="https://github.com/YOUR_USERNAME/devtoolbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-white/5 px-7 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-[1.02]"
            >
              <GithubIcon className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5" />
              Works offline
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              100% client-side
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              Open source
            </span>
          </div>
        </div>
      </section>

      {/* ===== Stats Bar ===== */}
      <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="glass-card grid grid-cols-2 gap-4 rounded-2xl px-6 py-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight glow-text">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tool Explorer ===== */}
      <section id="tools" className="relative px-4 pb-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-block">
              <span className="rounded-full border border-slate-700/50 bg-slate-800/40 px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-400">
                The Toolbox
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="glow-text">Pick a tool.</span>{" "}
              <span className="text-slate-200">Get to work.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
              Every tool runs in your browser. Nothing gets uploaded. Nothing
              gets tracked.
            </p>
          </div>

          <ToolExplorer />
        </div>
      </section>

      {/* ===== Why DevToolBox ===== */}
      <section className="relative border-t border-slate-800/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-block">
              <span className="rounded-full border border-slate-700/50 bg-slate-800/40 px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-400">
                Why DevToolBox
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-slate-200">Built different.</span>{" "}
              <span className="glow-text">On purpose.</span>
            </h2>
            <p className="mt-4 text-base text-slate-400">
              Most dev tool sites are slow, ad-cluttered and upload your data.
              We built ours the opposite way.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Compare table ===== */}
      <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card overflow-hidden rounded-2xl">
            <div className="border-b border-slate-800/50 px-6 py-5">
              <h3 className="text-lg font-semibold text-slate-100">
                DevToolBox vs. the rest
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Why we're different from the alternatives.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/50 text-left">
                    <th className="px-6 py-4 font-medium text-slate-400"></th>
                    <th className="px-6 py-4 font-semibold text-slate-100">
                      DevToolBox
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500">
                      Others
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[
                    ["Sign-up required", "Never", "Usually yes"],
                    ["Files uploaded to server", "Never", "Yes, often"],
                    ["Works offline", "Yes", "No"],
                    ["Ads / popups", "Minimal", "Everywhere"],
                    ["Free tier limits", "None", "1-2/day"],
                    ["Tracks you", "No", "Yes"],
                  ].map(([feature, ours, theirs]) => (
                    <tr key={feature}>
                      <td className="px-6 py-3.5 text-slate-300">{feature}</td>
                      <td className="px-6 py-3.5 font-medium text-emerald-400">
                        {ours}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{theirs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Bottom CTA ===== */}
      <section className="relative px-4 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="glass-card relative overflow-hidden rounded-3xl px-8 py-14 text-center">
            {/* Decorative gradient blob */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-1/2 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"
            />
            <div className="relative">
              <Sparkles className="mx-auto mb-4 h-7 w-7 text-blue-400" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to <span className="glow-text">build something</span>?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-slate-400">
                Pick a tool and start building. No account needed, ever.
              </p>
              <Link
                href="#tools"
                className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Browse All Tools</span>
                <ArrowDown className="relative h-4 w-4 -rotate-90 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

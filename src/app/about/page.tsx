import Link from "next/link";
import {
  Wrench,
  Globe,
  ShieldCheck,
  Zap,
  Heart,
  Code2,
  ArrowRight,
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

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Every tool runs 100% in your browser. Your files, your JSON, your regex patterns — none of it ever touches a server. We literally cannot see your data.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: Zap,
    title: "Speed Over Everything",
    description:
      "No network round-trips, no cold starts, no loading spinners. Client-side processing means instant results, even on slow connections. Works offline too.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Heart,
    title: "Free Forever",
    description:
      "No premium tiers, no feature gates, no sign-up walls. Every tool is fully unlocked. We keep the lights on through ads, not subscriptions.",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Code2,
    title: "Open Source",
    description:
      "The entire codebase is public on GitHub. You can audit the code, suggest features, fix bugs, or fork it and build your own. Transparency is non-negotiable.",
    gradient: "from-violet-400 to-purple-500",
  },
];

const TOOLS_COUNT = 11;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 shadow-lg shadow-blue-500/20">
            <Wrench className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            About <span className="glow-text">DevToolBox</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            {TOOLS_COUNT} free, fast, private tools for developers and creators.
            Built because the alternatives are slow, ad-cluttered, and upload
            your data to their servers.
          </p>
        </div>

        {/* The Why */}
        <section className="mb-16">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-100">
              Why We Built This
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-slate-300">
              <p>
                Every developer uses online tools daily — formatting JSON,
                testing regex, comparing diffs, converting timestamps. But most
                tool sites are painful: they&apos;re slow, covered in pop-ups,
                and quietly upload your data to their servers.
              </p>
              <p>
                We thought: what if there was a tool site that respected
                developers? One that&apos;s fast because everything runs in your
                browser. Private because nothing ever leaves your machine. And
                free because you shouldn&apos;t need a subscription to format
                JSON.
              </p>
              <p>
                So we built DevToolBox. {TOOLS_COUNT} tools, zero servers, zero
                tracking. Just open a tool and use it. Works offline. Works on
                any device. No account needed, ever.
              </p>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-100">
            Our Principles
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {PRINCIPLES.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-100">
              How It&apos;s Built
            </h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: "Framework", value: "Next.js (Static Export)" },
                { label: "Language", value: "TypeScript" },
                { label: "Styling", value: "Tailwind CSS" },
                { label: "Hosting", value: "Vercel (Global CDN)" },
                { label: "PDF Engine", value: "pdf-lib (client-side)" },
                { label: "Icons", value: "Lucide React" },
                { label: "Backend Servers", value: "None. Zero. Nada." },
                { label: "Tracking", value: "Anonymous analytics only" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3"
                >
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-medium text-slate-200">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="glass-card rounded-3xl px-8 py-12">
            <Globe className="mx-auto mb-4 h-7 w-7 text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-100">
              Want to Contribute?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
              DevToolBox is open source. Found a bug? Want a new tool? PRs and
              issues are welcome.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="https://github.com/YOUR_USERNAME/devtoolbox"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-[1.02]"
              >
                <GithubIcon className="h-4 w-4" />
                View on GitHub
              </a>
              <Link
                href="/#tools"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                Explore Tools
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

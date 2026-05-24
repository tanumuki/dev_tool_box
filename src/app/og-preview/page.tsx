"use client";

import { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OgData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  twitterCard: "summary" | "summary_large_image";
}

const EXAMPLE: OgData = {
  title: "DevToolBox — Free Developer Utilities That Run in Your Browser",
  description:
    "A collection of essential developer tools: JSON explorer, diff checker, regex playground, QR generator, cron visualizer, and more. No sign-up required.",
  image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop",
  url: "https://devtoolbox.app",
  siteName: "DevToolBox",
  twitterCard: "summary_large_image",
};

const EMPTY: OgData = {
  title: "",
  description: "",
  image: "",
  url: "",
  siteName: "",
  twitterCard: "summary_large_image",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url || "example.com";
  }
}

function charCountColor(len: number, warn: number): string {
  if (len === 0) return "text-slate-500";
  if (len <= warn) return "text-emerald-400";
  return "text-amber-400";
}

/* ------------------------------------------------------------------ */
/*  Sub-components: Input form                                         */
/* ------------------------------------------------------------------ */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  maxHint,
  warnAt,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxHint?: number;
  warnAt?: number;
  multiline?: boolean;
}) {
  const len = value.length;
  const common =
    "w-full rounded-lg bg-slate-900/80 border border-slate-700/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-400">{label}</label>
        {maxHint !== undefined && (
          <span className={`text-xs tabular-nums ${charCountColor(len, warnAt ?? maxHint)}`}>
            {len}/{maxHint}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          rows={3}
          className={common + " resize-none"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className={common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {warnAt !== undefined && len > warnAt && (
        <p className="text-xs text-amber-400">
          Exceeds recommended {warnAt} characters -- may be truncated on some platforms.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview: Google                                                    */
/* ------------------------------------------------------------------ */

function GooglePreview({ data }: { data: OgData }) {
  const title = data.title || "Page Title";
  const desc = data.description || "No description provided.";
  const domain = domainFromUrl(data.url);

  return (
    <div className="space-y-1 font-sans max-w-[600px]">
      <p className="text-sm text-[#bdc1c6] leading-tight truncate">{domain}</p>
      <h3 className="text-[#8ab4f8] text-xl leading-snug cursor-pointer hover:underline">
        {truncate(title, 60)}
      </h3>
      <p className="text-sm text-[#9aa0a6] leading-relaxed line-clamp-2">
        {truncate(desc, 160)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview: Twitter                                                   */
/* ------------------------------------------------------------------ */

function TwitterPreview({ data }: { data: OgData }) {
  const title = data.title || "Page Title";
  const desc = data.description || "No description provided.";
  const domain = domainFromUrl(data.url);
  const isLarge = data.twitterCard === "summary_large_image";

  if (isLarge) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#2f3336] bg-[#16181c] max-w-[506px]">
        {data.image ? (
          <div className="w-full aspect-[2/1] bg-[#1e2024] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-full aspect-[2/1] bg-[#1e2024] flex items-center justify-center text-slate-600 text-sm">
            No image
          </div>
        )}
        <div className="px-3 py-2.5 space-y-0.5">
          <p className="text-[#71767b] text-xs">{domain}</p>
          <p className="text-[#e7e9ea] text-sm font-normal leading-tight truncate">{truncate(title, 70)}</p>
          <p className="text-[#71767b] text-sm leading-snug line-clamp-2">{truncate(desc, 200)}</p>
        </div>
      </div>
    );
  }

  /* summary (small card) */
  return (
    <div className="flex overflow-hidden rounded-2xl border border-[#2f3336] bg-[#16181c] max-w-[506px] h-[125px]">
      {data.image ? (
        <div className="w-[125px] min-w-[125px] h-full bg-[#1e2024] border-r border-[#2f3336] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="w-[125px] min-w-[125px] h-full bg-[#1e2024] border-r border-[#2f3336] flex items-center justify-center text-slate-600 text-xs">
          No img
        </div>
      )}
      <div className="flex flex-col justify-center px-3 py-2 overflow-hidden">
        <p className="text-[#71767b] text-xs">{domain}</p>
        <p className="text-[#e7e9ea] text-sm font-normal leading-tight truncate">{truncate(title, 70)}</p>
        <p className="text-[#71767b] text-xs leading-snug line-clamp-2 mt-0.5">{truncate(desc, 200)}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview: Facebook / LinkedIn                                       */
/* ------------------------------------------------------------------ */

function FacebookPreview({ data }: { data: OgData }) {
  const title = data.title || "Page Title";
  const desc = data.description || "No description provided.";
  const domain = domainFromUrl(data.url).toUpperCase();

  return (
    <div className="overflow-hidden border border-[#3a3b3c] bg-[#242526] max-w-[500px]">
      {data.image ? (
        <div className="w-full aspect-[1.91/1] bg-[#3a3b3c] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="w-full aspect-[1.91/1] bg-[#3a3b3c] flex items-center justify-center text-slate-500 text-sm">
          No image
        </div>
      )}
      <div className="px-3 py-2.5 space-y-1 border-t border-[#3a3b3c]">
        <p className="text-[#b0b3b8] text-xs tracking-wide">{domain}</p>
        <p className="text-[#e4e6eb] text-base font-semibold leading-tight line-clamp-2">
          {truncate(title, 100)}
        </p>
        <p className="text-[#b0b3b8] text-sm leading-snug line-clamp-2">
          {truncate(desc, 150)}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview: Slack                                                     */
/* ------------------------------------------------------------------ */

function SlackPreview({ data }: { data: OgData }) {
  const title = data.title || "Page Title";
  const desc = data.description || "No description provided.";
  const siteName = data.siteName || domainFromUrl(data.url);

  return (
    <div className="flex max-w-[560px]">
      {/* colored left bar */}
      <div className="w-1 min-w-[4px] rounded-full bg-[#1264a3] mr-3 shrink-0" />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-[#e8e8e8] text-sm font-bold">{siteName}</p>
        <p className="text-[#1d9bd1] text-sm font-bold hover:underline cursor-pointer truncate">
          {truncate(title, 100)}
        </p>
        <p className="text-[#ababad] text-sm leading-snug line-clamp-3">
          {truncate(desc, 300)}
        </p>
        {data.image && (
          <div className="mt-1.5 w-[360px] max-w-full rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.image}
              alt=""
              className="w-full h-auto max-h-[200px] object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview: Discord                                                   */
/* ------------------------------------------------------------------ */

function DiscordPreview({ data }: { data: OgData }) {
  const title = data.title || "Page Title";
  const desc = data.description || "No description provided.";
  const siteName = data.siteName || domainFromUrl(data.url);

  return (
    <div className="flex max-w-[520px] bg-[#2f3136] rounded overflow-hidden">
      {/* colored left bar */}
      <div className="w-1 min-w-[4px] bg-[#1e90ff] shrink-0" />
      <div className="flex-1 min-w-0 p-3 space-y-1.5">
        <p className="text-xs font-semibold text-[#b9bbbe]">{siteName}</p>
        <p className="text-[#00aff4] text-sm font-semibold hover:underline cursor-pointer leading-tight">
          {truncate(title, 100)}
        </p>
        <p className="text-[#dcddde] text-sm leading-snug line-clamp-3">
          {truncate(desc, 350)}
        </p>
        {data.image && (
          <div className="mt-1 max-w-[400px] rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.image}
              alt=""
              className="w-full h-auto max-h-[220px] object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Meta Tag Generator                                                 */
/* ------------------------------------------------------------------ */

function generateMetaTags(data: OgData): string {
  const lines: string[] = [];

  if (data.title) {
    lines.push(`<meta property="og:title" content="${escAttr(data.title)}" />`);
  }
  if (data.description) {
    lines.push(`<meta property="og:description" content="${escAttr(data.description)}" />`);
  }
  if (data.image) {
    lines.push(`<meta property="og:image" content="${escAttr(data.image)}" />`);
  }
  if (data.url) {
    lines.push(`<meta property="og:url" content="${escAttr(data.url)}" />`);
  }
  if (data.siteName) {
    lines.push(`<meta property="og:site_name" content="${escAttr(data.siteName)}" />`);
  }
  lines.push(`<meta property="og:type" content="website" />`);
  lines.push("");
  lines.push(`<meta name="twitter:card" content="${data.twitterCard}" />`);
  if (data.title) {
    lines.push(`<meta name="twitter:title" content="${escAttr(data.title)}" />`);
  }
  if (data.description) {
    lines.push(`<meta name="twitter:description" content="${escAttr(data.description)}" />`);
  }
  if (data.image) {
    lines.push(`<meta name="twitter:image" content="${escAttr(data.image)}" />`);
  }

  return lines.join("\n");
}

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Simple syntax-highlighting for HTML meta tags */
function HighlightedHtml({ code }: { code: string }) {
  const highlighted = code.split("\n").map((line, i) => {
    if (line.trim() === "") return <br key={i} />;

    /* Colorize: tag name, attribute names, attribute values, self-close */
    const colored = line
      .replace(/(&lt;\/?)(meta)/g, '<span class="text-red-400">$1$2</span>')
      .replace(/(property|name|content)=/g, '<span class="text-yellow-300">$1</span>=')
      .replace(/&quot;([^&]*)&quot;/g, '<span class="text-emerald-300">&quot;$1&quot;</span>')
      .replace(/(\/&gt;)/g, '<span class="text-red-400">$1</span>');

    return (
      <div key={i} dangerouslySetInnerHTML={{ __html: colored }} />
    );
  });

  return <>{highlighted}</>;
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition"
    >
      {copied ? (
        <>
          <CheckIcon /> Copied!
        </>
      ) : (
        <>
          <ClipboardIcon /> Copy HTML
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny SVG icons                                                     */
/* ------------------------------------------------------------------ */

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813L20 12l-6.088 3.187L12 21l-1.912-5.813L4 12l6.088-3.187z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform label component                                           */
/* ------------------------------------------------------------------ */

function PlatformLabel({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-slate-400">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-300 tracking-wide uppercase">{name}</h3>
    </div>
  );
}

/* Platform icon SVGs */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function OgPreviewPage() {
  const [data, setData] = useState<OgData>(EMPTY);

  const update = useCallback(
    <K extends keyof OgData>(key: K, value: OgData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const metaTags = generateMetaTags(data);
  // For the highlighted display, escape the HTML first so we can colorize it
  // Escape HTML entities to prevent XSS via dangerouslySetInnerHTML
  const escapedMeta = metaTags
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeftIcon />
            <span>DevToolBox</span>
          </a>
          <div className="h-4 w-px bg-slate-700" />
          <h1 className="text-lg font-semibold text-slate-100">OG Preview</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold glow-text">
            Open Graph Preview
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            See exactly how your page will look when shared on Google, Twitter/X,
            Facebook, LinkedIn, Slack, and Discord.
          </p>
        </div>

        {/* Input Form */}
        <section className="glass-card p-5 sm:p-6 space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Meta Tag Inputs
            </h2>
            <button
              onClick={() => setData(EXAMPLE)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30 transition"
            >
              <SparklesIcon />
              Load Example
            </button>
          </div>

          <InputField
            label="og:title"
            value={data.title}
            onChange={(v) => update("title", v)}
            placeholder="Your page title"
            maxHint={90}
            warnAt={60}
          />
          <InputField
            label="og:description"
            value={data.description}
            onChange={(v) => update("description", v)}
            placeholder="A brief description of your page content"
            maxHint={300}
            warnAt={160}
            multiline
          />
          <InputField
            label="og:image"
            value={data.image}
            onChange={(v) => update("image", v)}
            placeholder="https://example.com/og-image.png"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="og:url"
              value={data.url}
              onChange={(v) => update("url", v)}
              placeholder="https://example.com"
            />
            <InputField
              label="og:site_name"
              value={data.siteName}
              onChange={(v) => update("siteName", v)}
              placeholder="My Website"
            />
          </div>

          {/* twitter:card select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">twitter:card</label>
            <select
              value={data.twitterCard}
              onChange={(e) =>
                update("twitterCard", e.target.value as OgData["twitterCard"])
              }
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/60 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
            >
              <option value="summary_large_image">summary_large_image</option>
              <option value="summary">summary</option>
            </select>
          </div>

          {/* quick hints */}
          <div className="text-xs text-slate-500 space-y-0.5 pt-1">
            <p>Recommended image size: 1200 x 630 px (1.91:1 ratio)</p>
            <p>Title: keep under 60 chars for Google; under 70 for Twitter/X</p>
            <p>Description: keep under 160 chars for Google; under 200 for social</p>
          </div>
        </section>

        {/* Preview Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google */}
          <div className="glass-card p-5">
            <PlatformLabel name="Google Search" icon={<GoogleIcon />} />
            <div className="bg-[#202124] rounded-lg p-4">
              <GooglePreview data={data} />
            </div>
          </div>

          {/* Twitter / X */}
          <div className="glass-card p-5">
            <PlatformLabel name="Twitter / X" icon={<TwitterIcon />} />
            <div className="bg-[#000000] rounded-lg p-4">
              <TwitterPreview data={data} />
            </div>
          </div>

          {/* Facebook / LinkedIn */}
          <div className="glass-card p-5">
            <PlatformLabel name="Facebook / LinkedIn" icon={<FacebookIcon />} />
            <div className="bg-[#18191a] rounded-lg p-4">
              <FacebookPreview data={data} />
            </div>
          </div>

          {/* Slack */}
          <div className="glass-card p-5">
            <PlatformLabel name="Slack" icon={<SlackIcon />} />
            <div className="bg-[#1a1d21] rounded-lg p-4">
              <SlackPreview data={data} />
            </div>
          </div>

          {/* Discord */}
          <div className="glass-card p-5 lg:col-span-2">
            <PlatformLabel name="Discord" icon={<DiscordIcon />} />
            <div className="bg-[#36393f] rounded-lg p-4 max-w-[560px]">
              <DiscordPreview data={data} />
            </div>
          </div>
        </section>

        {/* Meta Tag Output */}
        <section className="glass-card p-5 sm:p-6 space-y-3 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Generated Meta Tags
            </h2>
            <CopyButton text={metaTags} />
          </div>
          <div className="bg-slate-950/70 rounded-lg border border-slate-800/50 p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-300">
            <HighlightedHtml code={escapedMeta} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-600">
          Built with Next.js, Tailwind CSS, and zero external dependencies. Everything runs in your browser.
        </div>
      </footer>
    </div>
  );
}

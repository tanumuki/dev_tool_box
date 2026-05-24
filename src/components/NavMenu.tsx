"use client";

import { useEffect, useState } from "react";
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
  Menu,
  X,
  KeyRound,
  Binary,
  Link as LinkIcon,
  BookOpen,
  Hash,
} from "lucide-react";

const tools = [
  { href: "/json-explorer", label: "JSON Explorer", Icon: Braces, color: "text-blue-400" },
  { href: "/diff-checker", label: "Diff Checker", Icon: GitCompareArrows, color: "text-emerald-400" },
  { href: "/regex-playground", label: "Regex Playground", Icon: Regex, color: "text-violet-400" },
  { href: "/cron-visualizer", label: "Cron Visualizer", Icon: Clock, color: "text-amber-400" },
  { href: "/css-generators", label: "CSS Generators", Icon: Palette, color: "text-pink-400" },
  { href: "/qr-generator", label: "QR Generator", Icon: QrCode, color: "text-sky-400" },
  { href: "/image-compressor", label: "Image Compressor", Icon: ImageIcon, color: "text-lime-400" },
  { href: "/color-palette", label: "Color Palette", Icon: Pipette, color: "text-fuchsia-400" },
  { href: "/og-preview", label: "OG Preview", Icon: Eye, color: "text-indigo-400" },
  { href: "/timestamp-converter", label: "Timestamp", Icon: Timer, color: "text-teal-400" },
  { href: "/pdf-tools", label: "PDF Tools", Icon: FileText, color: "text-red-400" },
  { href: "/jwt-decoder", label: "JWT Decoder", Icon: KeyRound, color: "text-orange-400" },
  { href: "/base64-encoder", label: "Base64 Encoder", Icon: Binary, color: "text-cyan-400" },
  { href: "/url-encoder", label: "URL Encoder", Icon: LinkIcon, color: "text-emerald-400" },
  { href: "/markdown-preview", label: "Markdown Preview", Icon: BookOpen, color: "text-purple-400" },
  { href: "/hash-generator", label: "Hash Generator", Icon: Hash, color: "text-rose-400" },
];

export function NavMenu() {
  const [open, setOpen] = useState(false);

  // Lock scroll when menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div className="fixed inset-x-0 top-16 z-50 mx-4 mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-slate-800/50 bg-[#0f172a]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <p className="mb-3 px-2 text-xs font-medium uppercase tracking-widest text-slate-500">
              All Tools
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {tools.map(({ href, label, Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Icon className={`h-4 w-4 ${color}`} strokeWidth={2.25} />
                  </span>
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

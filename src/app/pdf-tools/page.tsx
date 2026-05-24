"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type DragEvent,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { ToolPageFooter } from "@/components/ToolPageFooter";

// ─── PDF.js lazy loader ─────────────────────────────────────────────────────

type PdfjsLib = typeof import("pdfjs-dist");
let _pdfjs: PdfjsLib | null = null;

async function getPdfjs(): Promise<PdfjsLib> {
  if (!_pdfjs) {
    _pdfjs = await import("pdfjs-dist");
    _pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${_pdfjs.version}/pdf.worker.min.mjs`;
  }
  return _pdfjs;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface PdfFileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnail: string | null;
}

interface ImageFileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width: number;
  height: number;
}

interface PageEntry {
  index: number;
  thumbnail: string;
  rotation: number;
}

type TabId =
  | "merge"
  | "split"
  | "compress"
  | "rotate"
  | "reorder"
  | "pagenumbers"
  | "watermark"
  | "pdf2img"
  | "img2pdf"
  | "extract";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function downloadBlob(data: Uint8Array | Blob, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function renderPageThumbnail(
  fileBytes: ArrayBuffer,
  pageNum: number,
  scale = 0.4
): Promise<string> {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fileBytes) }).promise;
  const page = await doc.getPage(pageNum);
  const vp = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = vp.width;
  canvas.height = vp.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
  const url = canvas.toDataURL("image/png");
  doc.destroy();
  return url;
}

function parsePageRange(input: string, max: number): number[] {
  const pages: Set<number> = new Set();
  const parts = input.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = Math.max(1, a); i <= Math.min(max, b); i++) pages.add(i);
      }
    } else {
      const n = Number(part);
      if (!isNaN(n) && n >= 1 && n <= max) pages.add(n);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

// ─── Tab definitions ────────────────────────────────────────────────────────

const TABS: Tab[] = [
  {
    id: "merge",
    label: "Merge",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    id: "split",
    label: "Split",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    id: "compress",
    label: "Compress",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
      </svg>
    ),
  },
  {
    id: "rotate",
    label: "Rotate",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
  {
    id: "reorder",
    label: "Reorder",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
  },
  {
    id: "pagenumbers",
    label: "Page Numbers",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
      </svg>
    ),
  },
  {
    id: "watermark",
    label: "Watermark",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    id: "pdf2img",
    label: "PDF → Images",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
  },
  {
    id: "img2pdf",
    label: "Images → PDF",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "extract",
    label: "Extract Text",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
];

// ─── Main page ──────────────────────────────────────────────────────────────

export default function PdfToolsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("merge");

  return (
    <div className="gradient-bg grid-pattern min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition-colors hover:text-slate-300">
            DevToolBox
          </Link>
          <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-slate-300">PDF Tools</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-orange-400 to-amber-400 text-2xl shadow-lg shadow-red-500/20">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
                PDF Tools
              </h1>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                Merge, split, compress, rotate, convert &mdash; all in your browser.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700/50 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All Tools
          </Link>
        </div>

        {/* Privacy banner */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3.5 backdrop-blur-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-300">
              Your files never leave your browser.
            </p>
            <p className="text-xs text-emerald-400/70">
              Everything runs locally. Zero uploads. Zero servers. 100% private.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

        {/* Tab navigation */}
        <div className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max rounded-2xl bg-slate-900/60 p-1.5 border border-slate-800/50 backdrop-blur-xl">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="animate-fade-in-up">
          {activeTab === "merge" && <MergeTab />}
          {activeTab === "split" && <SplitTab />}
          {activeTab === "compress" && <CompressTab />}
          {activeTab === "rotate" && <RotateTab />}
          {activeTab === "reorder" && <ReorderTab />}
          {activeTab === "pagenumbers" && <PageNumbersTab />}
          {activeTab === "watermark" && <WatermarkTab />}
          {activeTab === "pdf2img" && <PdfToImagesTab />}
          {activeTab === "img2pdf" && <ImagesToPdfTab />}
          {activeTab === "extract" && <ExtractTextTab />}
        </div>
      </div>
      <ToolPageFooter toolId="pdf-tools" />
    </div>
  );
}

// ─── Shared: FileDropZone ───────────────────────────────────────────────────

function FileDropZone({
  accept,
  multiple,
  onFiles,
  label,
  sublabel,
}: {
  accept: string;
  multiple: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(multiple ? files : [files[0]]);
    },
    [onFiles, multiple]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onFiles(files);
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all ${
        dragOver
          ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
          : "border-slate-600 hover:border-blue-500/50 hover:bg-slate-800/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 ring-1 ring-slate-700/50">
        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-slate-200">
          {label || "Drop files here or click to browse"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {sublabel || "PDF files up to 100MB"}
        </p>
      </div>
    </div>
  );
}

// ─── Shared: progress / status ──────────────────────────────────────────────

function ProgressBar({ progress, label }: { progress: number; label?: string }) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-slate-400">{label}</p>}
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}

function StatusMessage({ message, type = "info" }: { message: string; type?: "info" | "error" | "success" }) {
  const colors = {
    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    error: "text-red-400 bg-red-500/10 border-red-500/20",
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${colors[type]}`}>
      {message}
    </div>
  );
}

// ─── Shared: file list item ─────────────────────────────────────────────────

function FileItem({
  name,
  size,
  thumbnail,
  onRemove,
  onMoveUp,
  onMoveDown,
  extra,
}: {
  name: string;
  size: number;
  thumbnail?: string | null;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 ring-1 ring-slate-700/30">
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="h-12 w-9 rounded-md object-cover ring-1 ring-slate-600/50 bg-slate-900"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{name}</p>
        <p className="text-xs text-slate-500">{fmtSize(size)}</p>
      </div>
      {extra}
      {onMoveUp && (
        <button
          onClick={onMoveUp}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          title="Move up"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
      {onMoveDown && (
        <button
          onClick={onMoveDown}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          title="Move down"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}
      <button
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
        title="Remove"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Shared: action button ──────────────────────────────────────────────────

function ActionButton({
  onClick,
  disabled,
  loading,
  children,
  variant = "primary",
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 disabled:bg-blue-600/50"
      : "bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:bg-slate-700/50";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${base}`}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Shared: section card ───────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1: MERGE
// ═══════════════════════════════════════════════════════════════════════════

function MergeTab() {
  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const addFiles = useCallback(async (incoming: File[]) => {
    setError("");
    const pdfs = incoming.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) {
      setError("Please select PDF files.");
      return;
    }
    const entries: PdfFileEntry[] = [];
    for (const file of pdfs) {
      try {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const thumb = await renderPageThumbnail(bytes, 1).catch(() => null);
        entries.push({
          id: uid(),
          file,
          name: file.name,
          size: file.size,
          pageCount: doc.getPageCount(),
          thumbnail: thumb,
        });
      } catch {
        setError(`Could not load "${file.name}". It may be corrupted or encrypted.`);
      }
    }
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const merge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setError("");
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setProgress(`Processing file ${i + 1} of ${files.length}...`);
        const bytes = await files[i].file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setProgress("Saving merged PDF...");
      const result = await merged.save();
      downloadBlob(result, "merged.pdf");
      setProgress("");
    } catch (e) {
      setError(`Merge failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Merge PDFs</h2>
      <p className="text-sm text-slate-400 mb-6">
        Combine multiple PDF files into one. Drag files to reorder before merging.
      </p>

      {files.length === 0 ? (
        <FileDropZone
          accept=".pdf,application/pdf"
          multiple
          onFiles={addFiles}
          label="Drop PDF files here to merge"
          sublabel="Select 2 or more PDFs"
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map((f, i) => (
              <FileItem
                key={f.id}
                name={f.name}
                size={f.size}
                thumbnail={f.thumbnail}
                onRemove={() => removeFile(f.id)}
                onMoveUp={i > 0 ? () => moveFile(i, -1) : undefined}
                onMoveDown={i < files.length - 1 ? () => moveFile(i, 1) : undefined}
                extra={
                  <span className="text-xs text-slate-500 tabular-nums">
                    {f.pageCount} pg{f.pageCount !== 1 ? "s" : ""}
                  </span>
                }
              />
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ActionButton onClick={() => document.getElementById("merge-more")?.click()}>
              Add More
            </ActionButton>
            <input
              id="merge-more"
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const f = Array.from(e.target.files || []);
                if (f.length) addFiles(f);
                e.target.value = "";
              }}
            />
            <ActionButton onClick={merge} disabled={files.length < 2} loading={processing}>
              Merge {files.length} PDFs
            </ActionButton>
            <button
              onClick={() => {
                setFiles([]);
                setError("");
                setProgress("");
              }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear All
            </button>
          </div>

          {processing && progress && <ProgressBar progress={-1} label={progress} />}
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2: SPLIT
// ═══════════════════════════════════════════════════════════════════════════

function SplitTab() {
  const [file, setFile] = useState<PdfFileEntry | null>(null);
  const [mode, setMode] = useState<"extract" | "every" | "each">("extract");
  const [pageRange, setPageRange] = useState("");
  const [everyN, setEveryN] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    const f = files[0];
    if (!f) return;
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const thumb = await renderPageThumbnail(bytes, 1).catch(() => null);
      setFile({
        id: uid(),
        file: f,
        name: f.name,
        size: f.size,
        pageCount: doc.getPageCount(),
        thumbnail: thumb,
      });
    } catch {
      setError("Could not load this PDF. It may be corrupted or encrypted.");
    }
  }, []);

  const split = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const bytes = await file.file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const totalPages = src.getPageCount();

      if (mode === "extract") {
        const pages = parsePageRange(pageRange, totalPages);
        if (pages.length === 0) {
          setError("No valid pages specified. Use format like: 1,3,5-8");
          setProcessing(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const copied = await newPdf.copyPages(
          src,
          pages.map((p) => p - 1)
        );
        copied.forEach((p) => newPdf.addPage(p));
        const result = await newPdf.save();
        downloadBlob(result, `${file.name.replace(".pdf", "")}_pages.pdf`);
      } else if (mode === "every") {
        const n = Math.max(1, everyN);
        for (let i = 0; i < totalPages; i += n) {
          const newPdf = await PDFDocument.create();
          const end = Math.min(i + n, totalPages);
          const indices = Array.from({ length: end - i }, (_, k) => i + k);
          const copied = await newPdf.copyPages(src, indices);
          copied.forEach((p) => newPdf.addPage(p));
          const result = await newPdf.save();
          downloadBlob(result, `${file.name.replace(".pdf", "")}_part${Math.floor(i / n) + 1}.pdf`);
        }
      } else {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copied] = await newPdf.copyPages(src, [i]);
          newPdf.addPage(copied);
          const result = await newPdf.save();
          downloadBlob(result, `${file.name.replace(".pdf", "")}_page${i + 1}.pdf`);
        }
      }
    } catch (e) {
      setError(`Split failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Split PDF</h2>
      <p className="text-sm text-slate-400 mb-6">
        Extract pages or split a PDF into multiple files.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to split" sublabel="Single PDF file" />
      ) : (
        <div className="space-y-6">
          <FileItem name={file.name} size={file.size} thumbnail={file.thumbnail} onRemove={() => setFile(null)}
            extra={<span className="text-xs text-slate-500">{file.pageCount} pages</span>} />

          {/* Mode selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Split mode</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {([
                ["extract", "Extract specific pages", "e.g. 1,3,5-8"],
                ["every", "Split every N pages", "Chunks of N pages"],
                ["each", "Each page as separate PDF", "One file per page"],
              ] as const).map(([id, title, desc]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    mode === id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-200">{title}</p>
                  <p className="text-xs text-slate-500 mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {mode === "extract" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Page range</label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1,3,5-8"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          )}

          {mode === "every" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pages per chunk</label>
              <input
                type="number"
                min={1}
                max={file.pageCount}
                value={everyN}
                onChange={(e) => setEveryN(Number(e.target.value))}
                className="w-40 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <ActionButton onClick={split} loading={processing}>
              Split PDF
            </ActionButton>
            <button onClick={() => { setFile(null); setError(""); }} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3: COMPRESS
// ═══════════════════════════════════════════════════════════════════════════

function CompressTab() {
  const [file, setFile] = useState<PdfFileEntry | null>(null);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    setResult(null);
    setResultBytes(null);
    const f = files[0];
    if (!f) return;
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const thumb = await renderPageThumbnail(bytes, 1).catch(() => null);
      setFile({
        id: uid(),
        file: f,
        name: f.name,
        size: f.size,
        pageCount: doc.getPageCount(),
        thumbnail: thumb,
      });
    } catch {
      setError("Could not load this PDF.");
    }
  }, []);

  const compress = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const bytes = await file.file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });

      // Compression approach: copy all pages to a new document (strips unused objects)
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(src, src.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));

      // Adjust save options by level
      const opts: Parameters<typeof newPdf.save>[0] = {};
      if (level === "high") {
        opts.useObjectStreams = false;
      }

      const output = await newPdf.save(opts);
      setResult({ original: file.size, compressed: output.length });
      setResultBytes(output);
    } catch (e) {
      setError(`Compression failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  const pctReduction = result
    ? Math.round(((result.original - result.compressed) / result.original) * 100)
    : 0;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Compress PDF</h2>
      <p className="text-sm text-slate-400 mb-6">
        Reduce file size by removing unused objects and re-saving.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to compress" />
      ) : (
        <div className="space-y-6">
          <FileItem name={file.name} size={file.size} thumbnail={file.thumbnail} onRemove={() => { setFile(null); setResult(null); setResultBytes(null); }}
            extra={<span className="text-xs text-slate-500">{file.pageCount} pages</span>} />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Compression level</label>
            <div className="flex gap-3">
              {(["low", "medium", "high"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`rounded-xl border px-5 py-2.5 text-sm font-medium capitalize transition-all ${
                    level === l
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {result && resultBytes && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Original</p>
                  <p className="text-lg font-semibold text-slate-200">{fmtSize(result.original)}</p>
                </div>
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Compressed</p>
                  <p className="text-lg font-semibold text-emerald-400">{fmtSize(result.compressed)}</p>
                </div>
                <span className={`ml-2 rounded-full px-3 py-1 text-sm font-medium ${
                  pctReduction > 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}>
                  {pctReduction > 0 ? `${pctReduction}% smaller` : "No reduction"}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <ActionButton onClick={compress} loading={processing}>
              Compress
            </ActionButton>
            {resultBytes && (
              <ActionButton
                variant="secondary"
                onClick={() => downloadBlob(resultBytes, `${file.name.replace(".pdf", "")}_compressed.pdf`)}
              >
                Download Compressed PDF
              </ActionButton>
            )}
            <button onClick={() => { setFile(null); setResult(null); setResultBytes(null); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}

      <p className="mt-6 text-xs text-slate-600">
        Note: Client-side compression works by removing unused objects and re-saving. For images-heavy PDFs, reduction may be modest.
      </p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4: ROTATE
// ═══════════════════════════════════════════════════════════════════════════

function RotateTab() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    const f = files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setLoadingPages(true);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const count = doc.getPageCount();
      const entries: PageEntry[] = [];
      for (let i = 0; i < count; i++) {
        const thumb = await renderPageThumbnail(bytes, i + 1, 0.3).catch(() => "");
        entries.push({ index: i, thumbnail: thumb, rotation: 0 });
      }
      setPages(entries);
    } catch {
      setError("Could not load this PDF.");
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const rotatePage = (index: number, deg: number) => {
    setPages((prev) =>
      prev.map((p) => (p.index === index ? { ...p, rotation: (p.rotation + deg + 360) % 360 } : p))
    );
  };

  const rotateAll = (deg: number) => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + deg + 360) % 360 })));
  };

  const save = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      for (const p of pages) {
        if (p.rotation !== 0) {
          const page = doc.getPage(p.index);
          page.setRotation(degrees((page.getRotation().angle + p.rotation) % 360));
        }
      }
      const result = await doc.save();
      downloadBlob(result, `${fileName.replace(".pdf", "")}_rotated.pdf`);
    } catch (e) {
      setError(`Rotation failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Rotate Pages</h2>
      <p className="text-sm text-slate-400 mb-6">
        Rotate individual pages or all pages at once.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to rotate pages" />
      ) : loadingPages ? (
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="ml-3 text-sm text-slate-400">Loading pages...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <ActionButton variant="secondary" onClick={() => rotateAll(90)}>
              Rotate All 90 CW
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => rotateAll(-90)}>
              Rotate All 90 CCW
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => rotateAll(180)}>
              Rotate All 180
            </ActionButton>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {pages.map((p) => (
              <div key={p.index} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 text-center">
                <div className="relative mx-auto mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-slate-900 h-32">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={`Page ${p.index + 1}`}
                      className="max-h-full max-w-full object-contain transition-transform duration-300"
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                    />
                  ) : (
                    <span className="text-xs text-slate-600">No preview</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Page {p.index + 1} {p.rotation !== 0 && <span className="text-blue-400">({p.rotation})</span>}
                </p>
                <div className="flex justify-center gap-1">
                  <button onClick={() => rotatePage(p.index, -90)}
                    className="rounded-lg bg-slate-700/50 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-600/50 transition">
                    -90
                  </button>
                  <button onClick={() => rotatePage(p.index, 90)}
                    className="rounded-lg bg-slate-700/50 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-600/50 transition">
                    +90
                  </button>
                  <button onClick={() => rotatePage(p.index, 180)}
                    className="rounded-lg bg-slate-700/50 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-600/50 transition">
                    180
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ActionButton onClick={save} loading={processing}>
              Download Rotated PDF
            </ActionButton>
            <button onClick={() => { setFile(null); setPages([]); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 5: REORDER
// ═══════════════════════════════════════════════════════════════════════════

function ReorderTab() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    const f = files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setLoadingPages(true);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const count = doc.getPageCount();
      const entries: PageEntry[] = [];
      for (let i = 0; i < count; i++) {
        const thumb = await renderPageThumbnail(bytes, i + 1, 0.3).catch(() => "");
        entries.push({ index: i, thumbnail: thumb, rotation: 0 });
      }
      setPages(entries);
    } catch {
      setError("Could not load this PDF.");
    } finally {
      setLoadingPages(false);
    }
  }, []);

  const movePage = (from: number, dir: -1 | 1) => {
    setPages((prev) => {
      const next = [...prev];
      const to = from + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const reverse = () => setPages((prev) => [...prev].reverse());

  const save = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(
        src,
        pages.map((p) => p.index)
      );
      copied.forEach((p) => newPdf.addPage(p));
      const result = await newPdf.save();
      downloadBlob(result, `${fileName.replace(".pdf", "")}_reordered.pdf`);
    } catch (e) {
      setError(`Reorder failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Reorder Pages</h2>
      <p className="text-sm text-slate-400 mb-6">
        Rearrange the pages in your PDF. Use arrows to move pages or reverse the entire order.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to reorder pages" />
      ) : loadingPages ? (
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="ml-3 text-sm text-slate-400">Loading pages...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ActionButton variant="secondary" onClick={reverse}>
              Reverse Order
            </ActionButton>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {pages.map((p, i) => (
              <div key={`${p.index}-${i}`} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 text-center">
                <div className="relative mx-auto mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-slate-900 h-32">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={`Page ${p.index + 1}`} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-600">No preview</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Page {p.index + 1}
                  <span className="text-slate-600 ml-1">(pos {i + 1})</span>
                </p>
                <div className="flex justify-center gap-1">
                  <button onClick={() => movePage(i, -1)} disabled={i === 0}
                    className="rounded-lg bg-slate-700/50 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-600/50 transition disabled:opacity-30">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button onClick={() => movePage(i, 1)} disabled={i === pages.length - 1}
                    className="rounded-lg bg-slate-700/50 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-600/50 transition disabled:opacity-30">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ActionButton onClick={save} loading={processing}>
              Download Reordered PDF
            </ActionButton>
            <button onClick={() => { setFile(null); setPages([]); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 6: PAGE NUMBERS
// ═══════════════════════════════════════════════════════════════════════════

function PageNumbersTab() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<string>("bottom-center");
  const [fontSize, setFontSize] = useState(12);
  const [startNum, setStartNum] = useState(1);
  const [format, setFormat] = useState<"pageX" | "x" | "xOfY">("x");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    const f = files[0];
    if (!f) return;
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile(f);
      setFileName(f.name);
      setPageCount(doc.getPageCount());
    } catch {
      setError("Could not load this PDF.");
    }
  }, []);

  const addPageNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const total = doc.getPageCount();

      for (let i = 0; i < total; i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        const num = startNum + i;
        let text = "";
        if (format === "pageX") text = `Page ${num}`;
        else if (format === "x") text = `${num}`;
        else text = `${num} of ${total + startNum - 1}`;

        const tw = font.widthOfTextAtSize(text, fontSize);
        let x = 0;
        let y = 0;

        const margin = 30;
        if (position.includes("left")) x = margin;
        else if (position.includes("right")) x = width - tw - margin;
        else x = (width - tw) / 2;

        if (position.startsWith("top")) y = height - margin;
        else y = margin;

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      const result = await doc.save();
      downloadBlob(result, `${fileName.replace(".pdf", "")}_numbered.pdf`);
    } catch (e) {
      setError(`Failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  const positions = [
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Add Page Numbers</h2>
      <p className="text-sm text-slate-400 mb-6">
        Add page numbers to every page of your PDF.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to add page numbers" />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 ring-1 ring-slate-700/30">
            <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
              <p className="text-xs text-slate-500">{pageCount} pages</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); }}
              className="text-slate-500 hover:text-red-400 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                {positions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as typeof format)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="x">1, 2, 3...</option>
                <option value="pageX">Page 1, Page 2...</option>
                <option value="xOfY">1 of N, 2 of N...</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font size: {fontSize}pt
              </label>
              <input
                type="range"
                min={8}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Starting number</label>
              <input
                type="number"
                min={1}
                value={startNum}
                onChange={(e) => setStartNum(Number(e.target.value))}
                className="w-40 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ActionButton onClick={addPageNumbers} loading={processing}>
              Add Page Numbers
            </ActionButton>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 7: WATERMARK
// ═══════════════════════════════════════════════════════════════════════════

function WatermarkTab() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(-45);
  const [wmPosition, setWmPosition] = useState<"center" | "top" | "bottom">("center");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    const f = files[0];
    if (!f) return;
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile(f);
      setFileName(f.name);
      setPageCount(doc.getPageCount());
    } catch {
      setError("Could not load this PDF.");
    }
  }, []);

  const addWatermark = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const total = doc.getPageCount();

      for (let i = 0; i < total; i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, fontSize);

        let x = (width - tw) / 2;
        let y = height / 2;
        if (wmPosition === "top") y = height - 80;
        else if (wmPosition === "bottom") y = 60;

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(rotation),
        });
      }

      const result = await doc.save();
      downloadBlob(result, `${fileName.replace(".pdf", "")}_watermarked.pdf`);
    } catch (e) {
      setError(`Watermark failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Add Watermark</h2>
      <p className="text-sm text-slate-400 mb-6">
        Add a text watermark to every page of your PDF.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to watermark" />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 ring-1 ring-slate-700/30">
            <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
              <p className="text-xs text-slate-500">{pageCount} pages</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); }}
              className="text-slate-500 hover:text-red-400 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Watermark text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter watermark text..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font size: {fontSize}pt
              </label>
              <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Opacity: {(opacity * 100).toFixed(0)}%
              </label>
              <input type="range" min={5} max={100} value={opacity * 100} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full accent-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rotation: {rotation} degrees
              </label>
              <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
              <div className="flex gap-2">
                {(["top", "center", "bottom"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setWmPosition(pos)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition-all ${
                      wmPosition === pos
                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live preview box */}
          <div className="rounded-xl border border-slate-700/50 bg-white/5 p-6 flex items-center justify-center h-40 overflow-hidden relative">
            <p
              className="font-bold text-slate-500 whitespace-nowrap select-none"
              style={{
                fontSize: Math.min(fontSize * 0.6, 48),
                opacity,
                transform: `rotate(${rotation}deg)`,
                position: "absolute",
                top: wmPosition === "top" ? "15%" : wmPosition === "bottom" ? "65%" : "40%",
              }}
            >
              {text || "WATERMARK"}
            </p>
            <div className="absolute inset-0 rounded-xl border border-dashed border-slate-700/50 pointer-events-none" />
            <p className="absolute bottom-2 right-3 text-[10px] text-slate-600">Live preview</p>
          </div>

          <div className="flex items-center gap-3">
            <ActionButton onClick={addWatermark} loading={processing} disabled={!text.trim()}>
              Add Watermark
            </ActionButton>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 8: PDF -> IMAGES
// ═══════════════════════════════════════════════════════════════════════════

function PdfToImagesTab() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [imgFormat, setImgFormat] = useState<"png" | "jpg">("png");
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(90);
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    setImages([]);
    const f = files[0];
    if (!f) return;
    try {
      const pdfjs = await getPdfjs();
      const bytes = await f.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
      setFile(f);
      setFileName(f.name);
      setPageCount(doc.numPages);
      doc.destroy();
    } catch {
      setError("Could not load this PDF.");
    }
  }, []);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setImages([]);
    setProgress(0);
    setError("");
    try {
      const pdfjs = await getPdfjs();
      const bytes = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
      const scale = dpi / 72;
      const results: string[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(Math.round((i / doc.numPages) * 100));
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
        const mimeType = imgFormat === "jpg" ? "image/jpeg" : "image/png";
        const dataUrl = canvas.toDataURL(mimeType, quality / 100);
        results.push(dataUrl);
      }

      setImages(results);
      doc.destroy();
    } catch (e) {
      setError(`Conversion failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const downloadAll = () => {
    images.forEach((img, i) => {
      const ext = imgFormat === "jpg" ? "jpg" : "png";
      downloadDataUrl(img, `${fileName.replace(".pdf", "")}_page${i + 1}.${ext}`);
    });
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">PDF to Images</h2>
      <p className="text-sm text-slate-400 mb-6">
        Convert each page of a PDF to a PNG or JPG image.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to convert to images" />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 ring-1 ring-slate-700/30">
            <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
              <p className="text-xs text-slate-500">{pageCount} pages</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setImages([]); setError(""); }}
              className="text-slate-500 hover:text-red-400 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
              <div className="flex gap-2">
                {(["png", "jpg"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setImgFormat(fmt)}
                    className={`rounded-xl border px-5 py-2.5 text-sm font-medium uppercase transition-all ${
                      imgFormat === fmt
                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">DPI</label>
              <div className="flex gap-2">
                {[72, 150, 300].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDpi(d)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      dpi === d
                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {imgFormat === "jpg" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quality: {quality}%
                </label>
                <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
            )}
          </div>

          {processing && <ProgressBar progress={progress} label={`Converting page ${Math.ceil((progress / 100) * pageCount)} of ${pageCount}...`} />}

          <div className="flex items-center gap-3">
            <ActionButton onClick={convert} loading={processing}>
              Convert to Images
            </ActionButton>
            {images.length > 0 && (
              <ActionButton variant="secondary" onClick={downloadAll}>
                Download All ({images.length})
              </ActionButton>
            )}
            <button onClick={() => { setFile(null); setPageCount(0); setImages([]); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img, i) => (
                <div key={i} className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-2 text-center">
                  <div className="relative overflow-hidden rounded-lg bg-white mb-2">
                    <img src={img} alt={`Page ${i + 1}`} className="w-full" />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-500">Page {i + 1}</span>
                    <button
                      onClick={() => downloadDataUrl(img, `${fileName.replace(".pdf", "")}_page${i + 1}.${imgFormat}`)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 9: IMAGES -> PDF
// ═══════════════════════════════════════════════════════════════════════════

function ImagesToPdfTab() {
  const [images, setImages] = useState<ImageFileEntry[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "auto">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(20);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const addImages = useCallback(async (files: File[]) => {
    setError("");
    const entries: ImageFileEntry[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 100, h: 100 });
        img.src = url;
      });
      entries.push({
        id: uid(),
        file,
        name: file.name,
        size: file.size,
        previewUrl: url,
        width: dims.w,
        height: dims.h,
      });
    }
    setImages((prev) => [...prev, ...entries]);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const removed = prev.find((i) => i.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const createPdf = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setError("");
    try {
      const doc = await PDFDocument.create();

      const pageDims = {
        a4: { w: 595.28, h: 841.89 },
        letter: { w: 612, h: 792 },
        auto: { w: 0, h: 0 },
      };

      for (const entry of images) {
        const bytes = await entry.file.arrayBuffer();
        let embedded;
        if (entry.file.type === "image/png") {
          embedded = await doc.embedPng(bytes);
        } else {
          embedded = await doc.embedJpg(bytes);
        }

        let pw: number;
        let ph: number;
        if (pageSize === "auto") {
          pw = embedded.width + margin * 2;
          ph = embedded.height + margin * 2;
        } else {
          const dims = pageDims[pageSize];
          pw = orientation === "portrait" ? dims.w : dims.h;
          ph = orientation === "portrait" ? dims.h : dims.w;
        }

        const page = doc.addPage([pw, ph]);
        const availW = pw - margin * 2;
        const availH = ph - margin * 2;
        const scale = Math.min(availW / embedded.width, availH / embedded.height, 1);
        const drawW = embedded.width * scale;
        const drawH = embedded.height * scale;
        const x = margin + (availW - drawW) / 2;
        const y = margin + (availH - drawH) / 2;

        page.drawImage(embedded, { x, y, width: drawW, height: drawH });
      }

      const result = await doc.save();
      downloadBlob(result, "images_combined.pdf");
    } catch (e) {
      setError(`Failed: ${e instanceof Error ? e.message : "Unknown error"}. Note: WebP images may need to be converted to PNG/JPG first.`);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Images to PDF</h2>
      <p className="text-sm text-slate-400 mb-6">
        Combine multiple images into a single PDF. Supports JPG and PNG.
      </p>

      {images.length === 0 ? (
        <FileDropZone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          multiple
          onFiles={addImages}
          label="Drop images here to create a PDF"
          sublabel="JPG, PNG files"
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={img.id} className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 ring-1 ring-slate-700/30">
                <img src={img.previewUrl} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-600/50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{img.name}</p>
                  <p className="text-xs text-slate-500">{fmtSize(img.size)} &middot; {img.width}&times;{img.height}</p>
                </div>
                {i > 0 && (
                  <button onClick={() => moveImage(i, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                )}
                {i < images.length - 1 && (
                  <button onClick={() => moveImage(i, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                )}
                <button onClick={() => removeImage(img.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Page size</label>
              <div className="flex gap-2">
                {(["a4", "letter", "auto"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium uppercase transition-all ${
                      pageSize === s
                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {s === "auto" ? "Auto-fit" : s}
                  </button>
                ))}
              </div>
            </div>

            {pageSize !== "auto" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Orientation</label>
                <div className="flex gap-2">
                  {(["portrait", "landscape"] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition-all ${
                        orientation === o
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Margin: {margin}px
              </label>
              <input type="range" min={0} max={100} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ActionButton onClick={() => document.getElementById("img2pdf-more")?.click()} variant="secondary">
              Add More Images
            </ActionButton>
            <input
              id="img2pdf-more"
              type="file"
              accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={(e) => {
                const f = Array.from(e.target.files || []);
                if (f.length) addImages(f);
                e.target.value = "";
              }}
            />
            <ActionButton onClick={createPdf} loading={processing}>
              Create PDF ({images.length} image{images.length !== 1 ? "s" : ""})
            </ActionButton>
            <button onClick={() => { images.forEach((img) => URL.revokeObjectURL(img.previewUrl)); setImages([]); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear All
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 10: EXTRACT TEXT
// ═══════════════════════════════════════════════════════════════════════════

function ExtractTextTab() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [pageRange, setPageRange] = useState("all");
  const [customRange, setCustomRange] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const loadFile = useCallback(async (files: File[]) => {
    setError("");
    setExtractedText("");
    const f = files[0];
    if (!f) return;
    try {
      const pdfjs = await getPdfjs();
      const bytes = await f.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
      setFile(f);
      setFileName(f.name);
      setPageCount(doc.numPages);
      doc.destroy();
    } catch {
      setError("Could not load this PDF.");
    }
  }, []);

  const extract = async () => {
    if (!file) return;
    setProcessing(true);
    setExtractedText("");
    setProgress(0);
    setError("");
    try {
      const pdfjs = await getPdfjs();
      const bytes = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;

      let pagesToExtract: number[];
      if (pageRange === "all") {
        pagesToExtract = Array.from({ length: doc.numPages }, (_, i) => i + 1);
      } else {
        pagesToExtract = parsePageRange(customRange, doc.numPages);
        if (pagesToExtract.length === 0) {
          setError("No valid pages specified.");
          setProcessing(false);
          doc.destroy();
          return;
        }
      }

      const textParts: string[] = [];
      for (let i = 0; i < pagesToExtract.length; i++) {
        setProgress(Math.round(((i + 1) / pagesToExtract.length) * 100));
        const page = await doc.getPage(pagesToExtract[i]);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        textParts.push(`--- Page ${pagesToExtract[i]} ---\n${pageText}`);
      }

      setExtractedText(textParts.join("\n\n"));
      doc.destroy();
    } catch (e) {
      setError(`Extraction failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard.");
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Extract Text</h2>
      <p className="text-sm text-slate-400 mb-6">
        Extract all text content from a PDF. Works best with text-based (not scanned) PDFs.
      </p>

      {!file ? (
        <FileDropZone accept=".pdf,application/pdf" multiple={false} onFiles={loadFile} label="Drop a PDF to extract text" />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 ring-1 ring-slate-700/30">
            <svg className="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
              <p className="text-xs text-slate-500">{pageCount} pages</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setExtractedText(""); setError(""); }}
              className="text-slate-500 hover:text-red-400 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-slate-300">Pages:</label>
            <button
              onClick={() => setPageRange("all")}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                pageRange === "all"
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
              }`}
            >
              All pages
            </button>
            <button
              onClick={() => setPageRange("custom")}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                pageRange === "custom"
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600"
              }`}
            >
              Custom range
            </button>
            {pageRange === "custom" && (
              <input
                type="text"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                placeholder="e.g. 1,3,5-8"
                className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            )}
          </div>

          {processing && <ProgressBar progress={progress} label="Extracting text..." />}

          <div className="flex items-center gap-3">
            <ActionButton onClick={extract} loading={processing}>
              Extract Text
            </ActionButton>
            {extractedText && (
              <ActionButton variant="secondary" onClick={copyText}>
                {copied ? "Copied!" : "Copy Text"}
              </ActionButton>
            )}
            <button onClick={() => { setFile(null); setPageCount(0); setExtractedText(""); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Clear
            </button>
          </div>

          {extractedText && (
            <div className="relative">
              <textarea
                readOnly
                value={extractedText}
                className="w-full h-80 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-200 font-mono focus:border-blue-500 focus:outline-none resize-y"
              />
              <p className="mt-2 text-xs text-slate-600">
                {extractedText.length.toLocaleString()} characters extracted
              </p>
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-4"><StatusMessage message={error} type="error" /></div>}
    </Card>
  );
}

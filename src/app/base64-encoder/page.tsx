"use client";

import React, { useState, useCallback, useRef } from "react";
import { ToolPageFooter } from "@/components/ToolPageFooter";
import {
  ArrowRightLeft,
  Copy,
  Check,
  Trash2,
  FileText,
  Upload,
  Shield,
  Link,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = "encode" | "decode";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function byteSize(str: string): number {
  return new TextEncoder().encode(str).byteLength;
}

function toStandardBase64(input: string): string {
  return btoa(
    new TextEncoder()
      .encode(input)
      .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  );
}

function fromStandardBase64(input: string): string {
  const binary = atob(input);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad === 2) s += "==";
  else if (pad === 3) s += "=";
  return s;
}

function encodeBase64(plain: string, urlSafe: boolean): string {
  const b64 = toStandardBase64(plain);
  return urlSafe ? toUrlSafe(b64) : b64;
}

function decodeBase64(encoded: string, urlSafe: boolean): string {
  const standard = urlSafe ? fromUrlSafe(encoded) : encoded;
  return fromStandardBase64(standard);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:image/png;base64,")
      const base64 = result.split(",")[1] ?? result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

const SAMPLE_PLAIN = `{
  "name": "DevToolbox",
  "version": "1.0.0",
  "description": "A collection of developer tools",
  "features": ["Base64", "JWT", "JSON", "Diff"]
}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Base64EncoderPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [plainText, setPlainText] = useState("");
  const [base64Text, setBase64Text] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Encode: plain -> base64 ----
  const handlePlainChange = useCallback(
    (value: string) => {
      setPlainText(value);
      setError(null);
      setFileName(null);
      if (value === "") {
        setBase64Text("");
        return;
      }
      try {
        setBase64Text(encodeBase64(value, urlSafe));
      } catch {
        setError("Failed to encode text to Base64");
        setBase64Text("");
      }
    },
    [urlSafe]
  );

  // ---- Decode: base64 -> plain ----
  const handleBase64Change = useCallback(
    (value: string) => {
      setBase64Text(value);
      setError(null);
      setFileName(null);
      if (value === "") {
        setPlainText("");
        return;
      }
      try {
        setPlainText(decodeBase64(value, urlSafe));
      } catch {
        setError(
          "Invalid Base64 input. Check for incorrect characters or padding."
        );
        setPlainText("");
      }
    },
    [urlSafe]
  );

  // ---- Mode toggle ----
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    setError(null);
  }, []);

  // ---- URL-safe toggle re-encodes/re-decodes current content ----
  const toggleUrlSafe = useCallback(() => {
    setUrlSafe((prev) => {
      const next = !prev;
      if (mode === "encode" && plainText) {
        try {
          setBase64Text(encodeBase64(plainText, next));
          setError(null);
        } catch {
          setError("Failed to re-encode with new URL-safe setting");
        }
      } else if (mode === "decode" && base64Text) {
        try {
          setPlainText(decodeBase64(base64Text, next));
          setError(null);
        } catch {
          setError("Failed to re-decode with new URL-safe setting");
        }
      }
      return next;
    });
  }, [mode, plainText, base64Text]);

  // ---- File handling ----
  const handleFile = useCallback(
    async (file: File) => {
      try {
        setFileName(file.name);
        const b64 = await fileToBase64(file);
        const output = urlSafe ? toUrlSafe(b64) : b64;
        setBase64Text(output);
        setPlainText(`[File: ${file.name} — ${file.size.toLocaleString()} bytes]`);
        setMode("encode");
        setError(null);
      } catch {
        setError("Failed to read file");
      }
    },
    [urlSafe]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ---- Copy output ----
  const handleCopy = useCallback(async () => {
    const text = mode === "encode" ? base64Text : plainText;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mode, base64Text, plainText]);

  // ---- Clear ----
  const handleClear = useCallback(() => {
    setPlainText("");
    setBase64Text("");
    setError(null);
    setFileName(null);
    setCopied(false);
  }, []);

  // ---- Sample data ----
  const handleSample = useCallback(() => {
    setFileName(null);
    setError(null);
    if (mode === "encode") {
      setPlainText(SAMPLE_PLAIN);
      try {
        setBase64Text(encodeBase64(SAMPLE_PLAIN, urlSafe));
      } catch {
        setError("Failed to encode sample data");
      }
    } else {
      const sampleB64 = encodeBase64(SAMPLE_PLAIN, urlSafe);
      setBase64Text(sampleB64);
      setPlainText(SAMPLE_PLAIN);
    }
  }, [mode, urlSafe]);

  // ---- Stats ----
  const plainChars = plainText.length;
  const plainBytes = byteSize(plainText);
  const b64Chars = base64Text.length;
  const b64Bytes = byteSize(base64Text);

  // ---- Which textarea is "input" vs "output"? ----
  const isEncoding = mode === "encode";
  const outputText = isEncoding ? base64Text : plainText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ---- Header ---- */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-800/50 bg-slate-900/50 px-4 py-1.5 text-sm text-slate-400 backdrop-blur-sm">
            <Shield className="h-4 w-4" />
            100% Client-Side
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Base64
            </span>{" "}
            Encoder / Decoder
          </h1>
          <p className="mt-2 text-slate-400">
            Encode text to Base64 or decode Base64 back to text. Supports file
            uploads and URL-safe mode.
          </p>
        </div>

        {/* ---- Controls ---- */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {/* Mode toggle */}
          <button
            onClick={toggleMode}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            <ArrowRightLeft className="h-4 w-4" />
            {isEncoding ? "Encode Mode" : "Decode Mode"}
          </button>

          {/* URL-safe toggle */}
          <button
            onClick={toggleUrlSafe}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              urlSafe
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                : "border-slate-700/50 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
            }`}
          >
            <Link className="h-4 w-4" />
            URL-Safe
          </button>

          {/* Sample data */}
          <button
            onClick={handleSample}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
          >
            <FileText className="h-4 w-4" />
            Sample
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>

          {/* Copy output */}
          <button
            onClick={handleCopy}
            disabled={!outputText}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              outputText
                ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                : "cursor-not-allowed border border-slate-700/50 bg-slate-800/40 text-slate-600"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Output
              </>
            )}
          </button>
        </div>

        {/* ---- Error banner ---- */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ---- Textareas grid ---- */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Plain Text */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Plain Text
                {isEncoding && (
                  <span className="ml-2 rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                    INPUT
                  </span>
                )}
                {!isEncoding && (
                  <span className="ml-2 rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                    OUTPUT
                  </span>
                )}
              </label>
              <span className="text-xs text-slate-500">
                {plainChars.toLocaleString()} chars &middot;{" "}
                {plainBytes.toLocaleString()} bytes
              </span>
            </div>
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-1">
              <textarea
                value={plainText}
                onChange={(e) =>
                  isEncoding
                    ? handlePlainChange(e.target.value)
                    : setPlainText(e.target.value)
                }
                readOnly={!isEncoding}
                placeholder={
                  isEncoding
                    ? "Type or paste text to encode..."
                    : "Decoded output will appear here..."
                }
                className="h-64 w-full resize-y rounded-xl bg-transparent px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none sm:h-80"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right: Base64 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Base64
                {urlSafe && (
                  <span className="ml-1 text-xs text-cyan-400">(URL-Safe)</span>
                )}
                {!isEncoding && (
                  <span className="ml-2 rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                    INPUT
                  </span>
                )}
                {isEncoding && (
                  <span className="ml-2 rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                    OUTPUT
                  </span>
                )}
              </label>
              <span className="text-xs text-slate-500">
                {b64Chars.toLocaleString()} chars &middot;{" "}
                {b64Bytes.toLocaleString()} bytes
              </span>
            </div>
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-1">
              <textarea
                value={base64Text}
                onChange={(e) =>
                  !isEncoding
                    ? handleBase64Change(e.target.value)
                    : setBase64Text(e.target.value)
                }
                readOnly={isEncoding}
                placeholder={
                  !isEncoding
                    ? "Paste Base64 to decode..."
                    : "Encoded output will appear here..."
                }
                className="h-64 w-full resize-y rounded-xl bg-transparent px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none sm:h-80"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* ---- File upload zone ---- */}
        <div className="mt-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
              dragOver
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-slate-700/50 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50"
            }`}
          >
            <Upload
              className={`h-8 w-8 ${
                dragOver ? "text-cyan-400" : "text-slate-500"
              }`}
            />
            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-300">
                Drop a file here
              </span>{" "}
              or click to browse
            </p>
            <p className="text-xs text-slate-500">
              Any file type. Encoded entirely in your browser.
            </p>
            {fileName && (
              <p className="mt-1 text-xs text-cyan-400">
                Current file: {fileName}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {/* ---- Info section ---- */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
            <h3 className="mb-2 font-semibold text-slate-200">
              What is Base64?
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Base64 is a binary-to-text encoding that represents binary data
              using 64 printable ASCII characters. It is commonly used to embed
              images in HTML/CSS, transmit data in URLs, and encode email
              attachments.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
            <h3 className="mb-2 font-semibold text-slate-200">
              URL-Safe Mode
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Standard Base64 uses <code className="text-cyan-400">+</code> and{" "}
              <code className="text-cyan-400">/</code> which are reserved in
              URLs. URL-safe Base64 replaces them with{" "}
              <code className="text-cyan-400">-</code> and{" "}
              <code className="text-cyan-400">_</code>, and strips padding{" "}
              <code className="text-cyan-400">=</code> characters.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
            <h3 className="mb-2 font-semibold text-slate-200">
              Privacy First
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Everything runs in your browser. No data is sent to any server.
              Your text and files never leave your machine. Safe for encoding
              secrets, tokens, and sensitive data.
            </p>
          </div>
        </div>
      </div>
      <ToolPageFooter toolId="base64-encoder" />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ToolPageFooter } from "@/components/ToolPageFooter";
import {
  ArrowLeft,
  Hash,
  Copy,
  Check,
  FileUp,
  Trash2,
  TextCursorInput,
  ArrowUpDown,
  FileDigit,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Lightweight MD5 implementation (no external deps)                  */
/* ------------------------------------------------------------------ */

function md5(input: Uint8Array): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(
    q: number,
    a: number,
    b: number,
    x: number,
    s: number,
    t: number
  ): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  // Convert Uint8Array to array of little-endian 32-bit words
  const len = input.length;
  const bitLen = len * 8;
  // Pad: append 0x80, then zeros, then 64-bit length (LE)
  const padLen = ((len + 8) >> 6) + 1;
  const words = new Array(padLen * 16).fill(0);
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= input[i] << ((i % 4) * 8);
  }
  words[len >> 2] |= 0x80 << ((len % 4) * 8);
  words[padLen * 16 - 2] = bitLen & 0xffffffff;
  words[padLen * 16 - 1] = 0; // We only support up to 2^32 bits

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < words.length; i += 16) {
    const oa = a,
      ob = b,
      oc = c,
      od = d;
    a = md5ff(a, b, c, d, words[i], 7, -680876936);
    d = md5ff(d, a, b, c, words[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, words[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, words[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, words[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, words[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, words[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, words[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, words[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, words[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, words[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, words[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, words[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, words[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, words[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, words[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, words[i], 20, -373897302);
    a = md5gg(a, b, c, d, words[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, words[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, words[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, words[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, words[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, words[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, words[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, words[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, words[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, words[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, words[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, words[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, words[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, words[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, words[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, words[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, words[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, words[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, words[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, words[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, words[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, words[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, words[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, words[i], 6, -198630844);
    d = md5ii(d, a, b, c, words[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, words[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, words[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, words[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, words[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, words[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, words[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, words[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, words[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, words[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, words[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, words[i + 9], 21, -343485551);

    a = safeAdd(a, oa);
    b = safeAdd(b, ob);
    c = safeAdd(c, oc);
    d = safeAdd(d, od);
  }

  const hex = "0123456789abcdef";
  let result = "";
  for (const val of [a, b, c, d]) {
    for (let j = 0; j < 4; j++) {
      result += hex[(val >> (j * 8 + 4)) & 0xf];
      result += hex[(val >> (j * 8)) & 0xf];
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Hash computation helpers                                           */
/* ------------------------------------------------------------------ */

type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGORITHMS: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashBytes(
  algorithm: Algorithm,
  data: Uint8Array
): Promise<string> {
  if (algorithm === "MD5") {
    return md5(data);
  }
  const buf = await crypto.subtle.digest(algorithm, data.buffer as ArrayBuffer);
  return bufToHex(buf);
}

function encodeText(text: string, encoding: "utf-8" | "ascii"): Uint8Array {
  if (encoding === "ascii") {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i) & 0x7f;
    }
    return bytes;
  }
  return new TextEncoder().encode(text);
}

/* ------------------------------------------------------------------ */
/*  Hash result type                                                   */
/* ------------------------------------------------------------------ */

interface HashResult {
  algorithm: Algorithm;
  hash: string;
}

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog`;

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [encoding, setEncoding] = useState<"utf-8" | "ascii">("utf-8");
  const [uppercase, setUppercase] = useState(false);
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  // File hashing
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileHashes, setFileHashes] = useState<HashResult[]>([]);
  const [fileCopiedIdx, setFileCopiedIdx] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileHashing, setFileHashing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compare
  const [hash1, setHash1] = useState("");
  const [hash2, setHash2] = useState("");

  // Compute hashes for text input
  const computeHashes = useCallback(
    async (text: string) => {
      if (!text) {
        setHashes([]);
        return;
      }
      setIsHashing(true);
      const data = encodeText(text, encoding);
      const results = await Promise.all(
        ALGORITHMS.map(async (alg) => ({
          algorithm: alg,
          hash: await hashBytes(alg, data),
        }))
      );
      setHashes(results);
      setIsHashing(false);
    },
    [encoding]
  );

  useEffect(() => {
    computeHashes(input);
  }, [input, computeHashes]);

  // Compute hashes for file
  useEffect(() => {
    if (!fileBytes) {
      setFileHashes([]);
      return;
    }
    let cancelled = false;
    setFileHashing(true);
    Promise.all(
      ALGORITHMS.map(async (alg) => ({
        algorithm: alg,
        hash: await hashBytes(alg, fileBytes),
      }))
    ).then((results) => {
      if (!cancelled) {
        setFileHashes(results);
        setFileHashing(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fileBytes]);

  // Copy helper
  const copyHash = useCallback(
    (value: string, idx: number, setIdx: (i: number | null) => void) => {
      const display = uppercase ? value.toUpperCase() : value;
      navigator.clipboard.writeText(display);
      setIdx(idx);
      setTimeout(() => setIdx(null), 1500);
    },
    [uppercase]
  );

  // File handling
  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileBytes(new Uint8Array(reader.result as ArrayBuffer));
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Compare
  const compareResult =
    hash1.trim() && hash2.trim()
      ? hash1.trim().toLowerCase() === hash2.trim().toLowerCase()
      : null;

  // Byte length
  const byteLength = input ? encodeText(input, encoding).length : 0;

  // Format hash display
  const fmt = (h: string) => (uppercase ? h.toUpperCase() : h);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Hash Generator</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* -------------------------------------------------------- */}
        {/*  Text Input Section                                      */}
        {/* -------------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-slate-300">
              <TextCursorInput className="h-5 w-5" />
              <span className="font-medium">Text Input</span>
              {input && (
                <span className="ml-2 text-xs text-slate-500">
                  {byteLength} byte{byteLength !== 1 ? "s" : ""} ({encoding})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Encoding toggle */}
              <div className="flex rounded-lg border border-slate-700 overflow-hidden text-xs">
                <button
                  onClick={() => setEncoding("utf-8")}
                  className={`px-3 py-1.5 transition-colors ${
                    encoding === "utf-8"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  UTF-8
                </button>
                <button
                  onClick={() => setEncoding("ascii")}
                  className={`px-3 py-1.5 transition-colors ${
                    encoding === "ascii"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ASCII
                </button>
              </div>

              {/* Case toggle */}
              <button
                onClick={() => setUppercase((u) => !u)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  uppercase
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <ArrowUpDown className="h-3 w-3" />
                {uppercase ? "UPPER" : "lower"}
              </button>

              {/* Sample */}
              <button
                onClick={() => setInput(SAMPLE_TEXT)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Sample
              </button>

              {/* Clear */}
              <button
                onClick={() => {
                  setInput("");
                  setHashes([]);
                }}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to hash..."
            className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-y min-h-[120px] font-mono"
            rows={5}
          />

          {/* Hash Outputs */}
          {hashes.length > 0 && (
            <div className="mt-4 space-y-2">
              {hashes.map((h, idx) => (
                <div
                  key={h.algorithm}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-slate-800/40 bg-slate-950/40 px-4 py-3"
                >
                  <span className="shrink-0 w-20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h.algorithm}
                  </span>
                  <code className="flex-1 text-xs sm:text-sm text-cyan-300 font-mono break-all select-all">
                    {fmt(h.hash)}
                  </code>
                  <button
                    onClick={() => copyHash(h.hash, idx, setCopiedIdx)}
                    className="shrink-0 flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {isHashing && (
            <p className="mt-3 text-xs text-slate-500 animate-pulse">
              Computing hashes...
            </p>
          )}
        </section>

        {/* -------------------------------------------------------- */}
        {/*  File Hashing Section                                    */}
        {/* -------------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 text-slate-300 mb-4">
            <FileDigit className="h-5 w-5" />
            <span className="font-medium">File Hashing</span>
          </div>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragOver
                ? "border-cyan-500 bg-cyan-500/5"
                : "border-slate-700/50 hover:border-slate-600"
            }`}
          >
            <FileUp className="mx-auto h-8 w-8 text-slate-500 mb-2" />
            <p className="text-sm text-slate-400">
              {fileName ? (
                <>
                  <span className="text-cyan-400 font-medium">{fileName}</span>{" "}
                  &mdash; drop another to replace
                </>
              ) : (
                <>
                  Drag &amp; drop a file here, or{" "}
                  <span className="text-cyan-400 underline">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              100% client-side &mdash; nothing is uploaded
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* File hash results */}
          {fileHashing && (
            <p className="mt-3 text-xs text-slate-500 animate-pulse">
              Hashing file...
            </p>
          )}

          {fileHashes.length > 0 && !fileHashing && (
            <div className="mt-4 space-y-2">
              {fileHashes.map((h, idx) => (
                <div
                  key={h.algorithm}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-slate-800/40 bg-slate-950/40 px-4 py-3"
                >
                  <span className="shrink-0 w-20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h.algorithm}
                  </span>
                  <code className="flex-1 text-xs sm:text-sm text-cyan-300 font-mono break-all select-all">
                    {fmt(h.hash)}
                  </code>
                  <button
                    onClick={() =>
                      copyHash(h.hash, idx, setFileCopiedIdx)
                    }
                    className="shrink-0 flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors"
                  >
                    {fileCopiedIdx === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {fileName && !fileHashing && fileHashes.length > 0 && (
            <button
              onClick={() => {
                setFileName(null);
                setFileBytes(null);
                setFileHashes([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear file
            </button>
          )}
        </section>

        {/* -------------------------------------------------------- */}
        {/*  Hash Comparison Section                                  */}
        {/* -------------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 text-slate-300 mb-4">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">Compare Hashes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Hash A
              </label>
              <input
                value={hash1}
                onChange={(e) => setHash1(e.target.value)}
                placeholder="Paste first hash..."
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Hash B
              </label>
              <input
                value={hash2}
                onChange={(e) => setHash2(e.target.value)}
                placeholder="Paste second hash..."
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
          </div>

          {compareResult !== null && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                compareResult
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {compareResult ? (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Hashes match (case-insensitive)
                </>
              ) : (
                <>
                  <ShieldX className="h-5 w-5" />
                  Hashes do NOT match
                </>
              )}
            </div>
          )}

          {(hash1 || hash2) && (
            <button
              onClick={() => {
                setHash1("");
                setHash2("");
              }}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </section>

        {/* -------------------------------------------------------- */}
        {/*  Info Footer                                              */}
        {/* -------------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">
            About These Algorithms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-400">
            {[
              {
                name: "MD5",
                bits: 128,
                note: "Legacy, not collision-resistant. Use for checksums only.",
              },
              {
                name: "SHA-1",
                bits: 160,
                note: "Deprecated for security. Still used in Git.",
              },
              {
                name: "SHA-256",
                bits: 256,
                note: "Industry standard. Used in TLS, Bitcoin, code signing.",
              },
              {
                name: "SHA-384",
                bits: 384,
                note: "Truncated SHA-512. Common in government systems.",
              },
              {
                name: "SHA-512",
                bits: 512,
                note: "Strongest SHA-2 variant. Faster than SHA-256 on 64-bit CPUs.",
              },
            ].map((alg) => (
              <div
                key={alg.name}
                className="rounded-lg border border-slate-800/30 bg-slate-950/30 p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">
                    {alg.name}
                  </span>
                  <span className="text-slate-600">{alg.bits}-bit</span>
                </div>
                <p className="text-slate-500 leading-relaxed">{alg.note}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <ToolPageFooter toolId="hash-generator" />
    </div>
  );
}

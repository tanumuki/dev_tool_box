"use client";

import { useState, useCallback, useMemo } from "react";
import { ToolPageFooter } from "@/components/ToolPageFooter";
import {
  Link,
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  Plus,
  X,
  Info,
  Zap,
  FlaskConical,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = "encode" | "decode";
type EncodeVariant = "encodeURIComponent" | "encodeURI";

interface ParsedUrl {
  protocol: string;
  host: string;
  pathname: string;
  queryParams: [string, string][];
  fragment: string;
}

interface QueryPair {
  id: number;
  key: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SAMPLE_URL =
  "https://example.com/search?q=hello+world&lang=en&tags=react%2Cnext.js&redirect=https%3A%2F%2Fother.com%2Fpath%3Ftoken%3Dabc123&utm_source=dev+toolbox#results-section";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    try {
      return decodeURI(input);
    } catch {
      return input;
    }
  }
}

function safeEncode(input: string, variant: EncodeVariant): string {
  try {
    return variant === "encodeURIComponent"
      ? encodeURIComponent(input)
      : encodeURI(input);
  } catch {
    return input;
  }
}

function tryParseUrl(raw: string): ParsedUrl | null {
  try {
    const url = new URL(raw);
    const queryParams: [string, string][] = [];
    url.searchParams.forEach((v, k) => queryParams.push([k, v]));
    return {
      protocol: url.protocol.replace(":", ""),
      host: url.host,
      pathname: url.pathname,
      queryParams,
      fragment: url.hash.replace("#", ""),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label="More info"
        className="ml-1 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-cyan-400 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <Info size={14} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-cyan-600 hover:text-cyan-400"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function UrlEncoderPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [encodeVariant, setEncodeVariant] =
    useState<EncodeVariant>("encodeURIComponent");

  // Query string builder state
  const [queryPairs, setQueryPairs] = useState<QueryPair[]>([
    { id: 1, key: "", value: "" },
  ]);
  const [nextPairId, setNextPairId] = useState(2);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode"
      ? safeEncode(input, encodeVariant)
      : safeDecode(input);
  }, [input, mode, encodeVariant]);

  const parsedUrl = useMemo(() => {
    const target = mode === "decode" ? output : input;
    return tryParseUrl(target);
  }, [input, output, mode]);

  const builtQueryString = useMemo(() => {
    const validPairs = queryPairs.filter(
      (p) => p.key.trim() !== ""
    );
    if (validPairs.length === 0) return "";
    const params = new URLSearchParams();
    validPairs.forEach((p) => params.append(p.key, p.value));
    return params.toString();
  }, [queryPairs]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  const handleSample = useCallback(() => {
    setInput(SAMPLE_URL);
    setMode("decode");
  }, []);

  const handleSwap = useCallback(() => {
    setInput(output);
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
  }, [output]);

  const addPair = useCallback(() => {
    setQueryPairs((prev) => [...prev, { id: nextPairId, key: "", value: "" }]);
    setNextPairId((prev) => prev + 1);
  }, [nextPairId]);

  const removePair = useCallback((id: number) => {
    setQueryPairs((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length === 0 ? [{ id: Date.now(), key: "", value: "" }] : next;
    });
  }, []);

  const updatePair = useCallback(
    (id: number, field: "key" | "value", val: string) => {
      setQueryPairs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
      );
    },
    []
  );

  const useBuiltQuery = useCallback(() => {
    if (builtQueryString) {
      setInput(builtQueryString);
      setMode("decode");
    }
  }, [builtQueryString]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-emerald-500/20 p-3">
            <Link size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              URL Encoder / Decoder
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Encode, decode, parse &amp; build URLs entirely in your browser.
          </p>
        </header>

        {/* Controls bar */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {/* Mode toggle */}
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            <button
              type="button"
              onClick={() => setMode("encode")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                mode === "encode"
                  ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setMode("decode")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                mode === "decode"
                  ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Decode
            </button>
          </div>

          {/* Encode variant toggle (visible only in encode mode) */}
          {mode === "encode" && (
            <div className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1">
              <button
                type="button"
                onClick={() => setEncodeVariant("encodeURIComponent")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  encodeVariant === "encodeURIComponent"
                    ? "bg-slate-700 text-cyan-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                encodeURIComponent
              </button>
              <button
                type="button"
                onClick={() => setEncodeVariant("encodeURI")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  encodeVariant === "encodeURI"
                    ? "bg-slate-700 text-cyan-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                encodeURI
              </button>
              <Tooltip
                text={
                  "encodeURIComponent encodes ALL special characters (including : / ? # & =). Use for individual query-param values. encodeURI leaves URL-structural characters intact. Use for encoding a full URL that already has valid structure."
                }
              />
            </div>
          )}

          {/* Swap / Clear / Sample */}
          <button
            type="button"
            onClick={handleSwap}
            disabled={!output}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-cyan-600 hover:text-cyan-400 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-300"
          >
            <ArrowRightLeft size={13} />
            Swap
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-red-500 hover:text-red-400"
          >
            <Trash2 size={13} />
            Clear
          </button>
          <button
            type="button"
            onClick={handleSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-emerald-500 hover:text-emerald-400"
          >
            <FlaskConical size={13} />
            Sample URL
          </button>
        </div>

        {/* Main encode/decode area */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300">
                {mode === "encode" ? "Plain Text / URL" : "Encoded Input"}
              </label>
              <span className="text-xs text-slate-500">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Paste a URL or text to encode..."
                  : "Paste an encoded URL to decode..."
              }
              spellCheck={false}
              className="h-48 w-full resize-y rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30"
            />
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300">
                {mode === "encode" ? "Encoded Output" : "Decoded Output"}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {output.length} chars
                </span>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              spellCheck={false}
              className="h-48 w-full resize-y rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 font-mono text-sm text-emerald-300 placeholder-slate-600 outline-none"
            />
          </div>
        </div>

        {/* Live indicator */}
        {input && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Zap size={12} className="text-cyan-500" />
            Live conversion &mdash; updates as you type
          </div>
        )}

        {/* URL Parser */}
        {parsedUrl && (
          <section className="mt-8 rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-200">
              URL Breakdown
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <UrlPart label="Protocol" value={parsedUrl.protocol} />
              <UrlPart label="Host" value={parsedUrl.host} />
              <UrlPart label="Path" value={parsedUrl.pathname} />
              <UrlPart
                label="Fragment"
                value={parsedUrl.fragment || "(none)"}
              />
            </div>

            {parsedUrl.queryParams.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-slate-300">
                  Query Parameters ({parsedUrl.queryParams.length})
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-800/60">
                        <th className="px-4 py-2 font-medium text-slate-400">
                          Key
                        </th>
                        <th className="px-4 py-2 font-medium text-slate-400">
                          Value (decoded)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedUrl.queryParams.map(([k, v], i) => (
                        <tr
                          key={`${k}-${i}`}
                          className="border-b border-slate-800 last:border-0"
                        >
                          <td className="px-4 py-2 font-mono text-cyan-300">
                            {k}
                          </td>
                          <td className="px-4 py-2 font-mono text-emerald-300 break-all">
                            {v}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Query String Builder */}
        <section className="mt-8 rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-200">
            Query String Builder
          </h2>

          <div className="space-y-3">
            {queryPairs.map((pair) => (
              <div key={pair.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="key"
                  value={pair.key}
                  onChange={(e) => updatePair(pair.id, "key", e.target.value)}
                  className="w-full max-w-[200px] rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-cyan-600"
                />
                <span className="text-slate-600">=</span>
                <input
                  type="text"
                  placeholder="value"
                  value={pair.value}
                  onChange={(e) => updatePair(pair.id, "value", e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-cyan-600"
                />
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  className="flex-shrink-0 rounded-lg border border-slate-700 p-2 text-slate-500 transition-colors hover:border-red-500 hover:text-red-400"
                  aria-label="Remove pair"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addPair}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-cyan-600 hover:text-cyan-400"
            >
              <Plus size={13} />
              Add Pair
            </button>

            <button
              type="button"
              onClick={useBuiltQuery}
              disabled={!builtQueryString}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
            >
              Use as Input
            </button>

            {builtQueryString && <CopyButton text={builtQueryString} />}
          </div>

          {builtQueryString && (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
              <p className="mb-1 text-xs font-medium text-slate-400">
                Generated query string
              </p>
              <code className="block break-all font-mono text-sm text-emerald-300">
                {builtQueryString}
              </code>
            </div>
          )}
        </section>

        {/* Cheat-sheet */}
        <section className="mt-8 rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-200">
            Common Encodings Reference
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/60">
                  <th className="px-4 py-2 font-medium text-slate-400">
                    Character
                  </th>
                  <th className="px-4 py-2 font-medium text-slate-400">
                    Encoded
                  </th>
                  <th className="px-4 py-2 font-medium text-slate-400">
                    encodeURI
                  </th>
                  <th className="px-4 py-2 font-medium text-slate-400">
                    encodeURIComponent
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {COMMON_ENCODINGS.map(([char, enc, uri, comp]) => (
                  <tr
                    key={char}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-1.5 text-cyan-300">{char}</td>
                    <td className="px-4 py-1.5 text-emerald-300">{enc}</td>
                    <td className="px-4 py-1.5 text-slate-400">{uri}</td>
                    <td className="px-4 py-1.5 text-slate-400">{comp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-600">
          100% client-side &mdash; nothing leaves your browser.
        </footer>
      </div>
      <ToolPageFooter toolId="url-encoder" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

function UrlPart({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="break-all font-mono text-sm text-cyan-300">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const COMMON_ENCODINGS: [string, string, string, string][] = [
  ["(space)", "%20", "preserved", "encoded"],
  ["!", "%21", "preserved", "encoded"],
  ["#", "%23", "preserved", "encoded"],
  ["$", "%24", "preserved", "encoded"],
  ["&", "%26", "preserved", "encoded"],
  ["+", "%2B", "preserved", "encoded"],
  ["/", "%2F", "preserved", "encoded"],
  [":", "%3A", "preserved", "encoded"],
  ["=", "%3D", "preserved", "encoded"],
  ["?", "%3F", "preserved", "encoded"],
  ["@", "%40", "preserved", "encoded"],
];

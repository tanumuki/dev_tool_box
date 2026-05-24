"use client";

import { useState, useMemo, useCallback } from "react";
import { ToolPageFooter } from "@/components/ToolPageFooter";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  KeyRound,
  FileJson,
  Fingerprint,
  Sparkles,
  ArrowLeft,
  Timer,
  CalendarClock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Sample JWT (expires far in the future so "Valid for X" is always shown)
// ---------------------------------------------------------------------------

function makeSampleJwt(): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "1234567890",
    name: "Jane Developer",
    email: "jane@devtoolbox.io",
    role: "admin",
    iat: now,
    exp: now + 86400, // 24 hours from now
    iss: "devtoolbox.io",
    aud: "https://api.devtoolbox.io",
  };
  const enc = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const sig = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  return `${enc(header)}.${enc(payload)}.${sig}`;
}

// ---------------------------------------------------------------------------
// Decode helpers
// ---------------------------------------------------------------------------

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  rawParts: [string, string, string];
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  return atob(base64);
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("JWT must have exactly 3 parts separated by dots");

  const headerJson = base64UrlDecode(parts[0]);
  const payloadJson = base64UrlDecode(parts[1]);

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(headerJson);
  } catch {
    throw new Error("Invalid JSON in JWT header");
  }

  try {
    payload = JSON.parse(payloadJson);
  } catch {
    throw new Error("Invalid JSON in JWT payload");
  }

  return {
    header,
    payload,
    signature: parts[2],
    rawParts: [parts[0], parts[1], parts[2]],
  };
}

// ---------------------------------------------------------------------------
// Expiration helpers
// ---------------------------------------------------------------------------

interface ExpirationInfo {
  status: "valid" | "expired" | "none";
  label: string;
  detail?: string;
}

function getExpirationInfo(payload: Record<string, unknown>): ExpirationInfo {
  const exp = payload.exp;
  if (exp === undefined || exp === null) {
    return { status: "none", label: "No expiration set" };
  }
  const expMs = (exp as number) * 1000;
  const now = Date.now();
  const diff = expMs - now;

  if (diff <= 0) {
    const ago = formatDuration(Math.abs(diff));
    return { status: "expired", label: "Expired", detail: `Expired ${ago} ago` };
  }

  const remaining = formatDuration(diff);
  return { status: "valid", label: `Valid for ${remaining}`, detail: `Expires in ${remaining}` };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}

function formatTimestamp(ts: unknown): string | null {
  if (typeof ts !== "number") return null;
  return new Date(ts * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "long",
  });
}

// ---------------------------------------------------------------------------
// JSON Syntax Highlighter
// ---------------------------------------------------------------------------

function SyntaxHighlightedJson({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data, null, 2);
  const tokens = tokenizeJson(json);

  return (
    <pre className="text-sm leading-relaxed overflow-x-auto whitespace-pre font-mono">
      {tokens.map((tok, i) => (
        <span key={i} className={tok.className}>
          {tok.text}
        </span>
      ))}
    </pre>
  );
}

interface Token {
  text: string;
  className: string;
}

function tokenizeJson(json: string): Token[] {
  const tokens: Token[] = [];
  // Regex to match JSON tokens: strings, numbers, booleans, null, braces/brackets, colons, commas
  const regex =
    /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\]:,])|(\s+)/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = regex.exec(json)) !== null) {
    // Capture any gap (shouldn't happen with well-formed JSON + whitespace match)
    if (match.index > lastIndex) {
      tokens.push({ text: json.slice(lastIndex, match.index), className: "text-slate-400" });
    }
    lastIndex = regex.lastIndex;

    if (match[1] !== undefined) {
      // Key (string followed by colon) — split into key and colon
      tokens.push({ text: match[1], className: "text-cyan-400" });
      // The captured group includes trailing spaces before colon — the regex captures `"key" :`
      // Actually let's just output the key match which is "key":
      const full = match[0];
      const afterKey = full.slice(match[1].length);
      tokens.push({ text: afterKey, className: "text-slate-500" });
    } else if (match[2] !== undefined) {
      // String value
      tokens.push({ text: match[2], className: "text-emerald-400" });
    } else if (match[3] !== undefined) {
      // Number
      tokens.push({ text: match[3], className: "text-amber-400" });
    } else if (match[4] !== undefined) {
      // Boolean
      tokens.push({ text: match[4], className: "text-violet-400" });
    } else if (match[5] !== undefined) {
      // Null
      tokens.push({ text: match[5], className: "text-rose-400" });
    } else if (match[6] !== undefined) {
      // Structural characters
      tokens.push({ text: match[6], className: "text-slate-500" });
    } else if (match[7] !== undefined) {
      // Whitespace
      tokens.push({ text: match[7], className: "" });
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Copy Button
// ---------------------------------------------------------------------------

function CopyButton({ text, label }: { text: string; label?: string }) {
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
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white
                 border border-slate-700/50 transition-all duration-200"
      title={label ? `Copy ${label}` : "Copy"}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>{label ?? "Copy"}</span>
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { data: decodeJwt(token), error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Invalid JWT" };
    }
  }, [token]);

  const expInfo = useMemo(() => {
    if (!decoded?.data) return null;
    return getExpirationInfo(decoded.data.payload);
  }, [decoded]);

  const handleLoadSample = useCallback(() => {
    setToken(makeSampleJwt());
  }, []);

  const handleClear = useCallback(() => {
    setToken("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Tools
          </a>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            100% Client-Side
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 mb-4">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              JWT Decoder
            </span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Paste a JSON Web Token to instantly decode and inspect the header, payload, and signature.
            Your tokens never leave your browser.
          </p>
        </div>

        {/* Input Section */}
        <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="jwt-input" className="text-sm font-medium text-slate-300">
              Encoded Token
            </label>
            <div className="flex items-center gap-2">
              {token.trim() && (
                <button
                  onClick={handleClear}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                           bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500
                           text-white hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sample JWT
              </button>
            </div>
          </div>

          {/* Color-coded token display */}
          {decoded?.data && (
            <div className="mb-3 rounded-xl bg-slate-950/60 border border-slate-800/40 p-4 overflow-x-auto">
              <code className="text-sm font-mono break-all leading-relaxed">
                <span className="text-rose-400">{decoded.data.rawParts[0]}</span>
                <span className="text-slate-600">.</span>
                <span className="text-violet-400">{decoded.data.rawParts[1]}</span>
                <span className="text-slate-600">.</span>
                <span className="text-emerald-400">{decoded.data.rawParts[2]}</span>
              </code>
            </div>
          )}

          <textarea
            id="jwt-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
            rows={4}
            spellCheck={false}
            className="w-full rounded-xl bg-slate-950/60 border border-slate-800/40 px-4 py-3
                       text-sm font-mono text-slate-200 placeholder-slate-600
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40
                       resize-y transition-all"
          />

          {/* Expiration banner */}
          {expInfo && (
            <div
              className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium border ${
                expInfo.status === "valid"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : expInfo.status === "expired"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-slate-800/50 border-slate-700/30 text-slate-400"
              }`}
            >
              {expInfo.status === "valid" && <ShieldCheck className="h-5 w-5 shrink-0" />}
              {expInfo.status === "expired" && <ShieldAlert className="h-5 w-5 shrink-0" />}
              {expInfo.status === "none" && <Clock className="h-5 w-5 shrink-0" />}
              <div>
                <span>{expInfo.label}</span>
                {expInfo.detail && (
                  <span className="ml-2 text-xs opacity-70">({expInfo.detail})</span>
                )}
              </div>
            </div>
          )}

          {/* Timestamp details */}
          {decoded?.data && (
            <div className="mt-3 flex flex-wrap gap-4">
              {decoded.data.payload.iat !== undefined && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>Issued: {formatTimestamp(decoded.data.payload.iat) ?? "Invalid"}</span>
                </div>
              )}
              {decoded.data.payload.exp !== undefined && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Timer className="h-3.5 w-3.5" />
                  <span>Expires: {formatTimestamp(decoded.data.payload.exp) ?? "Invalid"}</span>
                </div>
              )}
              {decoded.data.payload.nbf !== undefined && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Not Before: {formatTimestamp(decoded.data.payload.nbf) ?? "Invalid"}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {decoded?.error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-rose-300 mb-1">Invalid JWT</h3>
                <p className="text-sm text-rose-400/80">{decoded.error}</p>
                <p className="text-xs text-rose-400/50 mt-2">
                  A valid JWT has three base64url-encoded parts separated by dots: header.payload.signature
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Decoded Sections */}
        {decoded?.data && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Header */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
                    <FileJson className="h-4 w-4 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-rose-300">Header</h2>
                    <p className="text-xs text-slate-500">Algorithm &amp; token type</p>
                  </div>
                </div>
                <CopyButton
                  text={JSON.stringify(decoded.data.header, null, 2)}
                  label="Header"
                />
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/40 p-4">
                <SyntaxHighlightedJson data={decoded.data.header} />
              </div>
              {/* Quick badges for common header fields */}
              <div className="mt-3 flex flex-wrap gap-2">
                {decoded.data.header.alg != null && (
                  <span className="inline-flex items-center rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300">
                    alg: {String(decoded.data.header.alg)}
                  </span>
                )}
                {decoded.data.header.typ != null && (
                  <span className="inline-flex items-center rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300">
                    typ: {String(decoded.data.header.typ)}
                  </span>
                )}
                {decoded.data.header.kid != null && (
                  <span className="inline-flex items-center rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-300">
                    kid: {String(decoded.data.header.kid)}
                  </span>
                )}
              </div>
            </div>

            {/* Payload */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <FileJson className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-violet-300">Payload</h2>
                    <p className="text-xs text-slate-500">Claims &amp; data</p>
                  </div>
                </div>
                <CopyButton
                  text={JSON.stringify(decoded.data.payload, null, 2)}
                  label="Payload"
                />
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/40 p-4 max-h-80 overflow-y-auto">
                <SyntaxHighlightedJson data={decoded.data.payload} />
              </div>
              {/* Quick badges for registered claims */}
              <div className="mt-3 flex flex-wrap gap-2">
                {decoded.data.payload.iss != null && (
                  <span className="inline-flex items-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                    iss: {String(decoded.data.payload.iss)}
                  </span>
                )}
                {decoded.data.payload.sub != null && (
                  <span className="inline-flex items-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                    sub: {String(decoded.data.payload.sub)}
                  </span>
                )}
                {decoded.data.payload.aud != null && (
                  <span className="inline-flex items-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                    aud: {String(decoded.data.payload.aud)}
                  </span>
                )}
              </div>
            </div>

            {/* Signature — full width */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Fingerprint className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-emerald-300">Signature</h2>
                    <p className="text-xs text-slate-500">
                      {decoded.data.header.alg
                        ? `Signed with ${String(decoded.data.header.alg)}`
                        : "Verification data"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton
                    text={JSON.stringify(
                      { header: decoded.data.header, payload: decoded.data.payload },
                      null,
                      2
                    )}
                    label="Full JSON"
                  />
                  <CopyButton text={decoded.data.signature} label="Signature" />
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/40 p-4">
                <code className="text-sm font-mono text-emerald-400 break-all">
                  {decoded.data.signature}
                </code>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Signature verification requires the secret or public key and is not performed client-side.
                This tool only decodes the token structure.
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!token.trim() && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-800/50 border border-slate-700/30 mb-4">
              <KeyRound className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-slate-500 mb-1">Paste a JWT token above to decode it</p>
            <p className="text-xs text-slate-600">
              Or click{" "}
              <button onClick={handleLoadSample} className="text-cyan-500 hover:text-cyan-400 underline underline-offset-2">
                Sample JWT
              </button>{" "}
              to try it out
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>Tokens are decoded entirely in your browser. Nothing is sent to any server.</p>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero network requests</span>
          </div>
        </div>
      </footer>
      <ToolPageFooter toolId="jwt-decoder" />
    </div>
  );
}

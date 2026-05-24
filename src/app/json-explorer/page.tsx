"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { diffJson } from "diff";
import { ToolPageFooter } from "@/components/ToolPageFooter";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SAMPLE_JSON = `{
  "name": "DevToolBox",
  "version": "1.0.0",
  "tools": ["JSON Explorer", "Diff Checker", "Regex"],
  "config": {
    "theme": "dark",
    "autoFormat": true,
    "maxDepth": null
  },
  "stats": {
    "users": 15000,
    "rating": 4.9
  }
}`;

type Mode = "explorer" | "compare" | "convert";
type ConvertTab = "yaml" | "typescript" | "csv";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tryParse(raw: string): { data: unknown; error: string | null } {
  if (!raw.trim()) return { data: undefined, error: null };
  try {
    return { data: JSON.parse(raw), error: null };
  } catch (err) {
    const msg = err instanceof SyntaxError ? err.message : "Invalid JSON";
    // Attempt to extract line number from the error message
    const lineMatch = msg.match(/position\s+(\d+)/i);
    if (lineMatch) {
      const pos = Number(lineMatch[1]);
      const line = raw.slice(0, pos).split("\n").length;
      return { data: undefined, error: `${msg} (near line ${line})` };
    }
    return { data: undefined, error: msg };
  }
}

function formatJson(raw: string): string {
  const { data, error } = tryParse(raw);
  if (error || data === undefined) return raw;
  return JSON.stringify(data, null, 2);
}

function typeOf(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

// ---------------------------------------------------------------------------
// Stats helpers
// ---------------------------------------------------------------------------

interface JsonStats {
  totalKeys: number;
  maxDepth: number;
  types: Record<string, number>;
}

function computeStats(data: unknown): JsonStats {
  const types: Record<string, number> = {};
  let totalKeys = 0;

  function walk(node: unknown, depth: number): number {
    const t = typeOf(node);
    types[t] = (types[t] || 0) + 1;

    if (t === "object" && node !== null) {
      const obj = node as Record<string, unknown>;
      const keys = Object.keys(obj);
      totalKeys += keys.length;
      let maxChild = depth;
      for (const k of keys) {
        maxChild = Math.max(maxChild, walk(obj[k], depth + 1));
      }
      return maxChild;
    }
    if (t === "array") {
      const arr = node as unknown[];
      let maxChild = depth;
      for (const item of arr) {
        maxChild = Math.max(maxChild, walk(item, depth + 1));
      }
      return maxChild;
    }
    return depth;
  }

  const maxDepth = walk(data, 0);
  return { totalKeys, maxDepth, types };
}

// ---------------------------------------------------------------------------
// Convert helpers
// ---------------------------------------------------------------------------

function toYaml(data: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (data === null) return `${pad}null\n`;
  if (typeof data === "boolean") return `${pad}${data}\n`;
  if (typeof data === "number") return `${pad}${data}\n`;
  if (typeof data === "string") {
    if (data.includes("\n") || data.includes(":") || data.includes("#")) {
      return `${pad}"${data.replace(/"/g, '\\"')}"\n`;
    }
    return `${pad}${data}\n`;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return `${pad}[]\n`;
    return data.map((item) => {
      const val = toYaml(item, indent + 1).trimStart();
      return `${pad}- ${val}`;
    }).join("");
  }
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return `${pad}{}\n`;
    return entries.map(([key, val]) => {
      const t = typeOf(val);
      if (t === "object" || t === "array") {
        return `${pad}${key}:\n${toYaml(val, indent + 1)}`;
      }
      return `${pad}${key}: ${toYaml(val, 0).trim()}\n`;
    }).join("");
  }
  return `${pad}${String(data)}\n`;
}

function toTypeScript(data: unknown, name = "Root", indent = 0): string {
  const pad = "  ".repeat(indent);
  const innerPad = "  ".repeat(indent + 1);

  if (data === null || data === undefined) return "null";
  if (typeof data === "string") return "string";
  if (typeof data === "number") return "number";
  if (typeof data === "boolean") return "boolean";

  if (Array.isArray(data)) {
    if (data.length === 0) return "unknown[]";
    const itemType = toTypeScript(data[0], `${name}Item`, indent);
    // If it's a complex type, generate a named interface
    if (typeof data[0] === "object" && data[0] !== null && !Array.isArray(data[0])) {
      return `${name}Item[]`;
    }
    return `${itemType}[]`;
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    const lines = entries.map(([key, val]) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const childName = key.charAt(0).toUpperCase() + key.slice(1);
      const valType = toTypeScript(val, childName, indent + 1);
      return `${innerPad}${safeKey}: ${valType};`;
    });
    return `{\n${lines.join("\n")}\n${pad}}`;
  }

  return "unknown";
}

function generateTypeScriptInterfaces(data: unknown): string {
  if (typeof data !== "object" || data === null) {
    return `type Root = ${toTypeScript(data, "Root")};\n`;
  }

  const interfaces: string[] = [];

  function collectInterfaces(node: unknown, name: string) {
    if (typeof node !== "object" || node === null) return;

    if (Array.isArray(node)) {
      if (node.length > 0 && typeof node[0] === "object" && node[0] !== null && !Array.isArray(node[0])) {
        collectInterfaces(node[0], `${name}Item`);
      }
      return;
    }

    const entries = Object.entries(node as Record<string, unknown>);
    const lines = entries.map(([key, val]) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const childName = key.charAt(0).toUpperCase() + key.slice(1);

      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && !Array.isArray(val[0])) {
        collectInterfaces(val[0], `${childName}Item`);
        return `  ${safeKey}: ${childName}Item[];`;
      }
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        collectInterfaces(val, childName);
        return `  ${safeKey}: ${childName};`;
      }
      return `  ${safeKey}: ${toTypeScript(val, childName)};`;
    });

    interfaces.push(`interface ${name} {\n${lines.join("\n")}\n}`);
  }

  collectInterfaces(data, "Root");
  return interfaces.reverse().join("\n\n") + "\n";
}

function toCsv(data: unknown): string {
  if (!Array.isArray(data)) {
    return "// CSV conversion requires a JSON array of objects";
  }
  if (data.length === 0) return "// Empty array";

  // Gather all keys from all objects
  const keySet = new Set<string>();
  for (const item of data) {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      Object.keys(item as Record<string, unknown>).forEach((k) => keySet.add(k));
    }
  }

  if (keySet.size === 0) {
    return "// Array items are not objects — CSV requires an array of objects";
  }

  const keys = Array.from(keySet);
  const header = keys.map((k) => `"${k}"`).join(",");
  const rows = data.map((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return "";
    const obj = item as Record<string, unknown>;
    return keys.map((k) => {
      const v = obj[k];
      if (v === null || v === undefined) return "";
      if (typeof v === "string") return `"${v.replace(/"/g, '""')}"`;
      if (typeof v === "object") return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
      return String(v);
    }).join(",");
  });

  return [header, ...rows].join("\n");
}

// ---------------------------------------------------------------------------
// Copy-to-clipboard helper
// ---------------------------------------------------------------------------

function useCopyFeedback() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback for older browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        return; // clipboard not available
      }
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  return { copied, copy };
}

// ---------------------------------------------------------------------------
// Tree View — JsonNode
// ---------------------------------------------------------------------------

function JsonNode({
  keyName,
  value,
  path,
  depth,
  searchTerm,
  defaultExpanded,
  onCopyPath,
}: {
  keyName?: string;
  value: unknown;
  path: string;
  depth: number;
  searchTerm: string;
  defaultExpanded: boolean;
  onCopyPath: (p: string) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const t = typeOf(value);
  const isExpandable = t === "object" || t === "array";

  // Re-expand when search changes
  useEffect(() => {
    if (searchTerm) setExpanded(true);
  }, [searchTerm]);

  const matchesSearch =
    searchTerm &&
    ((keyName && keyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (!isExpandable &&
        String(value).toLowerCase().includes(searchTerm.toLowerCase())));

  const valueColor = (() => {
    switch (t) {
      case "string":
        return "text-emerald-400";
      case "number":
        return "text-cyan-400";
      case "boolean":
        return "text-purple-400";
      case "null":
        return "text-red-400";
      default:
        return "text-slate-300";
    }
  })();

  const renderValue = () => {
    if (t === "string") return <span className={valueColor}>&quot;{String(value)}&quot;</span>;
    if (t === "null") return <span className={valueColor}>null</span>;
    if (t === "boolean") return <span className={valueColor}>{String(value)}</span>;
    if (t === "number") return <span className={valueColor}>{String(value)}</span>;
    return null;
  };

  const summary = (() => {
    if (t === "array") return <span className="text-slate-500 text-xs ml-1">[{(value as unknown[]).length} items]</span>;
    if (t === "object" && value !== null) return <span className="text-slate-500 text-xs ml-1">{`{${Object.keys(value as Record<string, unknown>).length} keys}`}</span>;
    return null;
  })();

  const children = (() => {
    if (!isExpandable || !expanded) return null;
    if (t === "array") {
      return (value as unknown[]).map((item, i) => (
        <JsonNode
          key={i}
          keyName={String(i)}
          value={item}
          path={`${path}[${i}]`}
          depth={depth + 1}
          searchTerm={searchTerm}
          defaultExpanded={depth < 1}
          onCopyPath={onCopyPath}
        />
      ));
    }
    if (t === "object" && value !== null) {
      return Object.entries(value as Record<string, unknown>).map(([k, v]) => (
        <JsonNode
          key={k}
          keyName={k}
          value={v}
          path={path ? `${path}.${k}` : k}
          depth={depth + 1}
          searchTerm={searchTerm}
          defaultExpanded={depth < 1}
          onCopyPath={onCopyPath}
        />
      ));
    }
    return null;
  })();

  return (
    <div className={`${depth > 0 ? "ml-4 pl-3 border-l border-slate-700/60" : ""}`}>
      <div
        className={`flex items-center gap-1.5 py-0.5 group rounded-md px-1 -ml-1 transition-colors ${
          matchesSearch ? "bg-yellow-500/10 ring-1 ring-yellow-500/30" : "hover:bg-slate-800/50"
        }`}
      >
        {/* expand toggle */}
        {isExpandable ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-transform shrink-0"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* key */}
        {keyName !== undefined && (
          <button
            onClick={() => onCopyPath(path)}
            className="text-slate-300 hover:text-blue-400 transition-colors cursor-pointer shrink-0"
            title={`Copy path: ${path}`}
          >
            {keyName}
            <span className="text-slate-600">:</span>
          </button>
        )}

        {/* value or summary */}
        {isExpandable ? summary : (
          <span className="font-mono text-sm">{renderValue()}</span>
        )}

        {/* copy path on hover */}
        {keyName !== undefined && (
          <span className="ml-auto text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity select-none">
            {path}
          </span>
        )}
      </div>

      {/* children */}
      {expanded && children && (
        <div className="animate-in">{children}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compare View
// ---------------------------------------------------------------------------

function CompareView() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [result, setResult] = useState<{ added?: boolean; removed?: boolean; value: string }[] | null>(null);
  const [error, setError] = useState("");

  const handleCompare = () => {
    setError("");
    const lp = tryParse(left);
    const rp = tryParse(right);
    if (lp.error) {
      setError(`Left JSON: ${lp.error}`);
      return;
    }
    if (rp.error) {
      setError(`Right JSON: ${rp.error}`);
      return;
    }
    if (!left.trim() || !right.trim()) {
      setError("Please paste JSON in both panels.");
      return;
    }
    const changes = diffJson(lp.data as object, rp.data as object);
    setResult(changes as { added?: boolean; removed?: boolean; value: string }[]);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="code-input flex-1 min-h-[200px]"
            placeholder='Paste original JSON here...'
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Modified</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            className="code-input flex-1 min-h-[200px]"
            placeholder='Paste modified JSON here...'
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleCompare} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-2 transition font-medium text-sm">
          Compare
        </button>
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>

      {result && (
        <div className="glass-card p-4 overflow-auto max-h-[400px] font-mono text-sm leading-relaxed">
          {result.map((part, i) => {
            const bg = part.added
              ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
              : part.removed
                ? "bg-red-500/10 text-red-400 border-l-2 border-red-500 line-through"
                : "text-slate-400";
            return (
              <div key={i} className={`${bg} px-3 py-0.5 whitespace-pre-wrap`}>
                {part.added && <span className="text-emerald-600 mr-2 select-none">+</span>}
                {part.removed && <span className="text-red-600 mr-2 select-none">-</span>}
                {part.value}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Convert View
// ---------------------------------------------------------------------------

function ConvertView({ data, raw }: { data: unknown; raw: string }) {
  const [tab, setTab] = useState<ConvertTab>("yaml");
  const { copied, copy } = useCopyFeedback();

  const output = useMemo(() => {
    if (data === undefined) return "// Paste valid JSON in the left panel first";
    switch (tab) {
      case "yaml":
        return toYaml(data).trimEnd();
      case "typescript":
        return generateTypeScriptInterfaces(data).trimEnd();
      case "csv":
        return toCsv(data);
      default:
        return "";
    }
  }, [data, tab]);

  const tabs: { key: ConvertTab; label: string }[] = [
    { key: "yaml", label: "YAML" },
    { key: "typescript", label: "TypeScript" },
    { key: "csv", label: "CSV" },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/50"
                : "bg-slate-800/50 text-slate-400 hover:text-slate-300 border border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}

        <button
          onClick={() => copy(output)}
          className="ml-auto bg-slate-800/70 hover:bg-slate-700/70 text-slate-300 rounded-lg px-3 py-1.5 text-sm transition flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="glass-card p-4 overflow-auto flex-1 min-h-[200px] font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Bar
// ---------------------------------------------------------------------------

function StatsBar({ stats }: { stats: JsonStats | null }) {
  if (!stats) return null;

  const typeEntries = Object.entries(stats.types).filter(([t]) => t !== "object" && t !== "array");

  return (
    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <span><strong className="text-slate-400">{stats.totalKeys}</strong> keys</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span>depth <strong className="text-slate-400">{stats.maxDepth}</strong></span>
      </div>
      <span className="text-slate-700">|</span>
      {typeEntries.map(([t, count]) => {
        const color = (() => {
          switch (t) {
            case "string": return "text-emerald-500";
            case "number": return "text-cyan-500";
            case "boolean": return "text-purple-500";
            case "null": return "text-red-500";
            default: return "text-slate-500";
          }
        })();
        return (
          <span key={t} className={color}>
            {count} {t}{count !== 1 ? "s" : ""}
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function JsonExplorerPage() {
  const [raw, setRaw] = useState("");
  const [mode, setMode] = useState<Mode>("explorer");
  const [searchTerm, setSearchTerm] = useState("");
  const { copied, copy } = useCopyFeedback();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, error } = useMemo(() => tryParse(raw), [raw]);
  const stats = useMemo(() => (data !== undefined ? computeStats(data) : null), [data]);

  const handleFormat = () => {
    setRaw(formatJson(raw));
  };

  const handleClear = () => {
    setRaw("");
    setSearchTerm("");
    textareaRef.current?.focus();
  };

  const handleCopyPath = useCallback(
    (path: string) => {
      copy(path);
    },
    [copy]
  );

  const modes: { key: Mode; label: string; icon: React.ReactNode }[] = [
    {
      key: "explorer",
      label: "Explorer",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      key: "compare",
      label: "Compare",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
    },
    {
      key: "convert",
      label: "Convert",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-slate-400 hover:text-slate-200 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <h1 className="text-lg font-semibold tracking-tight">
              <span className="glow-text">JSON Explorer</span>
            </h1>
          </div>

          {/* Mode tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 border border-slate-800/40">
            {modes.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m.key
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-sm shadow-blue-500/10"
                    : "bg-transparent text-slate-400 hover:text-slate-300 border border-transparent"
                }`}
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 gap-4 min-h-0">
        {/* Compare mode — standalone full-width */}
        {mode === "compare" && (
          <CompareView />
        )}

        {/* Explorer & Convert modes share the two-panel layout */}
        {mode !== "compare" && (
          <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
            {/* Left panel — Input */}
            <div className="lg:w-[420px] flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  JSON Input
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFormat}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1 text-xs font-medium transition"
                  >
                    Format
                  </button>
                  <button
                    onClick={handleClear}
                    className="bg-slate-800/70 hover:bg-slate-700/70 text-slate-400 hover:text-slate-300 rounded-lg px-3 py-1 text-xs font-medium transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                className="code-input flex-1 min-h-[300px]"
                placeholder={SAMPLE_JSON}
                spellCheck={false}
              />

              {/* Error display */}
              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* Stats */}
              {stats && <StatsBar stats={stats} />}
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">
              {mode === "explorer" && (
                <>
                  {/* Search */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800/50 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
                      placeholder="Search keys or values..."
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Tree */}
                  <div className="glass-card p-4 flex-1 overflow-auto min-h-[300px]">
                    {data === undefined && !error && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                        <p className="text-sm">Paste JSON to explore</p>
                      </div>
                    )}
                    {data !== undefined && (
                      <JsonNode
                        value={data}
                        path="$"
                        depth={0}
                        searchTerm={searchTerm}
                        defaultExpanded={true}
                        onCopyPath={handleCopyPath}
                      />
                    )}
                  </div>

                  {/* Copy path feedback */}
                  {copied && (
                    <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-emerald-400 shadow-xl shadow-black/30 flex items-center gap-2 animate-in z-50">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Path copied to clipboard
                    </div>
                  )}
                </>
              )}

              {mode === "convert" && <ConvertView data={data} raw={raw} />}
            </div>
          </div>
        )}
      </main>
      <ToolPageFooter toolId="json-explorer" />
    </div>
  );
}

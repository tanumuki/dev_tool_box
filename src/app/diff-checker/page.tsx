"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { diffLines, diffChars, Change } from "diff";
import { ToolPageFooter } from "@/components/ToolPageFooter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "side-by-side" | "inline" | "json";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  value: string;
}

interface SideBySidePair {
  left: { lineNo: number | null; value: string; type: "removed" | "unchanged" | "empty" };
  right: { lineNo: number | null; value: string; type: "added" | "unchanged" | "empty" };
}

interface JsonDiffEntry {
  path: string;
  type: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
}

// ---------------------------------------------------------------------------
// Sample Data
// ---------------------------------------------------------------------------

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie"];

for (let i = 0; i < users.length; i++) {
  greet(users[i]);
}`;

const SAMPLE_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return { success: true, name };
}

const users = ["Alice", "Bob", "Charlie", "Diana"];

users.forEach((user) => {
  greet(user);
});

// Added a new helper
function farewell(name) {
  console.log("Goodbye, " + name);
}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripTrailingNewline(s: string): string {
  return s.endsWith("\n") ? s.slice(0, -1) : s;
}

function splitLines(value: string): string[] {
  const stripped = stripTrailingNewline(value);
  return stripped === "" ? [] : stripped.split("\n");
}

/** Build aligned side-by-side pairs from diff changes. */
function buildSideBySide(changes: Change[]): SideBySidePair[] {
  const pairs: SideBySidePair[] = [];
  let leftNo = 1;
  let rightNo = 1;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];

    if (!change.added && !change.removed) {
      // Unchanged block
      const lines = splitLines(change.value);
      for (const line of lines) {
        pairs.push({
          left: { lineNo: leftNo++, value: line, type: "unchanged" },
          right: { lineNo: rightNo++, value: line, type: "unchanged" },
        });
      }
      i++;
    } else if (change.removed && i + 1 < changes.length && changes[i + 1].added) {
      // Removed + Added block (modifications)
      const removedLines = splitLines(change.value);
      const addedLines = splitLines(changes[i + 1].value);
      const maxLen = Math.max(removedLines.length, addedLines.length);

      for (let j = 0; j < maxLen; j++) {
        pairs.push({
          left: j < removedLines.length
            ? { lineNo: leftNo++, value: removedLines[j], type: "removed" }
            : { lineNo: null, value: "", type: "empty" },
          right: j < addedLines.length
            ? { lineNo: rightNo++, value: addedLines[j], type: "added" }
            : { lineNo: null, value: "", type: "empty" },
        });
      }
      i += 2;
    } else if (change.removed) {
      const lines = splitLines(change.value);
      for (const line of lines) {
        pairs.push({
          left: { lineNo: leftNo++, value: line, type: "removed" },
          right: { lineNo: null, value: "", type: "empty" },
        });
      }
      i++;
    } else if (change.added) {
      const lines = splitLines(change.value);
      for (const line of lines) {
        pairs.push({
          left: { lineNo: null, value: "", type: "empty" },
          right: { lineNo: rightNo++, value: line, type: "added" },
        });
      }
      i++;
    } else {
      i++;
    }
  }
  return pairs;
}

/** Inline diff lines from changes. */
function buildInlineLines(changes: Change[]): DiffLine[] {
  const lines: DiffLine[] = [];
  for (const change of changes) {
    const type: DiffLine["type"] = change.added ? "added" : change.removed ? "removed" : "unchanged";
    const rawLines = splitLines(change.value);
    for (const line of rawLines) {
      lines.push({ type, value: line });
    }
  }
  return lines;
}

/** Character-level diff fragments for intra-line highlighting. */
function charDiff(a: string, b: string): { left: Change[]; right: Change[] } {
  const parts = diffChars(a, b);
  const left: Change[] = [];
  const right: Change[] = [];
  for (const p of parts) {
    if (p.added) {
      right.push(p);
    } else if (p.removed) {
      left.push(p);
    } else {
      left.push(p);
      right.push(p);
    }
  }
  return { left, right };
}

/** Deep structural JSON diff. */
function deepJsonDiff(
  a: unknown,
  b: unknown,
  path: string = "$"
): JsonDiffEntry[] {
  const entries: JsonDiffEntry[] = [];

  if (a === b) return entries;
  if (a === null || b === null || typeof a !== typeof b) {
    entries.push({ path, type: "changed", oldValue: a, newValue: b });
    return entries;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) {
        entries.push({ path: p, type: "added", newValue: b[i] });
      } else if (i >= b.length) {
        entries.push({ path: p, type: "removed", oldValue: a[i] });
      } else {
        entries.push(...deepJsonDiff(a[i], b[i], p));
      }
    }
    return entries;
  }

  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
    for (const key of Array.from(allKeys).sort()) {
      const p = `${path}.${key}`;
      if (!(key in aObj)) {
        entries.push({ path: p, type: "added", newValue: bObj[key] });
      } else if (!(key in bObj)) {
        entries.push({ path: p, type: "removed", oldValue: aObj[key] });
      } else {
        entries.push(...deepJsonDiff(aObj[key], bObj[key], p));
      }
    }
    return entries;
  }

  // Primitive mismatch
  if (a !== b) {
    entries.push({ path, type: "changed", oldValue: a, newValue: b });
  }
  return entries;
}

/** Generate unified diff text. */
function unifiedDiff(original: string, modified: string): string {
  const changes = diffLines(original, modified);
  const lines: string[] = ["--- Original", "+++ Modified"];
  for (const c of changes) {
    const raw = splitLines(c.value);
    for (const l of raw) {
      if (c.added) lines.push(`+${l}`);
      else if (c.removed) lines.push(`-${l}`);
      else lines.push(` ${l}`);
    }
  }
  return lines.join("\n");
}

/** Render character-level diff fragments as JSX spans. */
function CharHighlight({
  fragments,
  side,
}: {
  fragments: Change[];
  side: "left" | "right";
}) {
  return (
    <>
      {fragments.map((f, i) => {
        const isHighlight = side === "left" ? f.removed : f.added;
        return (
          <span
            key={i}
            className={
              isHighlight
                ? side === "left"
                  ? "bg-red-400/30 rounded-sm"
                  : "bg-emerald-400/30 rounded-sm"
                : ""
            }
          >
            {f.value}
          </span>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatBar({
  additions,
  deletions,
  modifications,
  similarity,
}: {
  additions: number;
  deletions: number;
  modifications: number;
  similarity: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl text-sm font-mono">
      <span className="flex items-center gap-2 text-emerald-400">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
        +{additions} addition{additions !== 1 && "s"}
      </span>
      <span className="flex items-center gap-2 text-red-400">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
        -{deletions} deletion{deletions !== 1 && "s"}
      </span>
      <span className="flex items-center gap-2 text-yellow-300">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" />
        ~{modifications} modification{modifications !== 1 && "s"}
      </span>
      <span className="ml-auto text-slate-400">
        {similarity.toFixed(1)}% similar
      </span>
    </div>
  );
}

function SideBySideView({
  pairs,
  changes,
}: {
  pairs: SideBySidePair[];
  changes: Change[];
}) {
  // Build a map from removed/added line pairs for char-level highlight.
  // We pair consecutive removed+added blocks.
  const charDiffs = useMemo(() => {
    const map = new Map<number, { left: Change[]; right: Change[] }>();
    let pairIdx = 0;
    let ci = 0;
    while (ci < changes.length) {
      const c = changes[ci];
      if (c.removed && ci + 1 < changes.length && changes[ci + 1].added) {
        const removedLines = splitLines(c.value);
        const addedLines = splitLines(changes[ci + 1].value);
        const minLen = Math.min(removedLines.length, addedLines.length);
        // Find the starting pairIdx for this block
        let searchIdx = pairIdx;
        while (searchIdx < pairs.length) {
          if (pairs[searchIdx].left.type === "removed") break;
          searchIdx++;
        }
        for (let j = 0; j < minLen; j++) {
          const cd = charDiff(removedLines[j], addedLines[j]);
          map.set(searchIdx + j, cd);
        }
        pairIdx = searchIdx + Math.max(removedLines.length, addedLines.length);
        ci += 2;
      } else {
        const lines = splitLines(c.value);
        // Advance pairIdx past unchanged/pure add/pure remove
        let searchIdx = pairIdx;
        for (let j = 0; j < lines.length && searchIdx < pairs.length; j++) {
          searchIdx++;
        }
        pairIdx = searchIdx;
        ci++;
      }
    }
    return map;
  }, [pairs, changes]);

  const lineNoWidth = "w-12";

  const renderCell = (
    cell: SideBySidePair["left"] | SideBySidePair["right"],
    side: "left" | "right",
    pairIndex: number
  ) => {
    const bgClass =
      cell.type === "removed"
        ? "bg-red-500/10"
        : cell.type === "added"
        ? "bg-emerald-500/10"
        : cell.type === "empty"
        ? "bg-slate-900/30"
        : "";
    const textClass =
      cell.type === "removed"
        ? "text-red-300"
        : cell.type === "added"
        ? "text-emerald-300"
        : cell.type === "empty"
        ? ""
        : "text-slate-300";
    const borderClass =
      cell.type === "removed"
        ? "border-l-2 border-l-red-500"
        : cell.type === "added"
        ? "border-l-2 border-l-emerald-500"
        : "border-l-2 border-l-transparent";

    const cd = charDiffs.get(pairIndex);

    return (
      <div
        className={`flex min-h-[1.625rem] ${bgClass} ${borderClass} group`}
      >
        <span
          className={`${lineNoWidth} shrink-0 text-right pr-3 select-none text-slate-600 text-xs leading-[1.625rem]`}
        >
          {cell.lineNo ?? ""}
        </span>
        <span
          className={`flex-1 px-3 font-mono text-sm leading-[1.625rem] whitespace-pre ${textClass}`}
        >
          {cd && cell.type !== "empty" && cell.type !== "unchanged" ? (
            <CharHighlight
              fragments={side === "left" ? cd.left : cd.right}
              side={side}
            />
          ) : (
            cell.value
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-px bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-800/50">
      {/* Headers */}
      <div className="px-4 py-2 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Original
      </div>
      <div className="px-4 py-2 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Modified
      </div>

      {/* Lines */}
      <div className="bg-slate-950/60 overflow-x-auto">
        {pairs.map((pair, i) => (
          <div key={`l-${i}`}>{renderCell(pair.left, "left", i)}</div>
        ))}
      </div>
      <div className="bg-slate-950/60 overflow-x-auto">
        {pairs.map((pair, i) => (
          <div key={`r-${i}`}>{renderCell(pair.right, "right", i)}</div>
        ))}
      </div>
    </div>
  );
}

function InlineView({ lines }: { lines: DiffLine[] }) {
  let leftNo = 0;
  let rightNo = 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800/50 bg-slate-950/60">
      <div className="px-4 py-2 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Unified Diff
      </div>
      {lines.map((line, i) => {
        if (line.type === "unchanged") {
          leftNo++;
          rightNo++;
        } else if (line.type === "removed") {
          leftNo++;
        } else {
          rightNo++;
        }

        const bgClass =
          line.type === "added"
            ? "bg-emerald-500/10"
            : line.type === "removed"
            ? "bg-red-500/10"
            : "";
        const textClass =
          line.type === "added"
            ? "text-emerald-300"
            : line.type === "removed"
            ? "text-red-300"
            : "text-slate-300";
        const borderClass =
          line.type === "added"
            ? "border-l-2 border-l-emerald-500"
            : line.type === "removed"
            ? "border-l-2 border-l-red-500"
            : "border-l-2 border-l-transparent";
        const prefix =
          line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

        return (
          <div
            key={i}
            className={`flex min-h-[1.625rem] ${bgClass} ${borderClass}`}
          >
            <span className="w-12 shrink-0 text-right pr-2 select-none text-slate-600 text-xs leading-[1.625rem]">
              {line.type !== "added" ? leftNo : ""}
            </span>
            <span className="w-12 shrink-0 text-right pr-2 select-none text-slate-600 text-xs leading-[1.625rem]">
              {line.type !== "removed" ? rightNo : ""}
            </span>
            <span className="w-5 shrink-0 text-center select-none text-slate-500 text-xs leading-[1.625rem]">
              {prefix}
            </span>
            <span
              className={`flex-1 px-3 font-mono text-sm leading-[1.625rem] whitespace-pre ${textClass}`}
            >
              {line.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function JsonDiffView({ entries }: { entries: JsonDiffEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
        No structural differences found. The JSON objects are equivalent.
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800/50 bg-slate-950/60">
      <div className="px-4 py-2 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Structural JSON Diff
      </div>
      <div className="divide-y divide-slate-800/40">
        {entries.map((entry, i) => {
          const bgClass =
            entry.type === "added"
              ? "bg-emerald-500/5"
              : entry.type === "removed"
              ? "bg-red-500/5"
              : "bg-yellow-500/5";
          const dotColor =
            entry.type === "added"
              ? "bg-emerald-500"
              : entry.type === "removed"
              ? "bg-red-500"
              : "bg-yellow-500";
          const labelColor =
            entry.type === "added"
              ? "text-emerald-400"
              : entry.type === "removed"
              ? "text-red-400"
              : "text-yellow-300";
          const borderClass =
            entry.type === "added"
              ? "border-l-2 border-l-emerald-500"
              : entry.type === "removed"
              ? "border-l-2 border-l-red-500"
              : "border-l-2 border-l-yellow-500";

          return (
            <div
              key={i}
              className={`px-5 py-3 ${bgClass} ${borderClass} flex flex-col gap-1`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                <span className="font-mono text-sm text-blue-300">
                  {entry.path}
                </span>
                <span
                  className={`ml-2 text-xs font-semibold uppercase ${labelColor}`}
                >
                  {entry.type}
                </span>
              </div>
              <div className="pl-4 font-mono text-xs flex flex-col gap-0.5">
                {entry.type === "removed" && (
                  <span className="text-red-300">
                    - {JSON.stringify(entry.oldValue)}
                  </span>
                )}
                {entry.type === "added" && (
                  <span className="text-emerald-300">
                    + {JSON.stringify(entry.newValue)}
                  </span>
                )}
                {entry.type === "changed" && (
                  <>
                    <span className="text-red-300">
                      - {JSON.stringify(entry.oldValue)}
                    </span>
                    <span className="text-emerald-300">
                      + {JSON.stringify(entry.newValue)}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons (inline SVG to avoid external deps)
// ---------------------------------------------------------------------------

function ArrowsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.75A2.25 2.25 0 0 1 14.75 19h-9.5A2.25 2.25 0 0 1 3 16.75V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 0 1 9 1h2c1.373 0 2.531.923 2.887 2.182ZM7.5 4A1.5 1.5 0 0 1 9 2.5h2A1.5 1.5 0 0 1 12.5 4v.5h-5V4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DiffCheckerPage() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [hasCompared, setHasCompared] = useState(false);
  const [copied, setCopied] = useState(false);

  // Store the text used for the last comparison so that editing textareas
  // doesn't immediately change the diff output.
  const [compOriginal, setCompOriginal] = useState("");
  const [compModified, setCompModified] = useState("");

  const leftRef = useRef<HTMLTextAreaElement>(null);
  const rightRef = useRef<HTMLTextAreaElement>(null);

  // ---------- Derived diff data ----------

  const changes = useMemo(
    () => (hasCompared ? diffLines(compOriginal, compModified) : []),
    [hasCompared, compOriginal, compModified]
  );

  const sideBySidePairs = useMemo(
    () => (hasCompared ? buildSideBySide(changes) : []),
    [hasCompared, changes]
  );

  const inlineLines = useMemo(
    () => (hasCompared ? buildInlineLines(changes) : []),
    [hasCompared, changes]
  );

  const jsonDiffEntries = useMemo<JsonDiffEntry[] | string>(() => {
    if (!hasCompared || viewMode !== "json") return [];
    try {
      const a = JSON.parse(compOriginal);
      const b = JSON.parse(compModified);
      return deepJsonDiff(a, b);
    } catch (e) {
      return (e as Error).message;
    }
  }, [hasCompared, viewMode, compOriginal, compModified]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    let modifications = 0;
    let unchangedChars = 0;
    let totalChars = 0;

    let i = 0;
    while (i < changes.length) {
      const c = changes[i];
      const lineCount = splitLines(c.value).length;

      if (c.removed && i + 1 < changes.length && changes[i + 1].added) {
        const removedCount = splitLines(c.value).length;
        const addedCount = splitLines(changes[i + 1].value).length;
        const modifiedCount = Math.min(removedCount, addedCount);
        modifications += modifiedCount;
        deletions += Math.max(0, removedCount - modifiedCount);
        additions += Math.max(0, addedCount - modifiedCount);
        totalChars += c.value.length + changes[i + 1].value.length;
        i += 2;
      } else if (c.added) {
        additions += lineCount;
        totalChars += c.value.length;
        i++;
      } else if (c.removed) {
        deletions += lineCount;
        totalChars += c.value.length;
        i++;
      } else {
        unchangedChars += c.value.length;
        totalChars += c.value.length;
        i++;
      }
    }

    const similarity = totalChars > 0 ? (unchangedChars / totalChars) * 100 : 100;
    return { additions, deletions, modifications, similarity };
  }, [changes]);

  // ---------- Handlers ----------

  const handleCompare = useCallback(() => {
    setCompOriginal(original);
    setCompModified(modified);
    setHasCompared(true);
  }, [original, modified]);

  const handleSwap = useCallback(() => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  }, [original, modified]);

  const handleClear = useCallback(() => {
    setOriginal("");
    setModified("");
    setHasCompared(false);
    setCompOriginal("");
    setCompModified("");
  }, []);

  const handleSample = useCallback(() => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
    setHasCompared(false);
  }, []);

  const handleCopyDiff = useCallback(async () => {
    try {
      const text = unifiedDiff(compOriginal, compModified);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — silently ignore
    }
  }, [compOriginal, compModified]);

  // ---------- View mode tabs ----------

  const viewTabs: { id: ViewMode; label: string }[] = [
    { id: "side-by-side", label: "Side by Side" },
    { id: "inline", label: "Inline" },
    { id: "json", label: "JSON Diff" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold">
              D
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Diff Checker
              </h1>
              <p className="text-xs text-slate-500">
                Compare text, code & JSON side by side
              </p>
            </div>
          </div>

          {/* View mode tabs */}
          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/50 rounded-xl p-1">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === tab.id
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col gap-5">
        {/* Input area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Original
            </label>
            <textarea
              ref={leftRef}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste original text here..."
              spellCheck={false}
              className="w-full h-64 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl px-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Modified */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Modified
            </label>
            <textarea
              ref={rightRef}
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="Paste modified text here..."
              spellCheck={false}
              className="w-full h-64 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl px-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleCompare}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl px-8 py-2.5 text-sm shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-500/30 active:scale-[0.98]"
          >
            Compare
          </button>
          <button
            onClick={handleSwap}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl px-4 py-2 text-sm transition-all"
          >
            <ArrowsIcon /> Swap
          </button>
          <button
            onClick={handleCopyDiff}
            disabled={!hasCompared}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl px-4 py-2 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ClipboardIcon /> {copied ? "Copied!" : "Copy Diff"}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl px-4 py-2 text-sm transition-all"
          >
            <TrashIcon /> Clear
          </button>
          <button
            onClick={handleSample}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl px-4 py-2 text-sm transition-all"
          >
            <SparklesIcon /> Sample
          </button>
        </div>

        {/* Results */}
        {hasCompared && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats */}
            <StatBar
              additions={stats.additions}
              deletions={stats.deletions}
              modifications={stats.modifications}
              similarity={stats.similarity}
            />

            {/* Diff output */}
            {viewMode === "side-by-side" && (
              <SideBySideView pairs={sideBySidePairs} changes={changes} />
            )}
            {viewMode === "inline" && <InlineView lines={inlineLines} />}
            {viewMode === "json" && (
              <>
                {typeof jsonDiffEntries === "string" ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-300 text-sm font-mono">
                    JSON parse error: {jsonDiffEntries}
                  </div>
                ) : (
                  <JsonDiffView entries={jsonDiffEntries} />
                )}
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasCompared && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-12 h-12 text-slate-700"
            >
              <path
                fillRule="evenodd"
                d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm">
              Paste text on both sides and click{" "}
              <span className="text-blue-400 font-medium">Compare</span> to see
              differences
            </p>
            <p className="text-xs text-slate-700">
              Or click <span className="text-slate-500">Sample</span> to load example data
            </p>
          </div>
        )}
      </main>
      <ToolPageFooter toolId="diff-checker" />
    </div>
  );
}

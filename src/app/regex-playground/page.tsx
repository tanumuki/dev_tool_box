"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ToolPageFooter } from "@/components/ToolPageFooter";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

interface MatchResult {
  fullMatch: string;
  index: number;
  groups: { label: string; value: string }[];
}

interface PatternEntry {
  label: string;
  pattern: string;
  flags: string;
  testString: string;
}

interface ExplainerToken {
  token: string;
  description: string;
}

/* ──────────────────────────────────────────────
   Pattern Library
   ────────────────────────────────────────────── */

const PATTERN_LIBRARY: PatternEntry[] = [
  {
    label: "Email",
    pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    testString:
      "Contact us at hello@example.com or support@dev-tools.co.uk for help.",
  },
  {
    label: "URL",
    pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*",
    flags: "g",
    testString:
      "Visit https://example.com/path?q=1 or http://dev.io for more info.",
  },
  {
    label: "Phone (US)",
    pattern: "\\(?[0-9]{3}\\)?[\\-.\\s]?[0-9]{3}[\\-.\\s]?[0-9]{4}",
    flags: "g",
    testString: "Call (555) 123-4567 or 555.987.6543 or 555-000-1111 today.",
  },
  {
    label: "Phone (India)",
    pattern: "(\\+91[\\-\\s]?)?[0]?(91)?[6-9]\\d{9}",
    flags: "g",
    testString:
      "Reach us at +91 9876543210 or 08765432109 or 7012345678 anytime.",
  },
  {
    label: "IP Address",
    pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b",
    flags: "g",
    testString:
      "Server is at 192.168.1.1, backup at 10.0.0.255, gateway 172.16.0.1.",
  },
  {
    label: "Date (YYYY-MM-DD)",
    pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
    flags: "g",
    testString: "Events on 2026-01-15, 2026-12-31, and 2026-06-09 are booked.",
  },
  {
    label: "Hex Color",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}",
    flags: "g",
    testString:
      "Brand colors are #ff6600, #09f, and #1a2b3c. Invalid: #xyz, #12.",
  },
  {
    label: "UUID",
    pattern:
      "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    flags: "gi",
    testString:
      "ID: 550e8400-e29b-41d4-a716-446655440000 and 6ba7b810-9dad-11d1-80b4-00c04fd430c8.",
  },
];

/* ──────────────────────────────────────────────
   Regex Explainer  (hand-written parser)
   ────────────────────────────────────────────── */

function explainRegex(pattern: string): ExplainerToken[] {
  const tokens: ExplainerToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    // ── Character classes ─────────────────────
    if (ch === "[") {
      const close = findClosingBracket(pattern, i);
      const cls = pattern.slice(i, close + 1);
      i = close + 1;
      // Handle quantifier after class
      const q = consumeQuantifier(pattern, i);
      i = q.next;
      tokens.push({
        token: cls + q.quantifier,
        description: describeCharClass(cls) + (q.desc ? " " + q.desc : ""),
      });
      continue;
    }

    // ── Groups ────────────────────────────────
    if (ch === "(") {
      // Detect group type
      let groupType = "capturing group";
      let prefix = "(";
      let look = i + 1;

      if (pattern[look] === "?") {
        if (pattern[look + 1] === ":") {
          groupType = "non-capturing group";
          prefix = "(?:";
          look = i + 3;
        } else if (pattern[look + 1] === "=") {
          groupType = "positive lookahead";
          prefix = "(?=";
          look = i + 3;
        } else if (pattern[look + 1] === "!") {
          groupType = "negative lookahead";
          prefix = "(?!";
          look = i + 3;
        } else if (
          pattern[look + 1] === "<" &&
          pattern[look + 2] === "="
        ) {
          groupType = "positive lookbehind";
          prefix = "(?<=";
          look = i + 4;
        } else if (
          pattern[look + 1] === "<" &&
          pattern[look + 2] === "!"
        ) {
          groupType = "negative lookbehind";
          prefix = "(?<!";
          look = i + 4;
        } else if (
          pattern[look + 1] === "<" &&
          pattern[look + 2] !== "=" &&
          pattern[look + 2] !== "!"
        ) {
          // Named group (?<name>...)
          const nameEnd = pattern.indexOf(">", look + 2);
          if (nameEnd !== -1) {
            const name = pattern.slice(look + 2, nameEnd);
            groupType = `named capturing group "${name}"`;
            prefix = pattern.slice(i, nameEnd + 1);
            look = nameEnd + 1;
          }
        }
      }

      // Find the matching closing paren
      const closeIdx = findClosingParen(pattern, i);
      const inner = pattern.slice(look, closeIdx);
      const full = pattern.slice(i, closeIdx + 1);
      i = closeIdx + 1;
      const q = consumeQuantifier(pattern, i);
      i = q.next;

      tokens.push({
        token: full + q.quantifier,
        description:
          `${groupType} containing "${inner}"` +
          (q.desc ? " " + q.desc : ""),
      });
      continue;
    }

    // ── Escape sequences ──────────────────────
    if (ch === "\\") {
      const next = pattern[i + 1] || "";
      let token = "\\" + next;
      let desc = "";

      switch (next) {
        case "d":
          desc = "digit (0-9)";
          break;
        case "D":
          desc = "non-digit";
          break;
        case "w":
          desc = "word character (a-z, A-Z, 0-9, _)";
          break;
        case "W":
          desc = "non-word character";
          break;
        case "s":
          desc = "whitespace (space, tab, newline)";
          break;
        case "S":
          desc = "non-whitespace";
          break;
        case "b":
          desc = "word boundary";
          break;
        case "B":
          desc = "non-word boundary";
          break;
        case "n":
          desc = "newline";
          break;
        case "r":
          desc = "carriage return";
          break;
        case "t":
          desc = "tab";
          break;
        case "0":
          desc = "null character";
          break;
        case ".":
          desc = 'literal "."';
          break;
        case "/":
          desc = 'literal "/"';
          break;
        case "\\":
          desc = 'literal "\\"';
          break;
        case "(":
          desc = 'literal "("';
          break;
        case ")":
          desc = 'literal ")"';
          break;
        case "[":
          desc = 'literal "["';
          break;
        case "]":
          desc = 'literal "]"';
          break;
        case "{":
          desc = 'literal "{"';
          break;
        case "}":
          desc = 'literal "}"';
          break;
        case "+":
          desc = 'literal "+"';
          break;
        case "*":
          desc = 'literal "*"';
          break;
        case "?":
          desc = 'literal "?"';
          break;
        case "^":
          desc = 'literal "^"';
          break;
        case "$":
          desc = 'literal "$"';
          break;
        case "|":
          desc = 'literal "|"';
          break;
        case "-":
          desc = 'literal "-"';
          break;
        default:
          if (/[1-9]/.test(next)) {
            desc = `backreference to group ${next}`;
          } else {
            desc = `literal "${next}"`;
          }
      }

      i += 2;
      const q = consumeQuantifier(pattern, i);
      i = q.next;
      tokens.push({
        token: token + q.quantifier,
        description: desc + (q.desc ? " " + q.desc : ""),
      });
      continue;
    }

    // ── Anchors ───────────────────────────────
    if (ch === "^") {
      tokens.push({ token: "^", description: "start of string" });
      i++;
      continue;
    }
    if (ch === "$") {
      tokens.push({ token: "$", description: "end of string" });
      i++;
      continue;
    }

    // ── Alternation ───────────────────────────
    if (ch === "|") {
      tokens.push({ token: "|", description: "or" });
      i++;
      continue;
    }

    // ── Dot ───────────────────────────────────
    if (ch === ".") {
      i++;
      const q = consumeQuantifier(pattern, i);
      i = q.next;
      tokens.push({
        token: "." + q.quantifier,
        description:
          "any character except newline" + (q.desc ? " " + q.desc : ""),
      });
      continue;
    }

    // ── Literal character ─────────────────────
    i++;
    const q = consumeQuantifier(pattern, i);
    i = q.next;
    tokens.push({
      token: ch + q.quantifier,
      description:
        `literal "${ch}"` + (q.desc ? " " + q.desc : ""),
    });
  }

  return tokens;
}

function consumeQuantifier(
  pattern: string,
  i: number
): { quantifier: string; desc: string; next: number } {
  if (i >= pattern.length)
    return { quantifier: "", desc: "", next: i };

  let quantifier = "";
  let desc = "";

  const ch = pattern[i];

  if (ch === "+") {
    quantifier = "+";
    desc = "(one or more)";
    i++;
  } else if (ch === "*") {
    quantifier = "*";
    desc = "(zero or more)";
    i++;
  } else if (ch === "?") {
    quantifier = "?";
    desc = "(optional)";
    i++;
  } else if (ch === "{") {
    const close = pattern.indexOf("}", i);
    if (close !== -1) {
      quantifier = pattern.slice(i, close + 1);
      const inner = pattern.slice(i + 1, close);
      if (inner.includes(",")) {
        const [min, max] = inner.split(",");
        if (max === "") {
          desc = `(${min} or more times)`;
        } else {
          desc = `(between ${min} and ${max} times)`;
        }
      } else {
        desc = `(exactly ${inner} times)`;
      }
      i = close + 1;
    }
  }

  // Lazy modifier
  if (i < pattern.length && pattern[i] === "?" && quantifier) {
    quantifier += "?";
    desc = desc.replace(")", ", lazy)");
    i++;
  }

  return { quantifier, desc, next: i };
}

function findClosingBracket(pattern: string, start: number): number {
  let i = start + 1;
  // First char after [ can be ] and it's literal
  if (i < pattern.length && pattern[i] === "^") i++;
  if (i < pattern.length && pattern[i] === "]") i++;
  while (i < pattern.length) {
    if (pattern[i] === "\\" && i + 1 < pattern.length) {
      i += 2;
      continue;
    }
    if (pattern[i] === "]") return i;
    i++;
  }
  return pattern.length - 1;
}

function findClosingParen(pattern: string, start: number): number {
  let depth = 1;
  let i = start + 1;
  while (i < pattern.length && depth > 0) {
    if (pattern[i] === "\\" && i + 1 < pattern.length) {
      i += 2;
      continue;
    }
    if (pattern[i] === "(") depth++;
    if (pattern[i] === ")") depth--;
    if (depth === 0) return i;
    i++;
  }
  return pattern.length - 1;
}

function describeCharClass(cls: string): string {
  const inner = cls.slice(1, -1); // strip [ and ]
  let negated = false;
  let body = inner;
  if (body.startsWith("^")) {
    negated = true;
    body = body.slice(1);
  }

  // Try to give a human-friendly description for common patterns
  const wellKnown: Record<string, string> = {
    "a-z": "lowercase letter",
    "A-Z": "uppercase letter",
    "0-9": "digit",
    "a-zA-Z": "any letter",
    "a-zA-Z0-9": "any alphanumeric character",
    "a-zA-Z0-9_": "word character",
    "\\s": "whitespace",
    "\\d": "digit",
    "\\w": "word character",
  };

  const prefix = negated ? "any character NOT in" : "any character in";

  if (wellKnown[body]) {
    return negated ? `not a ${wellKnown[body]}` : wellKnown[body];
  }

  return `${prefix} [${body}]`;
}

/* ──────────────────────────────────────────────
   Code Generator
   ────────────────────────────────────────────── */

function generateCode(
  lang: string,
  pattern: string,
  flags: string,
  testStr: string
): string {
  // Escape for embedding in string literals
  const jsEsc = pattern.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const pyEsc = pattern.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const javaEsc = pattern.replace(/\\/g, "\\\\\\\\").replace(/"/g, '\\"');
  const goEsc = pattern.replace(/\\/g, "\\\\").replace(/`/g, "` + \"`\" + `");
  const testEsc = testStr.replace(/\n/g, "\\n").replace(/'/g, "\\'").replace(/"/g, '\\"');

  switch (lang) {
    case "javascript":
      return `const regex = /${pattern}/${flags};
const text = '${testEsc}';

// Find all matches
const matches = [...text.matchAll(new RegExp(regex.source, '${flags.includes("g") ? flags : "g" + flags}'))];

for (const match of matches) {
  console.log('Match:', match[0], 'at index:', match.index);
  match.slice(1).forEach((group, i) => {
    if (group !== undefined) {
      console.log(\`  Group \${i + 1}:\`, group);
    }
  });
}`;

    case "python":
      return `import re

pattern = r'${pyEsc}'
text = '${testEsc}'
flags = ${pythonFlags(flags)}

# Find all matches
for match in re.finditer(pattern, text${flags ? ", flags" : ""}):
    print(f"Match: {match.group()} at index: {match.start()}")
    for i, group in enumerate(match.groups(), 1):
        if group is not None:
            print(f"  Group {i}: {group}")`;

    case "java":
      return `import java.util.regex.*;

public class RegexDemo {
    public static void main(String[] args) {
        String pattern = "${javaEsc}";
        String text = "${testEsc}";
        int flags = ${javaFlags(flags)};

        Pattern p = Pattern.compile(pattern${flags ? ", flags" : ""});
        Matcher m = p.matcher(text);

        while (m.find()) {
            System.out.println("Match: " + m.group() + " at index: " + m.start());
            for (int i = 1; i <= m.groupCount(); i++) {
                if (m.group(i) != null) {
                    System.out.println("  Group " + i + ": " + m.group(i));
                }
            }
        }
    }
}`;

    case "go":
      return `package main

import (
\t"fmt"
\t"regexp"
)

func main() {
\tpattern := \`${flags.includes("i") ? "(?i)" : ""}${goEsc}\`
\ttext := \`${testStr.replace(/`/g, "` + \"`\" + `")}\`

\tre := regexp.MustCompile(pattern)
\tmatches := re.FindAllStringSubmatchIndex(text, -1)

\tfor _, loc := range matches {
\t\tfmt.Printf("Match: %s at index: %d\\n", text[loc[0]:loc[1]], loc[0])
\t\tfor i := 2; i < len(loc); i += 2 {
\t\t\tif loc[i] >= 0 {
\t\t\t\tfmt.Printf("  Group %d: %s\\n", i/2, text[loc[i]:loc[i+1]])
\t\t\t}
\t\t}
\t}
}`;

    default:
      return "";
  }
}

function pythonFlags(flags: string): string {
  const parts: string[] = [];
  if (flags.includes("i")) parts.push("re.IGNORECASE");
  if (flags.includes("m")) parts.push("re.MULTILINE");
  if (flags.includes("s")) parts.push("re.DOTALL");
  if (flags.includes("u")) parts.push("re.UNICODE");
  return parts.length ? parts.join(" | ") : "0";
}

function javaFlags(flags: string): string {
  const parts: string[] = [];
  if (flags.includes("i")) parts.push("Pattern.CASE_INSENSITIVE");
  if (flags.includes("m")) parts.push("Pattern.MULTILINE");
  if (flags.includes("s")) parts.push("Pattern.DOTALL");
  if (flags.includes("u")) parts.push("Pattern.UNICODE_CHARACTER_CLASS");
  return parts.length ? parts.join(" | ") : "0";
}

/* ──────────────────────────────────────────────
   Highlighted Text Builder
   ────────────────────────────────────────────── */

const GROUP_COLORS = [
  { bg: "rgba(59,130,246,0.30)", border: "rgba(59,130,246,0.50)" }, // full match — blue
  { bg: "rgba(16,185,129,0.30)", border: "rgba(16,185,129,0.50)" }, // group 1 — emerald
  { bg: "rgba(168,85,247,0.30)", border: "rgba(168,85,247,0.50)" }, // group 2 — purple
  { bg: "rgba(245,158,11,0.30)", border: "rgba(245,158,11,0.50)" }, // group 3 — amber
  { bg: "rgba(236,72,153,0.30)", border: "rgba(236,72,153,0.50)" }, // group 4 — pink
];

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function RegexPlayground() {
  const [pattern, setPattern] = useState("(\\w+)@([\\w.-]+)");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState(
    "Send mail to alice@example.com and bob@dev-tools.co.uk for details."
  );
  const [activeMatch, setActiveMatch] = useState<number | null>(null);
  const [codeLang, setCodeLang] = useState("javascript");
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"matches" | "explainer" | "codegen">("matches");

  const testAreaRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // ── Build regex safely ──────────────────────
  const { regex, error } = useMemo(() => {
    try {
      const r = new RegExp(pattern, flags);
      return { regex: r, error: null };
    } catch (e: unknown) {
      return {
        regex: null,
        error: e instanceof Error ? e.message : "Invalid regex",
      };
    }
  }, [pattern, flags]);

  // ── Compute matches ─────────────────────────
  const matches: MatchResult[] = useMemo(() => {
    if (!regex || !testString) return [];
    const results: MatchResult[] = [];
    try {
      if (flags.includes("g")) {
        const re = new RegExp(regex.source, regex.flags);
        let m: RegExpExecArray | null;
        let safety = 0;
        while ((m = re.exec(testString)) !== null && safety < 10000) {
          safety++;
          const groups: { label: string; value: string }[] = [];
          for (let gi = 1; gi < m.length; gi++) {
            if (m[gi] !== undefined) {
              groups.push({ label: `Group ${gi}`, value: m[gi] });
            }
          }
          results.push({ fullMatch: m[0], index: m.index, groups });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        const m = regex.exec(testString);
        if (m) {
          const groups: { label: string; value: string }[] = [];
          for (let gi = 1; gi < m.length; gi++) {
            if (m[gi] !== undefined) {
              groups.push({ label: `Group ${gi}`, value: m[gi] });
            }
          }
          results.push({ fullMatch: m[0], index: m.index, groups });
        }
      }
    } catch {
      // silently fail
    }
    return results;
  }, [regex, flags, testString]);

  // ── Explainer tokens ────────────────────────
  const explainerTokens = useMemo(() => {
    if (!pattern) return [];
    return explainRegex(pattern);
  }, [pattern]);

  // ── Build highlighted HTML spans ────────────
  const highlightedSegments = useMemo(() => {
    if (!matches.length || !testString) {
      return [{ text: testString, matchIdx: -1, groupIdx: -1 }];
    }

    type Segment = { text: string; matchIdx: number; groupIdx: number };
    const segments: Segment[] = [];
    let lastEnd = 0;

    for (let mi = 0; mi < matches.length; mi++) {
      const m = matches[mi];
      if (m.index > lastEnd) {
        segments.push({
          text: testString.slice(lastEnd, m.index),
          matchIdx: -1,
          groupIdx: -1,
        });
      }
      segments.push({
        text: m.fullMatch,
        matchIdx: mi,
        groupIdx: 0, // full match color
      });
      lastEnd = m.index + m.fullMatch.length;
    }
    if (lastEnd < testString.length) {
      segments.push({
        text: testString.slice(lastEnd),
        matchIdx: -1,
        groupIdx: -1,
      });
    }
    return segments;
  }, [matches, testString]);

  // ── Toggle a flag ───────────────────────────
  const toggleFlag = useCallback(
    (flag: string) => {
      setFlags((prev) =>
        prev.includes(flag)
          ? prev.replace(flag, "")
          : prev + flag
      );
    },
    []
  );

  // ── Load a pattern ──────────────────────────
  const loadPattern = useCallback((entry: PatternEntry) => {
    setPattern(entry.pattern);
    setFlags(entry.flags);
    setTestString(entry.testString);
    setSidebarOpen(false);
    setActiveMatch(null);
  }, []);

  // ── Scroll to match in test area ────────────
  const scrollToMatch = useCallback((idx: number) => {
    setActiveMatch(idx);
    const el = matchRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // ── Copy code to clipboard ──────────────────
  const copyCode = useCallback(() => {
    const code = generateCode(codeLang, pattern, flags, testString);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [codeLang, pattern, flags, testString]);

  // ── Reset matchRefs when matches change ─────
  useEffect(() => {
    matchRefs.current = matchRefs.current.slice(0, matches.length);
  }, [matches.length]);

  const FLAG_OPTIONS = ["g", "i", "m", "s", "u"] as const;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      {/* ── Header ─────────────────────────────── */}
      <header className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-slate-400 transition-colors hover:text-slate-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </a>
            <h1 className="text-lg font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Regex Playground
              </span>
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-slate-600 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Pattern Library
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-[1440px] gap-0">
        {/* ── Pattern Library Sidebar ──────────── */}
        <aside
          className={`${
            sidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0 pointer-events-none"
          } fixed left-0 top-0 z-50 h-full w-80 border-r border-slate-800/50 bg-[#030712]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out lg:static lg:z-auto lg:h-auto lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto ${
            sidebarOpen ? "" : "lg:hidden"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/50 px-4 py-4 lg:hidden">
            <h2 className="text-sm font-semibold text-slate-200">
              Pattern Library
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 60px)" }}>
            <h2 className="mb-3 hidden text-sm font-semibold text-slate-400 uppercase tracking-wider lg:block">
              Pattern Library
            </h2>
            <div className="space-y-2">
              {PATTERN_LIBRARY.map((entry) => (
                <button
                  key={entry.label}
                  onClick={() => loadPattern(entry)}
                  className="group flex w-full flex-col items-start gap-1 rounded-xl border border-slate-800/50 bg-slate-900/40 px-3 py-2.5 text-left transition-all hover:border-slate-700 hover:bg-slate-800/60"
                >
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                    {entry.label}
                  </span>
                  <code className="max-w-full truncate text-xs text-slate-500 font-mono">
                    /{entry.pattern}/{entry.flags}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Backdrop for mobile sidebar ──────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main Content ─────────────────────── */}
        <main className="flex-1 p-4 md:p-6">
          {/* ── Regex Input ──────────────────────── */}
          <div className="mb-5 rounded-2xl border border-slate-800/50 bg-slate-900/60 p-4 backdrop-blur-xl">
            <label className="mb-2 block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Regular Expression
            </label>
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-700/50 bg-slate-950/60 px-3 py-2 transition-colors focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10">
                <span className="select-none text-lg font-mono text-slate-500">
                  /
                </span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-2 text-lg font-mono text-slate-100 placeholder:text-slate-600 outline-none"
                  placeholder="Enter regex..."
                  spellCheck={false}
                />
                <span className="select-none text-lg font-mono text-slate-500">
                  /
                </span>
                <span className="ml-1 select-none font-mono text-lg text-blue-400">
                  {flags}
                </span>
              </div>
            </div>

            {/* ── Flags ────────────────────────────── */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Flags:</span>
              {FLAG_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFlag(f)}
                  className={`rounded-full px-3 py-1 text-xs font-mono font-semibold transition-all ${
                    flags.includes(f)
                      ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40"
                      : "bg-slate-800/50 text-slate-500 ring-1 ring-slate-700/30 hover:text-slate-300"
                  }`}
                >
                  {f}
                </button>
              ))}
              <span className="ml-2 text-xs text-slate-600">
                {flags.includes("g") && "global "}
                {flags.includes("i") && "case-insensitive "}
                {flags.includes("m") && "multiline "}
                {flags.includes("s") && "dotAll "}
                {flags.includes("u") && "unicode "}
              </span>
            </div>

            {/* ── Error ────────────────────────────── */}
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* ── Two-column layout ──────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* ── Test String ────────────────────── */}
            <div className="flex flex-col rounded-2xl border border-slate-800/50 bg-slate-900/60 p-4 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Test String
                </label>
                {matches.length > 0 && (
                  <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                    {matches.length} match{matches.length !== 1 ? "es" : ""}
                  </span>
                )}
              </div>

              {/* ── Editable textarea ──────────────── */}
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="code-input mb-3 min-h-[120px] w-full flex-shrink-0"
                placeholder="Type or paste test string..."
                spellCheck={false}
              />

              {/* ── Highlighted preview ────────────── */}
              <label className="mb-1 text-xs text-slate-500">
                Highlighted Preview
              </label>
              <div
                ref={testAreaRef}
                className="min-h-[100px] max-h-[260px] overflow-auto rounded-xl border border-slate-800/40 bg-slate-950/50 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all"
              >
                {highlightedSegments.map((seg, si) =>
                  seg.matchIdx >= 0 ? (
                    <span
                      key={si}
                      ref={(el) => {
                        matchRefs.current[seg.matchIdx] = el;
                      }}
                      style={{
                        backgroundColor:
                          activeMatch === seg.matchIdx
                            ? GROUP_COLORS[0].border
                            : GROUP_COLORS[0].bg,
                        borderBottom: `2px solid ${GROUP_COLORS[0].border}`,
                        borderRadius: "2px",
                        padding: "0 1px",
                        transition: "background-color 0.2s",
                      }}
                      className="cursor-pointer"
                      onClick={() => scrollToMatch(seg.matchIdx)}
                    >
                      {seg.text}
                    </span>
                  ) : (
                    <span key={si} className="text-slate-400">
                      {seg.text}
                    </span>
                  )
                )}
                {!testString && (
                  <span className="text-slate-600">
                    Matches will be highlighted here...
                  </span>
                )}
              </div>
            </div>

            {/* ── Right Panel (Tabs) ─────────────── */}
            <div className="flex flex-col rounded-2xl border border-slate-800/50 bg-slate-900/60 backdrop-blur-xl">
              {/* ── Tab Bar ────────────────────────── */}
              <div className="flex border-b border-slate-800/50">
                {(
                  [
                    { key: "matches", label: "Matches" },
                    { key: "explainer", label: "Explainer" },
                    { key: "codegen", label: "Code Gen" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "border-b-2 border-blue-400 text-blue-300"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Matches Tab ────────────────────── */}
              {activeTab === "matches" && (
                <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "520px" }}>
                  {matches.length === 0 ? (
                    <div className="flex h-full items-center justify-center py-12 text-sm text-slate-600">
                      {error
                        ? "Fix the regex error above to see matches."
                        : pattern
                          ? "No matches found."
                          : "Enter a regex to start matching."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {matches.map((m, mi) => (
                        <button
                          key={mi}
                          onClick={() => scrollToMatch(mi)}
                          className={`w-full rounded-xl border p-3 text-left transition-all ${
                            activeMatch === mi
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-slate-800/40 bg-slate-800/20 hover:border-slate-700/50 hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-xs text-slate-500">
                                Match {mi + 1}
                              </span>
                              <div className="mt-0.5 truncate font-mono text-sm text-slate-200">
                                &quot;{m.fullMatch}&quot;
                              </div>
                            </div>
                            <span className="flex-shrink-0 rounded bg-slate-800/60 px-1.5 py-0.5 text-xs text-slate-500 font-mono">
                              idx {m.index}
                            </span>
                          </div>
                          {m.groups.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {m.groups.map((g, gi) => (
                                <div
                                  key={gi}
                                  className="flex items-center gap-2"
                                >
                                  <span
                                    className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        GROUP_COLORS[
                                          Math.min(gi + 1, GROUP_COLORS.length - 1)
                                        ].border,
                                    }}
                                  />
                                  <span className="text-xs text-slate-500">
                                    {g.label}:
                                  </span>
                                  <span className="truncate font-mono text-xs text-slate-300">
                                    {g.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Explainer Tab ──────────────────── */}
              {activeTab === "explainer" && (
                <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "520px" }}>
                  {!pattern ? (
                    <div className="flex h-full items-center justify-center py-12 text-sm text-slate-600">
                      Enter a regex to see its explanation.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {explainerTokens.map((t, ti) => (
                        <div
                          key={ti}
                          className="flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-800/30"
                        >
                          <code className="flex-shrink-0 rounded bg-slate-800/60 px-2 py-0.5 font-mono text-sm text-blue-300 border border-slate-700/30">
                            {t.token}
                          </code>
                          <span className="text-sm text-slate-400 pt-0.5">
                            {t.description}
                          </span>
                        </div>
                      ))}
                      {flags && (
                        <div className="mt-4 border-t border-slate-800/40 pt-3">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Flags
                          </span>
                          <div className="mt-1.5 space-y-1">
                            {flags.split("").map((f) => (
                              <div
                                key={f}
                                className="flex items-start gap-3 rounded-lg px-2 py-1.5"
                              >
                                <code className="flex-shrink-0 rounded bg-blue-500/15 px-2 py-0.5 font-mono text-sm text-blue-300 border border-blue-500/20">
                                  {f}
                                </code>
                                <span className="text-sm text-slate-400 pt-0.5">
                                  {f === "g" && "global — find all matches, not just the first"}
                                  {f === "i" && "case-insensitive — ignore upper/lowercase differences"}
                                  {f === "m" && "multiline — ^ and $ match line boundaries, not just string boundaries"}
                                  {f === "s" && "dotAll — . matches newline characters too"}
                                  {f === "u" && "unicode — enable full Unicode matching"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Code Gen Tab ───────────────────── */}
              {activeTab === "codegen" && (
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: "520px" }}>
                  {/* Language tabs */}
                  <div className="flex border-b border-slate-800/40 px-4">
                    {(
                      [
                        { key: "javascript", label: "JavaScript" },
                        { key: "python", label: "Python" },
                        { key: "java", label: "Java" },
                        { key: "go", label: "Go" },
                      ] as const
                    ).map((lang) => (
                      <button
                        key={lang.key}
                        onClick={() => setCodeLang(lang.key)}
                        className={`px-3 py-2 text-xs font-medium transition-colors ${
                          codeLang === lang.key
                            ? "border-b-2 border-emerald-400 text-emerald-300"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  {/* Code block */}
                  <div className="relative p-4">
                    <button
                      onClick={copyCode}
                      className="absolute right-5 top-5 z-10 rounded-lg border border-slate-700/50 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-400 transition-all hover:border-slate-600 hover:text-white"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <pre className="overflow-x-auto rounded-xl border border-slate-800/40 bg-slate-950/60 p-4 font-mono text-sm leading-relaxed text-slate-300">
                      <code>
                        {generateCode(codeLang, pattern, flags, testString)}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ToolPageFooter toolId="regex-playground" />
    </div>
  );
}

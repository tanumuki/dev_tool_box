"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { ToolPageFooter } from "@/components/ToolPageFooter";
import {
  Eye,
  EyeOff,
  Columns2,
  Copy,
  Check,
  Download,
  FileText,
  Type,
  Hash,
  Code2,
  ArrowLeft,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "split" | "editor" | "preview";

// ---------------------------------------------------------------------------
// Sample Markdown
// ---------------------------------------------------------------------------

const SAMPLE_MARKDOWN = `# Markdown Preview

Welcome to the **Markdown Preview** tool! This example showcases all supported syntax.

---

## Text Formatting

You can write **bold text**, *italic text*, ~~strikethrough~~, and \`inline code\`.

Combine them: **_bold and italic_**, ~~**bold strikethrough**~~.

## Links & Images

Visit [DevToolBox](https://devtoolbox.dev) for more tools.

![Placeholder Image](https://placehold.co/600x200/1e293b/67e8f9?text=Markdown+Preview)

## Lists

### Unordered List
- First item
- Second item with **bold**
- Third item
  - Nested item
  - Another nested item

### Ordered List
1. Step one
2. Step two
3. Step three

## Blockquotes

> "The best way to predict the future is to invent it."
>
> — Alan Kay

> Blockquotes can contain **formatted text** and \`code\`.

## Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { success: true };
}

greet("World");
\`\`\`

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
\`\`\`

## Headings Showcase

### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

## Horizontal Rules

Use three dashes or asterisks:

---

***

## Paragraphs

This is the first paragraph. It has multiple sentences to demonstrate how paragraph text renders with proper spacing and line height.

This is a second paragraph separated by a blank line. The preview should show clear visual separation between paragraphs.

---

*Built with zero dependencies. 100% client-side.*
`;

// ---------------------------------------------------------------------------
// Custom Markdown Parser
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseInline(text: string): string {
  let result = text;

  // Images: ![alt](url) — must come before links
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="md-image" />'
  );

  // Links: [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="md-link" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Inline code: `code` — must come before bold/italic to avoid conflicts
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="md-inline-code">$1</code>'
  );

  // Bold + Italic: ***text*** or ___text___
  result = result.replace(
    /\*\*\*(.+?)\*\*\*/g,
    "<strong><em>$1</em></strong>"
  );
  result = result.replace(
    /___(.+?)___/g,
    "<strong><em>$1</em></strong>"
  );

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_ (but not inside words for underscore)
  result = result.replace(
    /\*(.+?)\*/g,
    "<em>$1</em>"
  );
  result = result.replace(
    /(?<!\w)_(.+?)_(?!\w)/g,
    "<em>$1</em>"
  );

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");

  return result;
}

function parseMarkdown(source: string): string {
  // First, escape HTML in the raw source to prevent XSS
  const escaped = escapeHtml(source);

  const lines = escaped.split("\n");
  const htmlParts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // --- Code blocks (``` ... ```) ---
    const codeBlockMatch = line.match(/^```(\w*)\s*$/);
    if (codeBlockMatch) {
      const lang = codeBlockMatch[1] || "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const langLabel = lang
        ? `<div class="md-code-lang">${lang}</div>`
        : "";
      htmlParts.push(
        `<div class="md-code-block">${langLabel}<pre><code>${codeLines.join(
          "\n"
        )}</code></pre></div>`
      );
      continue;
    }

    // --- Horizontal rules ---
    if (/^(\-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      htmlParts.push('<hr class="md-hr" />');
      i++;
      continue;
    }

    // --- Headings ---
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = parseInline(headingMatch[2]);
      htmlParts.push(`<h${level} class="md-h${level}">${content}</h${level}>`);
      i++;
      continue;
    }

    // --- Blockquotes ---
    if (line.startsWith("&gt; ") || line === "&gt;") {
      const quoteLines: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("&gt; ") || lines[i] === "&gt;")
      ) {
        const content = lines[i] === "&gt;" ? "" : lines[i].slice(5);
        quoteLines.push(content);
        i++;
      }
      const quoteHtml = quoteLines
        .map((l) => (l.trim() === "" ? "<br/>" : `<p>${parseInline(l)}</p>`))
        .join("");
      htmlParts.push(`<blockquote class="md-blockquote">${quoteHtml}</blockquote>`);
      continue;
    }

    // --- Unordered lists (- or *) ---
    if (/^(\s*)[-*]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^(\s*)[-*]\s+/.test(lines[i])) {
        const itemMatch = lines[i].match(/^(\s*)[-*]\s+(.+)$/);
        if (itemMatch) {
          const indent = itemMatch[1].length;
          const content = parseInline(itemMatch[2]);
          if (indent >= 2) {
            // Nested item — append to previous item
            const lastIdx = listItems.length - 1;
            if (lastIdx >= 0) {
              listItems[lastIdx] += `<ul class="md-ul md-nested"><li>${content}</li></ul>`;
            } else {
              listItems.push(`<li>${content}</li>`);
            }
          } else {
            listItems.push(`<li>${content}</li>`);
          }
        }
        i++;
      }
      htmlParts.push(`<ul class="md-ul">${listItems.join("")}</ul>`);
      continue;
    }

    // --- Ordered lists ---
    if (/^\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const itemMatch = lines[i].match(/^\d+\.\s+(.+)$/);
        if (itemMatch) {
          listItems.push(`<li>${parseInline(itemMatch[1])}</li>`);
        }
        i++;
      }
      htmlParts.push(`<ol class="md-ol">${listItems.join("")}</ol>`);
      continue;
    }

    // --- Blank lines ---
    if (line.trim() === "") {
      i++;
      continue;
    }

    // --- Paragraphs (collect consecutive non-blank, non-special lines) ---
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,6}\s+/) &&
      !lines[i].match(/^```/) &&
      !lines[i].match(/^(\-{3,}|\*{3,}|_{3,})\s*$/) &&
      !lines[i].startsWith("&gt; ") &&
      lines[i] !== "&gt;" &&
      !/^(\s*)[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      htmlParts.push(
        `<p class="md-p">${parseInline(paraLines.join(" "))}</p>`
      );
    }
  }

  return htmlParts.join("\n");
}

// ---------------------------------------------------------------------------
// Markdown-to-plain-text for word counting (strip all markdown syntax)
// ---------------------------------------------------------------------------

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/---+|===+|\*\*\*+/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // -- Derived values -------------------------------------------------------

  const renderedHtml = useMemo(() => parseMarkdown(markdown), [markdown]);

  const wordCount = useMemo(() => {
    const plain = stripMarkdown(markdown);
    if (!plain) return 0;
    return plain.split(/\s+/).filter(Boolean).length;
  }, [markdown]);

  const charCount = markdown.length;

  // -- Handlers -------------------------------------------------------------

  const handleCopySource = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  }, [markdown]);

  const handleCopyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(renderedHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  }, [renderedHtml]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  const handleLoadSample = useCallback(() => {
    setMarkdown(SAMPLE_MARKDOWN);
  }, []);

  // -- View mode buttons ----------------------------------------------------

  const viewButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "split", icon: <Columns2 size={16} />, label: "Split" },
    { mode: "editor", icon: <Code2 size={16} />, label: "Editor" },
    { mode: "preview", icon: <Eye size={16} />, label: "Preview" },
  ];

  // -- Render ---------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </a>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500">
                <FileText size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">
                Markdown Preview
              </h1>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border border-slate-700/60 bg-slate-800/40 p-0.5">
              {viewButtons.map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <button
              onClick={handleCopySource}
              disabled={!markdown}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copy Markdown source"
            >
              {copiedSource ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span className="hidden sm:inline">
                {copiedSource ? "Copied!" : "Copy MD"}
              </span>
            </button>

            <button
              onClick={handleCopyHtml}
              disabled={!markdown}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copy rendered HTML"
            >
              {copiedHtml ? <Check size={14} className="text-emerald-400" /> : <Code2 size={14} />}
              <span className="hidden sm:inline">
                {copiedHtml ? "Copied!" : "Copy HTML"}
              </span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!markdown}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Download as .md"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:brightness-110 transition"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Sample</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="border-b border-slate-800/40 bg-slate-900/40">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 py-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Type size={12} />
            {wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Hash size={12} />
            {charCount.toLocaleString()} char{charCount !== 1 ? "s" : ""}
          </span>
          {!markdown && (
            <span className="text-slate-600 italic">
              Start typing or load a sample to begin...
            </span>
          )}
        </div>
      </div>

      {/* Main content area */}
      <main className="mx-auto max-w-[1800px] px-4 sm:px-6 py-4 flex-1">
        <div
          className={`grid gap-4 ${
            viewMode === "split"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1"
          }`}
          style={{ minHeight: "calc(100vh - 160px)" }}
        >
          {/* Editor panel */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Code2 size={14} />
                  Editor
                </h2>
                {viewMode === "editor" && (
                  <button
                    onClick={() => setViewMode("preview")}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Eye size={12} />
                    Show Preview
                  </button>
                )}
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your Markdown here..."
                spellCheck={false}
                className="flex-1 w-full resize-none rounded-xl border border-slate-700/40 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                style={{ minHeight: viewMode === "editor" ? "70vh" : "50vh" }}
              />
            </div>
          )}

          {/* Preview panel */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Eye size={14} />
                  Preview
                </h2>
                {viewMode === "preview" && (
                  <button
                    onClick={() => setViewMode("editor")}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <EyeOff size={12} />
                    Show Editor
                  </button>
                )}
              </div>
              <div
                className="flex-1 overflow-auto rounded-xl border border-slate-700/40 bg-slate-950/40 px-6 py-4 md-preview"
                style={{ minHeight: viewMode === "preview" ? "70vh" : "50vh" }}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          )}
        </div>
      </main>

      {/* --------------- Preview Typography Styles --------------- */}
      <style jsx global>{`
        /* Headings */
        .md-preview .md-h1 {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 0.75rem;
          color: #f1f5f9;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          padding-bottom: 0.5rem;
        }
        .md-preview .md-h2 {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 1.4rem 0 0.6rem;
          color: #f1f5f9;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          padding-bottom: 0.4rem;
        }
        .md-preview .md-h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1.2rem 0 0.5rem;
          color: #e2e8f0;
        }
        .md-preview .md-h4 {
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.4rem;
          color: #e2e8f0;
        }
        .md-preview .md-h5 {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.5;
          margin: 0.8rem 0 0.3rem;
          color: #cbd5e1;
        }
        .md-preview .md-h6 {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.5;
          margin: 0.8rem 0 0.3rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Paragraphs */
        .md-preview .md-p {
          font-size: 0.9375rem;
          line-height: 1.75;
          margin: 0.6rem 0;
          color: #cbd5e1;
        }

        /* Links */
        .md-preview .md-link {
          color: #67e8f9;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s;
        }
        .md-preview .md-link:hover {
          color: #a5f3fc;
        }

        /* Images */
        .md-preview .md-image {
          max-width: 100%;
          border-radius: 0.75rem;
          margin: 1rem 0;
          border: 1px solid rgba(148, 163, 184, 0.15);
        }

        /* Inline code */
        .md-preview .md-inline-code {
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          color: #7dd3fc;
          padding: 0.125rem 0.375rem;
          border-radius: 0.375rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          font-size: 0.85em;
        }

        /* Code blocks */
        .md-preview .md-code-block {
          position: relative;
          margin: 1rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.12);
        }
        .md-preview .md-code-block pre {
          background: rgba(2, 6, 23, 0.7);
          padding: 1rem 1.25rem;
          overflow-x: auto;
          margin: 0;
        }
        .md-preview .md-code-block code {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          font-size: 0.8125rem;
          line-height: 1.7;
          color: #e2e8f0;
        }
        .md-preview .md-code-lang {
          background: rgba(56, 189, 248, 0.1);
          color: #67e8f9;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.75rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
        }

        /* Blockquotes */
        .md-preview .md-blockquote {
          border-left: 3px solid #06b6d4;
          background: rgba(6, 182, 212, 0.05);
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .md-preview .md-blockquote p {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: #94a3b8;
          margin: 0.25rem 0;
          font-style: italic;
        }

        /* Unordered lists */
        .md-preview .md-ul {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        .md-preview .md-ul li {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: #cbd5e1;
          margin: 0.15rem 0;
        }
        .md-preview .md-ul.md-nested {
          margin: 0.2rem 0;
          padding-left: 1.25rem;
          list-style-type: circle;
        }

        /* Ordered lists */
        .md-preview .md-ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
          list-style-type: decimal;
        }
        .md-preview .md-ol li {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: #cbd5e1;
          margin: 0.15rem 0;
        }

        /* Horizontal rule */
        .md-preview .md-hr {
          border: none;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          margin: 1.5rem 0;
        }

        /* Bold and italic */
        .md-preview strong {
          color: #f1f5f9;
          font-weight: 600;
        }
        .md-preview em {
          color: #cbd5e1;
        }
        .md-preview del {
          color: #64748b;
          text-decoration: line-through;
        }

        /* First child margin reset */
        .md-preview > *:first-child {
          margin-top: 0;
        }
      `}</style>
      <ToolPageFooter toolId="markdown-preview" />
    </div>
  );
}

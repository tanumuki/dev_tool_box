"use client";

import { useState, useMemo, useCallback } from "react";
import { colord, extend } from "colord";
import { ToolPageFooter } from "@/components/ToolPageFooter";
import harmoniesPlugin from "colord/plugins/harmonies";
import a11yPlugin from "colord/plugins/a11y";
import cmykPlugin from "colord/plugins/cmyk";

extend([harmoniesPlugin, a11yPlugin, cmykPlugin]);

// ─── Types ───────────────────────────────────────────────────────────────────

type HarmonyMode = "complementary" | "analogous" | "triadic" | "split" | "tetradic" | "shades";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function copyToClipboard(text: string, setCopied: (v: string) => void, key: string) {
  navigator.clipboard.writeText(text);
  setCopied(key);
  setTimeout(() => setCopied(""), 1500);
}

function rotateHue(hex: string, degrees: number): string {
  const hsl = colord(hex).toHsl();
  return colord({ h: (hsl.h + degrees + 360) % 360, s: hsl.s, l: hsl.l }).toHex();
}

function generateShades(hex: string): string[] {
  const hsl = colord(hex).toHsl();
  return Array.from({ length: 10 }, (_, i) => {
    const l = 95 - i * 9; // 95, 86, 77, ... 14
    return colord({ h: hsl.h, s: hsl.s, l: Math.max(5, Math.min(95, l)) }).toHex();
  });
}

function getHarmonyColors(hex: string, mode: HarmonyMode): string[] {
  switch (mode) {
    case "complementary":
      return [hex, rotateHue(hex, 180)];
    case "analogous":
      return [-30, -15, 0, 15, 30].map((deg) => rotateHue(hex, deg));
    case "triadic":
      return [0, 120, 240].map((deg) => rotateHue(hex, deg));
    case "split":
      return [0, 150, 210].map((deg) => rotateHue(hex, deg));
    case "tetradic":
      return [0, 90, 180, 270].map((deg) => rotateHue(hex, deg));
    case "shades":
      return generateShades(hex);
    default:
      return [hex];
  }
}

// WCAG 2.0 relative luminance
function relativeLuminance(hex: string): number {
  const { r, g, b } = colord(hex).toRgb();
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Components ──────────────────────────────────────────────────────────────

function ColorSwatch({
  color,
  copied,
  onCopy,
  size = "md",
}: {
  color: string;
  copied: string;
  onCopy: (text: string, key: string) => void;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "w-20 h-20" : size === "md" ? "w-16 h-16" : "w-12 h-12";
  return (
    <button
      onClick={() => onCopy(color, color)}
      className="flex flex-col items-center gap-1.5 group"
      title={`Click to copy ${color}`}
    >
      <div
        className={`${dims} rounded-xl border-2 border-slate-700 group-hover:border-blue-400
          transition-all duration-200 group-hover:scale-110 shadow-lg relative`}
        style={{ backgroundColor: color }}
      >
        {copied === color && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-mono text-slate-400 group-hover:text-blue-400 transition-colors">
        {color}
      </span>
    </button>
  );
}

function FormatRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: string;
  onCopy: (text: string, key: string) => void;
}) {
  const key = `fmt-${label}`;
  return (
    <button
      onClick={() => onCopy(value, key)}
      className="flex items-center justify-between w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50
        rounded-xl hover:border-blue-500/50 transition-all duration-200 group"
    >
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
      <span className="text-sm font-mono text-slate-200 group-hover:text-blue-300 transition-colors">
        {copied === key ? "Copied!" : value}
      </span>
    </button>
  );
}

function PassBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
        pass ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
      }`}
    >
      {label}: {pass ? "PASS" : "FAIL"}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const HARMONY_MODES: { key: HarmonyMode; label: string }[] = [
  { key: "complementary", label: "Complementary" },
  { key: "analogous", label: "Analogous" },
  { key: "triadic", label: "Triadic" },
  { key: "split", label: "Split-Complementary" },
  { key: "tetradic", label: "Tetradic" },
  { key: "shades", label: "Shades" },
];

export default function ColorPalettePage() {
  const [color, setColor] = useState("#3b82f6");
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("analogous");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#1e293b");
  const [copied, setCopied] = useState("");

  const handleCopy = useCallback(
    (text: string, key: string) => copyToClipboard(text, setCopied, key),
    []
  );

  // Color formats
  const formats = useMemo(() => {
    const c = colord(color);
    const rgb = c.toRgb();
    const hsl = c.toHsl();
    const hsv = c.toHsv();

    // CMYK via plugin
    let cmyk = { c: 0, m: 0, y: 0, k: 0 };
    try {
      cmyk = (c as any).toCmyk();
    } catch {
      // Manual CMYK fallback
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
      const k = 1 - Math.max(r, g, b);
      if (k === 1) {
        cmyk = { c: 0, m: 0, y: 0, k: 100 };
      } else {
        cmyk = {
          c: Math.round(((1 - r - k) / (1 - k)) * 100),
          m: Math.round(((1 - g - k) / (1 - k)) * 100),
          y: Math.round(((1 - b - k) / (1 - k)) * 100),
          k: Math.round(k * 100),
        };
      }
    }

    return {
      hex: c.toHex(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
      hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    };
  }, [color]);

  // Harmony palette
  const palette = useMemo(() => getHarmonyColors(color, harmonyMode), [color, harmonyMode]);

  // Contrast checker
  const contrast = useMemo(() => contrastRatio(fgColor, bgColor), [fgColor, bgColor]);
  const aaNormal = contrast >= 4.5;
  const aaLarge = contrast >= 3;
  const aaaNormal = contrast >= 7;
  const aaaLarge = contrast >= 4.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Color Palette Generator
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Pick a color, explore palettes, convert formats, and check accessibility contrast.
          </p>
        </div>

        {/* Color Picker + Formats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Picker */}
          <div className="glass-card p-6 flex flex-col items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-300 self-start">Pick a Color</h2>
            <div className="relative w-full aspect-square max-w-[200px]">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-full rounded-2xl cursor-pointer border-4 border-slate-700 hover:border-blue-500
                  transition-all duration-300"
                style={{ padding: 0, appearance: "none" }}
              />
            </div>
            <div className="flex items-center gap-2 w-full">
              <div className="w-10 h-10 rounded-xl border border-slate-700 shrink-0" style={{ backgroundColor: color }} />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const val = e.target.value;
                  if (colord(val).isValid()) setColor(colord(val).toHex());
                }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm
                  font-mono text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Formats */}
          <div className="glass-card p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Color Formats (click to copy)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormatRow label="HEX" value={formats.hex} copied={copied} onCopy={handleCopy} />
              <FormatRow label="RGB" value={formats.rgb} copied={copied} onCopy={handleCopy} />
              <FormatRow label="HSL" value={formats.hsl} copied={copied} onCopy={handleCopy} />
              <FormatRow label="HSV" value={formats.hsv} copied={copied} onCopy={handleCopy} />
              <FormatRow label="CMYK" value={formats.cmyk} copied={copied} onCopy={handleCopy} />
            </div>
          </div>
        </div>

        {/* Palette Generator */}
        <div className="glass-card p-6 sm:p-8 mb-8">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Palette Harmonies</h2>

          {/* Mode tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {HARMONY_MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setHarmonyMode(m.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    harmonyMode === m.key
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                  }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Palette swatches */}
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center py-6">
            {palette.map((c, i) => (
              <ColorSwatch key={`${c}-${i}`} color={c} copied={copied} onCopy={handleCopy} size="lg" />
            ))}
          </div>

          {/* Full-width preview bar */}
          <div
            className="h-16 rounded-xl mt-4 transition-all duration-500"
            style={{
              background:
                palette.length === 1
                  ? palette[0]
                  : `linear-gradient(90deg, ${palette.map((c, i) => `${c} ${Math.round((i / (palette.length - 1)) * 100)}%`).join(", ")})`,
            }}
          />
        </div>

        {/* Contrast Checker */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-slate-300 mb-6">WCAG Contrast Checker</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Foreground (text) Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => {
                      if (colord(e.target.value).isValid()) setFgColor(colord(e.target.value).toHex());
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm
                      font-mono text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Background Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => {
                      if (colord(e.target.value).isValid()) setBgColor(colord(e.target.value).toHex());
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm
                      font-mono text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Swap button */}
              <button
                onClick={() => {
                  setFgColor(bgColor);
                  setBgColor(fgColor);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg
                  text-xs text-slate-400 hover:text-slate-200 transition-all duration-200"
              >
                Swap Colors
              </button>

              {/* Ratio */}
              <div className="text-center py-4">
                <span className="text-5xl font-bold text-white">{contrast.toFixed(2)}</span>
                <span className="text-lg text-slate-400 ml-1">: 1</span>
              </div>

              {/* Pass/fail badges */}
              <div className="flex flex-wrap gap-2 justify-center">
                <PassBadge pass={aaNormal} label="AA Normal" />
                <PassBadge pass={aaLarge} label="AA Large" />
                <PassBadge pass={aaaNormal} label="AAA Normal" />
                <PassBadge pass={aaaLarge} label="AAA Large" />
              </div>
            </div>

            {/* Text preview */}
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl p-8 flex-1 flex flex-col justify-center transition-all duration-300"
                style={{ backgroundColor: bgColor }}
              >
                <h3 className="text-2xl font-bold mb-2 transition-colors" style={{ color: fgColor }}>
                  Large Text Preview
                </h3>
                <p className="text-base leading-relaxed transition-colors" style={{ color: fgColor }}>
                  Normal body text. This paragraph demonstrates how your chosen foreground color appears
                  against the selected background. Good contrast ensures readability for all users.
                </p>
                <p className="text-sm mt-3 transition-colors" style={{ color: fgColor, opacity: 0.8 }}>
                  Smaller text at 14px requires higher contrast ratios to pass WCAG AA (4.5:1).
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1 px-2">
                <p>AA Normal text: ratio at least 4.5:1 (14px regular, 18px bold)</p>
                <p>AA Large text: ratio at least 3:1 (18px regular, 14px bold)</p>
                <p>AAA Normal text: ratio at least 7:1</p>
                <p>AAA Large text: ratio at least 4.5:1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToolPageFooter toolId="color-palette" />
    </div>
  );
}

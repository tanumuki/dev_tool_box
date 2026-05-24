"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "shadow" | "gradient" | "flexbox" | "radius" | "glass";

interface ShadowLayer {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

interface GradientStop {
  id: number;
  color: string;
  position: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function copyToClipboard(text: string, setCopied: (v: string) => void, key: string) {
  navigator.clipboard.writeText(text);
  setCopied(key);
  setTimeout(() => setCopied(""), 1500);
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-slate-400 flex justify-between">
        {label}
        <span className="text-blue-400 font-mono">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(59,130,246,0.5)]"
      />
    </label>
  );
}

function CopyButton({
  text,
  copied,
  id,
  onCopy,
}: {
  text: string;
  copied: string;
  id: string;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(text, id)}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg
        transition-all duration-200 flex items-center gap-2 shrink-0"
    >
      {copied === id ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy CSS
        </>
      )}
    </button>
  );
}

function CodeBlock({
  code,
  copied,
  id,
  onCopy,
}: {
  code: string;
  copied: string;
  id: string;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="mt-6 bg-slate-900/80 border border-slate-700/60 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/60">
        <span className="text-xs text-slate-500 font-mono">CSS</span>
        <CopyButton text={code} copied={copied} id={id} onCopy={onCopy} />
      </div>
      <pre className="p-4 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function ToggleGroup({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 text-xs rounded-md font-mono transition-all duration-150
              ${
                value === opt
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Checkerboard background ─────────────────────────────────────────────────

const checkerBg =
  "bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] " +
  "bg-[image:linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%)," +
  "linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)]";

// ─── Tab: Box Shadow ─────────────────────────────────────────────────────────

function BoxShadowTab() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: 1, x: 5, y: 5, blur: 15, spread: 0, color: "#3b82f6", opacity: 0.5, inset: false },
  ]);
  const [copied, setCopied] = useState("");

  const updateLayer = (id: number, patch: Partial<ShadowLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const addLayer = () => {
    setLayers((prev) => [
      ...prev,
      { id: Date.now(), x: 0, y: 4, blur: 10, spread: 0, color: "#a855f7", opacity: 0.4, inset: false },
    ]);
  };

  const removeLayer = (id: number) => {
    if (layers.length > 1) setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const shadowValue = layers
    .map(
      (l) =>
        `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`
    )
    .join(",\n    ");

  const cssCode = `box-shadow: ${shadowValue};`;

  const handleCopy = (text: string, id: string) => copyToClipboard(text, setCopied, id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview */}
      <div
        className={`${checkerBg} bg-slate-800 rounded-xl min-h-[320px] flex items-center justify-center p-8`}
      >
        <div
          className="w-48 h-48 bg-slate-200 rounded-2xl transition-all duration-300"
          style={{ boxShadow: shadowValue }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {layers.map((layer, i) => (
          <div key={layer.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Shadow {i + 1}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layer.inset}
                    onChange={(e) => updateLayer(layer.id, { inset: e.target.checked })}
                    className="accent-blue-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-400">Inset</span>
                </label>
                {layers.length > 1 && (
                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Slider label="X Offset" value={layer.x} min={-100} max={100} unit="px" onChange={(v) => updateLayer(layer.id, { x: v })} />
              <Slider label="Y Offset" value={layer.y} min={-100} max={100} unit="px" onChange={(v) => updateLayer(layer.id, { y: v })} />
              <Slider label="Blur" value={layer.blur} min={0} max={100} unit="px" onChange={(v) => updateLayer(layer.id, { blur: v })} />
              <Slider label="Spread" value={layer.spread} min={-100} max={100} unit="px" onChange={(v) => updateLayer(layer.id, { spread: v })} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-slate-400">Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={layer.color}
                    onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{layer.color}</span>
                </div>
              </label>
              <div className="flex-1">
                <Slider
                  label="Opacity"
                  value={layer.opacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => updateLayer(layer.id, { opacity: v })}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addLayer}
          className="w-full py-2.5 border-2 border-dashed border-slate-600 hover:border-blue-500
            text-slate-400 hover:text-blue-400 rounded-xl text-sm font-medium transition-all duration-200"
        >
          + Add Layer
        </button>
      </div>

      <div className="lg:col-span-2">
        <CodeBlock code={cssCode} copied={copied} id="shadow" onCopy={handleCopy} />
      </div>
    </div>
  );
}

// ─── Tab: Gradient Generator ─────────────────────────────────────────────────

function GradientTab() {
  const [type, setType] = useState<"linear" | "radial" | "conic">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<GradientStop[]>([
    { id: 1, color: "#3b82f6", position: 0 },
    { id: 2, color: "#a855f7", position: 50 },
    { id: 3, color: "#ec4899", position: 100 },
  ]);
  const [copied, setCopied] = useState("");

  const updateStop = (id: number, patch: Partial<GradientStop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addStop = () => {
    setStops((prev) => [...prev, { id: Date.now(), color: "#22d3ee", position: 50 }]);
  };

  const removeStop = (id: number) => {
    if (stops.length > 2) setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const randomGradient = () => {
    const randomHex = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    const count = 2 + Math.floor(Math.random() * 3);
    const newStops: GradientStop[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      color: randomHex(),
      position: Math.round((i / (count - 1)) * 100),
    }));
    setStops(newStops);
    setAngle(Math.floor(Math.random() * 360));
  };

  const stopsStr = stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  let gradientValue: string;
  if (type === "linear") gradientValue = `linear-gradient(${angle}deg, ${stopsStr})`;
  else if (type === "radial") gradientValue = `radial-gradient(circle, ${stopsStr})`;
  else gradientValue = `conic-gradient(from ${angle}deg, ${stopsStr})`;

  const cssCode = `background: ${gradientValue};`;

  const handleCopy = (text: string, id: string) => copyToClipboard(text, setCopied, id);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="rounded-xl overflow-hidden h-48 w-full" style={{ background: gradientValue }} />

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ToggleGroup options={["linear", "radial", "conic"]} value={type} onChange={(v) => setType(v as "linear" | "radial" | "conic")} label="Type" />
          {(type === "linear" || type === "conic") && (
            <Slider label="Angle" value={angle} min={0} max={360} unit="deg" onChange={setAngle} />
          )}
          <button
            onClick={randomGradient}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Random Gradient
          </button>
        </div>

        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
          {stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
              />
              <span className="text-xs font-mono text-slate-400 w-16">{stop.color}</span>
              <div className="flex-1">
                <Slider
                  label={`Stop ${i + 1}`}
                  value={stop.position}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(v) => updateStop(stop.id, { position: v })}
                />
              </div>
              {stops.length > 2 && (
                <button onClick={() => removeStop(stop.id)} className="text-slate-500 hover:text-red-400 text-xs shrink-0">
                  X
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addStop}
            className="w-full py-2 border-2 border-dashed border-slate-600 hover:border-blue-500
              text-slate-400 hover:text-blue-400 rounded-lg text-sm transition-all duration-200"
          >
            + Add Stop
          </button>
        </div>
      </div>

      <CodeBlock code={cssCode} copied={copied} id="gradient" onCopy={handleCopy} />
    </div>
  );
}

// ─── Tab: Flexbox Playground ─────────────────────────────────────────────────

const FLEX_COLORS = ["#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];

function FlexboxTab() {
  const [direction, setDirection] = useState("row");
  const [justify, setJustify] = useState("flex-start");
  const [align, setAlign] = useState("stretch");
  const [wrap, setWrap] = useState("nowrap");
  const [gap, setGap] = useState(12);
  const [copied, setCopied] = useState("");

  const cssCode = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`;

  const handleCopy = (text: string, id: string) => copyToClipboard(text, setCopied, id);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToggleGroup
          label="flex-direction"
          options={["row", "column", "row-reverse", "column-reverse"]}
          value={direction}
          onChange={setDirection}
        />
        <ToggleGroup
          label="justify-content"
          options={["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]}
          value={justify}
          onChange={setJustify}
        />
        <ToggleGroup
          label="align-items"
          options={["flex-start", "center", "flex-end", "stretch", "baseline"]}
          value={align}
          onChange={setAlign}
        />
        <ToggleGroup label="flex-wrap" options={["nowrap", "wrap"]} value={wrap} onChange={setWrap} />
        <Slider label="gap" value={gap} min={0} max={40} unit="px" onChange={setGap} />
      </div>

      {/* Preview */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 min-h-[280px]">
        <div
          className="w-full min-h-[240px] border-2 border-dashed border-slate-600 rounded-lg p-4 transition-all duration-300"
          style={{
            display: "flex",
            flexDirection: direction as React.CSSProperties["flexDirection"],
            justifyContent: justify,
            alignItems: align,
            flexWrap: wrap as React.CSSProperties["flexWrap"],
            gap: `${gap}px`,
          }}
        >
          {FLEX_COLORS.map((color, i) => (
            <div
              key={i}
              className="rounded-lg flex items-center justify-center text-white font-bold text-sm
                transition-all duration-300 shrink-0"
              style={{
                backgroundColor: color,
                width: 60 + i * 10,
                height: align === "stretch" ? "auto" : 40 + i * 8,
                minHeight: 40,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <CodeBlock code={cssCode} copied={copied} id="flexbox" onCopy={handleCopy} />
    </div>
  );
}

// ─── Tab: Border Radius ──────────────────────────────────────────────────────

function BorderRadiusTab() {
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);
  const [linked, setLinked] = useState(true);
  const [size, setSize] = useState(200);
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [copied, setCopied] = useState("");

  const setAll = (v: number) => {
    setTl(v);
    setTr(v);
    setBr(v);
    setBl(v);
  };

  const radiusValue =
    tl === tr && tr === br && br === bl
      ? `${tl}px`
      : `${tl}px ${tr}px ${br}px ${bl}px`;

  const cssCode = `border-radius: ${radiusValue};`;

  const handleCopy = (text: string, id: string) => copyToClipboard(text, setCopied, id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview */}
      <div className={`${checkerBg} bg-slate-800 rounded-xl min-h-[320px] flex items-center justify-center p-8`}>
        <div
          className="transition-all duration-300"
          style={{
            width: size,
            height: size,
            backgroundColor: bgColor,
            borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`,
          }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
            className="accent-blue-500 w-4 h-4"
          />
          <span className="text-sm text-slate-300">Link corners</span>
        </label>

        {linked ? (
          <Slider label="All Corners" value={tl} min={0} max={200} unit="px" onChange={setAll} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Slider label="Top Left" value={tl} min={0} max={200} unit="px" onChange={setTl} />
            <Slider label="Top Right" value={tr} min={0} max={200} unit="px" onChange={setTr} />
            <Slider label="Bottom Right" value={br} min={0} max={200} unit="px" onChange={setBr} />
            <Slider label="Bottom Left" value={bl} min={0} max={200} unit="px" onChange={setBl} />
          </div>
        )}

        <Slider label="Box Size" value={size} min={80} max={360} unit="px" onChange={setSize} />

        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Background Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">{bgColor}</span>
          </div>
        </label>
      </div>

      <div className="lg:col-span-2">
        <CodeBlock code={cssCode} copied={copied} id="radius" onCopy={handleCopy} />
      </div>
    </div>
  );
}

// ─── Tab: Glassmorphism ──────────────────────────────────────────────────────

function GlassmorphismTab() {
  const [blur, setBlur] = useState(16);
  const [transparency, setTransparency] = useState(0.25);
  const [borderOpacity, setBorderOpacity] = useState(0.3);
  const [cardBg, setCardBg] = useState("#ffffff");
  const [copied, setCopied] = useState("");

  const r = parseInt(cardBg.slice(1, 3), 16);
  const g = parseInt(cardBg.slice(3, 5), 16);
  const b = parseInt(cardBg.slice(5, 7), 16);

  const cssCode = `background: rgba(${r}, ${g}, ${b}, ${transparency});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: 1px solid rgba(${r}, ${g}, ${b}, ${borderOpacity});
border-radius: 16px;`;

  const handleCopy = (text: string, id: string) => copyToClipboard(text, setCopied, id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview with colorful background */}
      <div
        className="rounded-xl min-h-[360px] flex items-center justify-center p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
        }}
      >
        {/* Floating decorative shapes */}
        <div className="absolute w-32 h-32 rounded-full bg-pink-400/60 top-4 left-8 blur-sm" />
        <div className="absolute w-24 h-24 rounded-full bg-blue-400/60 bottom-8 right-12 blur-sm" />
        <div className="absolute w-20 h-20 rounded-full bg-yellow-400/50 top-20 right-20 blur-sm" />

        {/* Glass card */}
        <div
          className="relative z-10 w-72 p-6 rounded-2xl transition-all duration-300"
          style={{
            background: `rgba(${r}, ${g}, ${b}, ${transparency})`,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            border: `1px solid rgba(${r}, ${g}, ${b}, ${borderOpacity})`,
          }}
        >
          <h3 className="text-white font-semibold text-lg mb-2">Glass Card</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            This card uses glassmorphism with a frosted-glass backdrop blur effect.
          </p>
          <div className="mt-4 flex gap-2">
            <div className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs">Tag 1</div>
            <div className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs">Tag 2</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <Slider label="Blur" value={blur} min={0} max={40} unit="px" onChange={setBlur} />
        <Slider
          label="Transparency"
          value={transparency}
          min={0}
          max={1}
          step={0.01}
          onChange={setTransparency}
        />
        <Slider
          label="Border Opacity"
          value={borderOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={setBorderOpacity}
        />
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Card Background Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cardBg}
              onChange={(e) => setCardBg(e.target.value)}
              className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">{cardBg}</span>
          </div>
        </label>
      </div>

      <div className="lg:col-span-2">
        <CodeBlock code={cssCode} copied={copied} id="glass" onCopy={handleCopy} />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "shadow", label: "Box Shadow", icon: "S" },
  { key: "gradient", label: "Gradient", icon: "G" },
  { key: "flexbox", label: "Flexbox", icon: "F" },
  { key: "radius", label: "Border Radius", icon: "R" },
  { key: "glass", label: "Glassmorphism", icon: "M" },
];

export default function CssGeneratorsPage() {
  const [tab, setTab] = useState<Tab>("shadow");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CSS Generators
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Visually create CSS box shadows, gradients, flexbox layouts, border radii, and glassmorphism effects.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                flex items-center gap-2
                ${
                  tab === t.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-slate-800/70 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200"
                }`}
            >
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold
                  ${tab === t.key ? "bg-white/20" : "bg-slate-700"}`}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="glass-card p-6 sm:p-8">
          {tab === "shadow" && <BoxShadowTab />}
          {tab === "gradient" && <GradientTab />}
          {tab === "flexbox" && <FlexboxTab />}
          {tab === "radius" && <BorderRadiusTab />}
          {tab === "glass" && <GlassmorphismTab />}
        </div>
      </div>
    </div>
  );
}

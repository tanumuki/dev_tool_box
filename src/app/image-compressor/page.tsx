"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface CompressedImage {
  originalFile: File;
  originalUrl: string;
  originalSize: number;
  compressedUrl: string;
  compressedBlob: Blob;
  compressedSize: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getExtension(format: OutputFormat): string {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/png") return "png";
  return "webp";
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CompressedImage | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [maxHeight, setMaxHeight] = useState<number | "">("");
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [compressing, setCompressing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Track all created object URLs for reliable cleanup
  const urlsRef = useRef<string[]>([]);

  // Clean up all object URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Revoke previous preview URL when it changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback((f: File) => {
    if (!f.type.match(/^image\/(jpeg|png|webp)$/)) return;
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const compress = useCallback(async () => {
    if (!file) return;
    setCompressing(true);

    try {
      const img = new Image();
      const originalUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = originalUrl;
      });

      let targetW = img.naturalWidth;
      let targetH = img.naturalHeight;

      // Apply max width/height constraints while preserving aspect ratio
      const mw = typeof maxWidth === "number" ? maxWidth : Infinity;
      const mh = typeof maxHeight === "number" ? maxHeight : Infinity;

      if (targetW > mw || targetH > mh) {
        const ratio = Math.min(mw / targetW, mh / targetH);
        targetW = Math.round(targetW * ratio);
        targetH = Math.round(targetH * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Compression failed"));
          },
          format,
          format === "image/png" ? undefined : quality / 100
        );
      });

      const compressedUrl = URL.createObjectURL(blob);

      setResult({
        originalFile: file,
        originalUrl,
        originalSize: file.size,
        compressedUrl,
        compressedBlob: blob,
        compressedSize: blob.size,
        width: targetW,
        height: targetH,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
      });
      setSliderPos(50);
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setCompressing(false);
    }
  }, [file, quality, maxWidth, maxHeight, format]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.compressedUrl;
    const baseName = result.originalFile.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}-compressed.${getExtension(format)}`;
    a.click();
  }, [result, format]);

  const reset = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
  }, []);

  // Slider drag handlers
  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    []
  );

  const handleMouseDown = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => handleSliderMove(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, handleSliderMove]);

  useEffect(() => {
    if (!dragging) return;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => setDragging(false);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging, handleSliderMove]);

  const savingsPercent = result
    ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Image Compressor
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Compress and resize JPEG, PNG, and WebP images in your browser. Nothing is uploaded to any server.
          </p>
        </div>

        {/* Drop zone or result */}
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card cursor-pointer transition-all duration-300 flex flex-col items-center
              justify-center py-24 px-8 border-2 border-dashed
              ${
                dragOver
                  ? "border-blue-400 bg-blue-500/5 scale-[1.01]"
                  : "border-slate-600 hover:border-blue-500/50"
              }`}
            style={{
              animation: !dragOver ? "pulse-subtle 3s ease-in-out infinite" : undefined,
            }}
          >
            <svg
              className={`w-16 h-16 mb-4 transition-colors duration-300 ${
                dragOver ? "text-blue-400" : "text-slate-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-slate-300 font-medium mb-1">Drop an image here or click to browse</p>
            <p className="text-slate-500 text-sm">Supports JPEG, PNG, WebP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-300">{file.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Original: {formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={reset}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {/* Quality */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 flex justify-between">
                    Quality
                    <span className="text-blue-400 font-mono">{quality}%</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                      [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(59,130,246,0.5)]"
                  />
                </div>

                {/* Max Width */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Max Width (px)</label>
                  <input
                    type="number"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Auto"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono
                      text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Max Height */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Max Height (px)</label>
                  <input
                    type="number"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Auto"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono
                      text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Output Format</label>
                  <div className="flex gap-1">
                    {(
                      [
                        ["image/jpeg", "JPEG"],
                        ["image/png", "PNG"],
                        ["image/webp", "WebP"],
                      ] as [OutputFormat, string][]
                    ).map(([f, label]) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`flex-1 py-2 text-xs rounded-lg font-medium transition-all duration-200
                          ${
                            format === f
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={compress}
                  disabled={compressing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700
                    disabled:text-slate-500 text-white text-sm font-medium rounded-lg
                    transition-all duration-200 flex items-center gap-2"
                >
                  {compressing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Compressing...
                    </>
                  ) : (
                    "Compress"
                  )}
                </button>

                {result && (
                  <button
                    onClick={download}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm
                      font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                )}
              </div>
            </div>

            {/* Stats bar */}
            {result && (
              <div className="glass-card p-4">
                <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Original</p>
                    <p className="text-sm font-mono text-slate-300">{formatBytes(result.originalSize)}</p>
                    <p className="text-[10px] text-slate-500">
                      {result.originalWidth} x {result.originalHeight}
                    </p>
                  </div>

                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>

                  <div>
                    <p className="text-xs text-slate-500">Compressed</p>
                    <p className="text-sm font-mono text-emerald-400">{formatBytes(result.compressedSize)}</p>
                    <p className="text-[10px] text-slate-500">
                      {result.width} x {result.height}
                    </p>
                  </div>

                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-lg font-bold text-emerald-400">
                      {savingsPercent > 0 ? `${savingsPercent}% smaller` : `${Math.abs(savingsPercent)}% larger`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Before / After comparison */}
            {result ? (
              <div className="glass-card p-2 overflow-hidden rounded-xl">
                <div
                  ref={sliderContainerRef}
                  className="relative select-none overflow-hidden rounded-lg"
                  style={{ cursor: dragging ? "ew-resize" : "default" }}
                  onMouseDown={(e) => {
                    handleMouseDown();
                    handleSliderMove(e.clientX);
                  }}
                  onTouchStart={(e) => {
                    handleMouseDown();
                    if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
                  }}
                >
                  {/* After (compressed) — full width below */}
                  <img
                    src={result.compressedUrl}
                    alt="Compressed"
                    className="w-full block"
                    draggable={false}
                  />

                  {/* Before (original) — clipped by slider */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={result.originalUrl}
                      alt="Original"
                      className="block"
                      style={{ width: sliderContainerRef.current?.offsetWidth || "100%" }}
                      draggable={false}
                    />
                  </div>

                  {/* Slider line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] z-10"
                    style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                  >
                    {/* Slider handle */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
                        cursor-ew-resize"
                    >
                      <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 rounded-md text-xs text-white font-medium z-10">
                    Original
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 rounded-md text-xs text-white font-medium z-10">
                    Compressed
                  </div>
                </div>
              </div>
            ) : (
              previewUrl && (
                <div className="glass-card p-2 overflow-hidden rounded-xl">
                  <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                </div>
              )
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.08); }
        }
      `}} />
    </div>
  );
}

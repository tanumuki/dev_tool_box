"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { ToolPageFooter } from "@/components/ToolPageFooter";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Template = "url" | "email" | "phone" | "wifi" | "text";

interface WifiFields {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
}

interface EmailFields {
  address: string;
  subject: string;
  body: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function QrGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("https://example.com");
  const [template, setTemplate] = useState<Template>("url");
  const [size, setSize] = useState(300);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#0f172a");
  const [copied, setCopied] = useState(false);

  // Template-specific state
  const [wifiFields, setWifiFields] = useState<WifiFields>({
    ssid: "",
    password: "",
    encryption: "WPA",
  });
  const [emailFields, setEmailFields] = useState<EmailFields>({
    address: "",
    subject: "",
    body: "",
  });
  const [phone, setPhone] = useState("");

  // Build the final text value from template fields
  const resolvedText = useCallback(() => {
    switch (template) {
      case "email": {
        const params: string[] = [];
        if (emailFields.subject)
          params.push(`subject=${encodeURIComponent(emailFields.subject)}`);
        if (emailFields.body)
          params.push(`body=${encodeURIComponent(emailFields.body)}`);
        const qs = params.length > 0 ? `?${params.join("&")}` : "";
        return `mailto:${emailFields.address}${qs}`;
      }
      case "phone":
        return `tel:${phone}`;
      case "wifi":
        return `WIFI:T:${wifiFields.encryption};S:${wifiFields.ssid};P:${wifiFields.password};;`;
      default:
        return text;
    }
  }, [template, text, emailFields, phone, wifiFields]);

  // Render QR to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const value = resolvedText();
    if (!value || value.length === 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = fgColor + "40";
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Enter text to generate QR", size / 2, size / 2);
      }
      return;
    }

    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      color: { dark: fgColor, light: bgColor },
    }).catch(() => {
      /* invalid input */
    });
  }, [resolvedText, size, errorCorrection, fgColor, bgColor]);

  // Download PNG
  const downloadPng = useCallback(async () => {
    const value = resolvedText();
    if (!value) return;
    try {
      const url = await QRCode.toDataURL(value, {
        width: size * 2,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: { dark: fgColor, light: bgColor },
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
    } catch {
      /* ignore */
    }
  }, [resolvedText, size, errorCorrection, fgColor, bgColor]);

  // Download SVG
  const downloadSvg = useCallback(async () => {
    const value = resolvedText();
    if (!value) return;
    try {
      const svgString = await QRCode.toString(value, {
        type: "svg",
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: { dark: fgColor, light: bgColor },
      });
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, [resolvedText, size, errorCorrection, fgColor, bgColor]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* clipboard not available */
    }
  }, []);

  const EC_LABELS: Record<string, string> = {
    L: "Low (7%)",
    M: "Medium (15%)",
    Q: "Quartile (25%)",
    H: "High (30%)",
  };

  const TEMPLATES: { id: Template; label: string; icon: string }[] = [
    { id: "url", label: "URL", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" },
    { id: "text", label: "Text", icon: "M4 6h16M4 12h16M4 18h7" },
    { id: "email", label: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "phone", label: "Phone", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
    { id: "wifi", label: "WiFi", icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            DevToolBox
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold text-sm">
            QR Code Generator
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="glow-text">QR Code Generator</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Create QR codes for URLs, emails, WiFi, and more
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,auto] gap-6">
          {/* Left panel: inputs */}
          <div className="space-y-6">
            {/* Template selector */}
            <div className="glass-card p-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Content Type
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      template === t.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={t.icon}
                      />
                    </svg>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content input */}
            <div className="glass-card p-6 space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Content
              </label>

              {/* URL / Text */}
              {(template === "url" || template === "text") && (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    template === "url"
                      ? "https://example.com"
                      : "Enter your text here..."
                  }
                  rows={3}
                  className="code-input w-full"
                />
              )}

              {/* Email */}
              {template === "email" && (
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={emailFields.address}
                    onChange={(e) =>
                      setEmailFields((f) => ({ ...f, address: e.target.value }))
                    }
                    className="code-input w-full"
                  />
                  <input
                    type="text"
                    placeholder="Subject (optional)"
                    value={emailFields.subject}
                    onChange={(e) =>
                      setEmailFields((f) => ({ ...f, subject: e.target.value }))
                    }
                    className="code-input w-full"
                  />
                  <textarea
                    placeholder="Body (optional)"
                    value={emailFields.body}
                    onChange={(e) =>
                      setEmailFields((f) => ({ ...f, body: e.target.value }))
                    }
                    rows={2}
                    className="code-input w-full"
                  />
                </div>
              )}

              {/* Phone */}
              {template === "phone" && (
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="code-input w-full"
                />
              )}

              {/* WiFi */}
              {template === "wifi" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Network name (SSID)"
                    value={wifiFields.ssid}
                    onChange={(e) =>
                      setWifiFields((f) => ({ ...f, ssid: e.target.value }))
                    }
                    className="code-input w-full"
                  />
                  <input
                    type="text"
                    placeholder="Password"
                    value={wifiFields.password}
                    onChange={(e) =>
                      setWifiFields((f) => ({ ...f, password: e.target.value }))
                    }
                    className="code-input w-full"
                  />
                  <div className="flex gap-3">
                    {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                      <label
                        key={enc}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="encryption"
                          checked={wifiFields.encryption === enc}
                          onChange={() =>
                            setWifiFields((f) => ({ ...f, encryption: enc }))
                          }
                          className="accent-blue-500"
                        />
                        <span className="text-sm text-slate-300">
                          {enc === "nopass" ? "None" : enc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Show resolved value */}
              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/50">
                <span className="text-xs text-slate-500 block mb-1">
                  Encoded value
                </span>
                <code className="text-xs text-slate-400 font-mono break-all">
                  {resolvedText() || "(empty)"}
                </code>
              </div>
            </div>

            {/* Customization */}
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-sm font-medium text-slate-300">
                Customization
              </h2>

              {/* Size slider */}
              <div>
                <label className="flex items-center justify-between text-sm text-slate-400 mb-2">
                  <span>Size</span>
                  <span className="font-mono text-blue-300">{size}px</span>
                </label>
                <input
                  type="range"
                  min={128}
                  max={512}
                  step={8}
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Error correction */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Error Correction
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["L", "M", "Q", "H"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setErrorCorrection(level)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all text-center ${
                        errorCorrection === level
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                      }`}
                      title={EC_LABELS[level]}
                    >
                      {level}
                      <span className="block text-[10px] mt-0.5 opacity-60">
                        {EC_LABELS[level].replace(/.*\(/, "(").replace(")", "")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Foreground
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="code-input flex-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Background
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="code-input flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: QR preview */}
          <div className="lg:sticky lg:top-20 self-start space-y-4">
            <div className="glass-card p-8 flex flex-col items-center gap-6">
              <canvas
                ref={canvasRef}
                className="rounded-xl shadow-2xl shadow-blue-500/10"
              />

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={downloadPng}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  PNG
                </button>
                <button
                  onClick={downloadSvg}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  SVG
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        copied
                          ? "M5 13l4 4L19 7"
                          : "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10"
                      }
                    />
                  </svg>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ToolPageFooter toolId="qr-generator" />
    </div>
  );
}

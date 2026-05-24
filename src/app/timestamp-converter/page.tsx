"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ToolPageFooter } from "@/components/ToolPageFooter";

/* ------------------------------------------------------------------ */
/*  Timezone data                                                      */
/* ------------------------------------------------------------------ */

const TIMEZONES: { label: string; zone: string }[] = [
  { label: "UTC", zone: "UTC" },
  { label: "GMT (London)", zone: "Europe/London" },
  { label: "CET (Berlin)", zone: "Europe/Berlin" },
  { label: "EET (Helsinki)", zone: "Europe/Helsinki" },
  { label: "IST (India)", zone: "Asia/Kolkata" },
  { label: "CST (China)", zone: "Asia/Shanghai" },
  { label: "JST (Tokyo)", zone: "Asia/Tokyo" },
  { label: "KST (Seoul)", zone: "Asia/Seoul" },
  { label: "AEST (Sydney)", zone: "Australia/Sydney" },
  { label: "NZST (Auckland)", zone: "Pacific/Auckland" },
  { label: "EST (New York)", zone: "America/New_York" },
  { label: "CST (Chicago)", zone: "America/Chicago" },
  { label: "MST (Denver)", zone: "America/Denver" },
  { label: "PST (Los Angeles)", zone: "America/Los_Angeles" },
  { label: "AKST (Anchorage)", zone: "America/Anchorage" },
  { label: "HST (Hawaii)", zone: "Pacific/Honolulu" },
  { label: "BRT (Sao Paulo)", zone: "America/Sao_Paulo" },
  { label: "AST (Dubai)", zone: "Asia/Dubai" },
  { label: "SGT (Singapore)", zone: "Asia/Singapore" },
  { label: "HKT (Hong Kong)", zone: "Asia/Hong_Kong" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatInTimezone(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function getUtcOffset(date: Date, tz: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  return offsetPart?.value ?? "";
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs > 0;

  if (absDiff < 60000) {
    return isPast ? "just now" : "in a moment";
  }
  const minutes = Math.floor(absDiff / 60000);
  if (minutes < 60) {
    return isPast ? `${minutes} min ago` : `in ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return isPast ? `${hours}h ago` : `in ${hours}h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return isPast ? `${days}d ago` : `in ${days}d`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return isPast ? `${months}mo ago` : `in ${months}mo`;
  }
  const years = Math.floor(months / 12);
  return isPast ? `${years}y ago` : `in ${years}y`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TimestampConverterPage() {
  const [now, setNow] = useState(new Date());
  const [epochInput, setEpochInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [isMilliseconds, setIsMilliseconds] = useState(false);
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Kolkata",
    "Asia/Tokyo",
  ]);
  const [activeDate, setActiveDate] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse epoch -> date
  const epochResult = useMemo(() => {
    if (!epochInput.trim()) return null;
    const n = Number(epochInput.trim());
    if (isNaN(n)) return null;
    const ms = isMilliseconds ? n : n * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [epochInput, isMilliseconds]);

  // Parse date string -> epoch
  const dateResult = useMemo(() => {
    if (!dateInput.trim()) return null;
    const d = new Date(dateInput.trim());
    if (isNaN(d.getTime())) return null;
    return d;
  }, [dateInput]);

  // Update active date when epoch or date input changes
  useEffect(() => {
    if (epochResult) setActiveDate(epochResult);
    else if (dateResult) setActiveDate(dateResult);
  }, [epochResult, dateResult]);

  const fillNow = useCallback(() => {
    const n = new Date();
    const val = isMilliseconds ? n.getTime() : Math.floor(n.getTime() / 1000);
    setEpochInput(String(val));
    setActiveDate(n);
  }, [isMilliseconds]);

  const addTime = useCallback(
    (ms: number) => {
      const newDate = new Date(activeDate.getTime() + ms);
      setActiveDate(newDate);
      const val = isMilliseconds
        ? newDate.getTime()
        : Math.floor(newDate.getTime() / 1000);
      setEpochInput(String(val));
      setDateInput(newDate.toISOString());
    },
    [activeDate, isMilliseconds]
  );

  const startOfDay = useCallback(() => {
    const d = new Date(activeDate);
    d.setHours(0, 0, 0, 0);
    setActiveDate(d);
    const val = isMilliseconds ? d.getTime() : Math.floor(d.getTime() / 1000);
    setEpochInput(String(val));
    setDateInput(d.toISOString());
  }, [activeDate, isMilliseconds]);

  const endOfDay = useCallback(() => {
    const d = new Date(activeDate);
    d.setHours(23, 59, 59, 999);
    setActiveDate(d);
    const val = isMilliseconds ? d.getTime() : Math.floor(d.getTime() / 1000);
    setEpochInput(String(val));
    setDateInput(d.toISOString());
  }, [activeDate, isMilliseconds]);

  const toggleTimezone = useCallback((zone: string) => {
    setSelectedTimezones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  }, []);

  // Date format display
  const formats = useMemo(() => {
    const d = activeDate;
    return [
      {
        label: "ISO 8601",
        value: d.toISOString(),
      },
      {
        label: "RFC 2822",
        value: d.toUTCString().replace("GMT", "+0000"),
      },
      {
        label: "Relative",
        value: relativeTime(d),
      },
      {
        label: "US Format",
        value: d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      },
      {
        label: "EU Format",
        value: `${d.getUTCDate().toString().padStart(2, "0")}/${(d.getUTCMonth() + 1).toString().padStart(2, "0")}/${d.getUTCFullYear()}`,
      },
      {
        label: "Unix (seconds)",
        value: Math.floor(d.getTime() / 1000).toString(),
      },
      {
        label: "Unix (milliseconds)",
        value: d.getTime().toString(),
      },
    ];
  }, [activeDate]);

  // Format clock digits with colons
  const clockDigits = (date: Date, tz: string) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);

    return parts.map((p) => p.value).join("");
  };

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
            Timestamp Converter
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="glow-text">Timestamp Converter</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Convert timestamps, compare timezones, format dates
          </p>
        </div>

        {/* Live clock */}
        <div className="glass-card p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                Local Time
              </span>
              <div className="mt-2 font-mono text-4xl font-bold tracking-wider text-white">
                {clockDigits(now, Intl.DateTimeFormat().resolvedOptions().timeZone)}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {now.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                UTC
              </span>
              <div className="mt-2 font-mono text-4xl font-bold tracking-wider text-blue-300">
                {clockDigits(now, "UTC")}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {formatInTimezone(now, "UTC").split(",").slice(1).join(",").trim()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Epoch: {Math.floor(now.getTime() / 1000)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Epoch converter */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-medium text-slate-400">
              Epoch Converter
            </h2>

            {/* Toggle seconds/ms */}
            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${!isMilliseconds ? "text-blue-300" : "text-slate-500"}`}
              >
                Seconds
              </span>
              <button
                onClick={() => setIsMilliseconds((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isMilliseconds ? "bg-blue-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isMilliseconds ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span
                className={`text-sm ${isMilliseconds ? "text-blue-300" : "text-slate-500"}`}
              >
                Milliseconds
              </span>
            </div>

            {/* Epoch -> Date */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Unix timestamp to date
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={epochInput}
                  onChange={(e) => setEpochInput(e.target.value)}
                  placeholder={
                    isMilliseconds ? "1716000000000" : "1716000000"
                  }
                  className="code-input flex-1"
                />
                <button
                  onClick={fillNow}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors whitespace-nowrap"
                >
                  Now
                </button>
              </div>
              {epochResult && (
                <div className="mt-2 bg-slate-900/80 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-sm text-slate-200">
                    {epochResult.toISOString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {epochResult.toLocaleString()} ({relativeTime(epochResult)})
                  </p>
                </div>
              )}
              {epochInput && !epochResult && (
                <p className="text-xs text-red-400 mt-2">
                  Invalid timestamp
                </p>
              )}
            </div>

            {/* Date -> Epoch */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Date string to Unix timestamp
              </label>
              <input
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="2026-05-23T12:00:00Z"
                className="code-input w-full"
              />
              {dateResult && (
                <div className="mt-2 bg-slate-900/80 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-sm font-mono text-slate-200">
                    {isMilliseconds
                      ? dateResult.getTime()
                      : Math.floor(dateResult.getTime() / 1000)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {relativeTime(dateResult)}
                  </p>
                </div>
              )}
              {dateInput && !dateResult && (
                <p className="text-xs text-red-400 mt-2">
                  Could not parse date string
                </p>
              )}
            </div>

            {/* Quick operations */}
            <div>
              <label className="block text-xs text-slate-500 mb-2">
                Quick operations
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={startOfDay}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Start of day
                </button>
                <button
                  onClick={endOfDay}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors"
                >
                  End of day
                </button>
                <button
                  onClick={() => addTime(3600000)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors"
                >
                  +1 hour
                </button>
                <button
                  onClick={() => addTime(86400000)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors"
                >
                  +1 day
                </button>
                <button
                  onClick={() => addTime(604800000)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors"
                >
                  +1 week
                </button>
                <button
                  onClick={() => addTime(-3600000)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors"
                >
                  -1 hour
                </button>
                <button
                  onClick={() => addTime(-86400000)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors"
                >
                  -1 day
                </button>
              </div>
            </div>
          </div>

          {/* Date formatter */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-medium text-slate-400">
              Date Formats
            </h2>
            <div className="text-xs text-slate-500 mb-2">
              Showing formats for:{" "}
              <span className="text-slate-300 font-mono">
                {activeDate.toISOString()}
              </span>
            </div>
            <div className="space-y-2">
              {formats.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-2.5 border border-slate-700/30 group"
                >
                  <div>
                    <span className="text-xs text-slate-500">{f.label}</span>
                    <p className="text-sm font-mono text-slate-200">
                      {f.value}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(f.value).catch(() => {})
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                    title="Copy"
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
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timezone converter */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-sm font-medium text-slate-400">
            Timezone Converter
          </h2>
          <p className="text-xs text-slate-500">
            Select timezones to compare. Showing:{" "}
            <span className="text-slate-300 font-mono">
              {activeDate.toISOString()}
            </span>
          </p>

          {/* Timezone selector */}
          <div className="flex flex-wrap gap-2">
            {TIMEZONES.map((tz) => (
              <button
                key={tz.zone}
                onClick={() => toggleTimezone(tz.zone)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTimezones.includes(tz.zone)
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 border border-transparent"
                }`}
              >
                {tz.label}
              </button>
            ))}
          </div>

          {/* Timezone display */}
          {selectedTimezones.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {selectedTimezones.map((zone) => {
                const tzInfo = TIMEZONES.find((t) => t.zone === zone);
                const label = tzInfo?.label ?? zone;
                return (
                  <div
                    key={zone}
                    className="bg-slate-800/60 rounded-lg px-4 py-3 border border-slate-700/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-[10px] text-slate-600 font-mono">
                        {getUtcOffset(activeDate, zone)}
                      </span>
                    </div>
                    <p className="text-lg font-mono text-white mt-1">
                      {clockDigits(activeDate, zone)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Intl.DateTimeFormat("en-US", {
                        timeZone: zone,
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }).format(activeDate)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <ToolPageFooter toolId="timestamp-converter" />
    </div>
  );
}

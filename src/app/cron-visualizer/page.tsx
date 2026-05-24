"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import cronstrue from "cronstrue";
import Link from "next/link";
import { ToolPageFooter } from "@/components/ToolPageFooter";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CronFields {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

/* ------------------------------------------------------------------ */
/*  Cron parser helpers                                                */
/* ------------------------------------------------------------------ */

function expandField(field: string, min: number, max: number): Set<number> {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const trimmed = part.trim();
    // step: */n  or  range/n
    const stepMatch = trimmed.match(/^(.+)\/(\d+)$/);
    if (stepMatch) {
      const [, base, stepStr] = stepMatch;
      const step = parseInt(stepStr, 10);
      let start = min;
      let end = max;
      if (base !== "*") {
        const rangeMatch = base.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          start = parseInt(rangeMatch[1], 10);
          end = parseInt(rangeMatch[2], 10);
        } else {
          start = parseInt(base, 10);
        }
      }
      for (let i = start; i <= end; i += step) values.add(i);
      continue;
    }
    // wildcard
    if (trimmed === "*") {
      for (let i = min; i <= max; i++) values.add(i);
      continue;
    }
    // range
    const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1], 10);
      const hi = parseInt(rangeMatch[2], 10);
      for (let i = lo; i <= hi; i++) values.add(i);
      continue;
    }
    // single value
    const n = parseInt(trimmed, 10);
    if (!isNaN(n)) values.add(n);
  }
  return values;
}

function getNextRuns(expression: string, count: number): Date[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  try {
    const minutes = expandField(parts[0], 0, 59);
    const hours = expandField(parts[1], 0, 23);
    const daysOfMonth = expandField(parts[2], 1, 31);
    const months = expandField(parts[3], 1, 12);
    const daysOfWeek = expandField(parts[4], 0, 6); // 0=Sun

    const results: Date[] = [];
    const now = new Date();
    const cursor = new Date(now);
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);

    const limit = 525600; // 1 year in minutes
    for (let i = 0; i < limit && results.length < count; i++) {
      const m = cursor.getMinutes();
      const h = cursor.getHours();
      const dom = cursor.getDate();
      const mon = cursor.getMonth() + 1;
      const dow = cursor.getDay();

      if (
        minutes.has(m) &&
        hours.has(h) &&
        daysOfMonth.has(dom) &&
        months.has(mon) &&
        daysOfWeek.has(dow)
      ) {
        results.push(new Date(cursor));
      }
      cursor.setMinutes(cursor.getMinutes() + 1);
    }
    return results;
  } catch {
    return [];
  }
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "less than a minute";
  if (diffMin < 60) return `in ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  const remainMin = diffMin % 60;
  if (diffHr < 24) {
    return remainMin > 0 ? `in ${diffHr}h ${remainMin}m` : `in ${diffHr}h`;
  }
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "tomorrow";
  return `in ${diffDays} days`;
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

const PRESETS: { label: string; cron: string }[] = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Every Monday 9 AM", cron: "0 9 * * 1" },
  { label: "Weekdays 9 AM", cron: "0 9 * * 1-5" },
  { label: "First of month", cron: "0 0 1 * *" },
];

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CronVisualizerPage() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [showReference, setShowReference] = useState(false);
  const [mode, setMode] = useState<"input" | "builder">("input");

  // Builder state
  const [builderFields, setBuilderFields] = useState<CronFields>({
    minute: "0",
    hour: "9",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "1-5",
  });

  // Sync builder -> expression
  useEffect(() => {
    if (mode === "builder") {
      const expr = `${builderFields.minute} ${builderFields.hour} ${builderFields.dayOfMonth} ${builderFields.month} ${builderFields.dayOfWeek}`;
      setExpression(expr);
    }
  }, [builderFields, mode]);

  // Description
  const description = useMemo(() => {
    try {
      return cronstrue.toString(expression, { verbose: true });
    } catch {
      return null;
    }
  }, [expression]);

  // Next runs
  const nextRuns = useMemo(() => getNextRuns(expression, 20), [expression]);

  const isValid = description !== null;

  // Week timeline data
  const weekTimeline = useMemo(() => {
    if (nextRuns.length === 0) return [];
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextRuns
      .filter((d) => d.getTime() <= weekEnd.getTime())
      .map((d) => ({
        date: d,
        pct:
          ((d.getTime() - now.getTime()) / (weekEnd.getTime() - now.getTime())) *
          100,
      }));
  }, [nextRuns]);

  // Builder helpers
  const toggleDow = useCallback(
    (day: number) => {
      const current = builderFields.dayOfWeek;
      let days: Set<number>;
      if (current === "*") {
        days = new Set([day]);
      } else {
        days = new Set(
          expandField(current, 0, 6)
        );
        if (days.has(day)) days.delete(day);
        else days.add(day);
      }
      if (days.size === 0 || days.size === 7) {
        setBuilderFields((f) => ({ ...f, dayOfWeek: "*" }));
      } else {
        const sorted = Array.from(days).sort((a, b) => a - b);
        setBuilderFields((f) => ({ ...f, dayOfWeek: sorted.join(",") }));
      }
    },
    [builderFields.dayOfWeek]
  );

  const toggleMonth = useCallback(
    (month: number) => {
      const current = builderFields.month;
      let months: Set<number>;
      if (current === "*") {
        months = new Set([month]);
      } else {
        months = new Set(expandField(current, 1, 12));
        if (months.has(month)) months.delete(month);
        else months.add(month);
      }
      if (months.size === 0 || months.size === 12) {
        setBuilderFields((f) => ({ ...f, month: "*" }));
      } else {
        const sorted = Array.from(months).sort((a, b) => a - b);
        setBuilderFields((f) => ({ ...f, month: sorted.join(",") }));
      }
    },
    [builderFields.month]
  );

  const isDowActive = useCallback(
    (day: number) => {
      if (builderFields.dayOfWeek === "*") return false;
      return expandField(builderFields.dayOfWeek, 0, 6).has(day);
    },
    [builderFields.dayOfWeek]
  );

  const isMonthActive = useCallback(
    (month: number) => {
      if (builderFields.month === "*") return false;
      return expandField(builderFields.month, 1, 12).has(month);
    },
    [builderFields.month]
  );

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
            Cron Visualizer
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="glow-text">Cron Visualizer</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Understand, build, and preview cron schedules
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("input")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "input"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Expression Input
          </button>
          <button
            onClick={() => setMode("builder")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "builder"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Visual Builder
          </button>
        </div>

        {/* Expression input mode */}
        {mode === "input" && (
          <div className="glass-card p-6 space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Cron Expression
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="* * * * *"
              className="code-input w-full text-lg tracking-widest"
              spellCheck={false}
            />
            {/* Field labels */}
            <div className="flex justify-between text-xs text-slate-500 px-1 max-w-md">
              <span>minute</span>
              <span>hour</span>
              <span>day (month)</span>
              <span>month</span>
              <span>day (week)</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-2">
              {PRESETS.map((p) => (
                <button
                  key={p.cron}
                  onClick={() => setExpression(p.cron)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    expression === p.cron
                      ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-transparent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Visual builder mode */}
        {mode === "builder" && (
          <div className="glass-card p-6 space-y-6">
            {/* Generated expression display */}
            <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/50">
              <span className="text-xs text-slate-500 block mb-1">
                Generated expression
              </span>
              <code className="text-lg tracking-widest text-blue-300 font-mono">
                {expression}
              </code>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Minute */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Minute
                </label>
                <select
                  value={builderFields.minute}
                  onChange={(e) =>
                    setBuilderFields((f) => ({ ...f, minute: e.target.value }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="*">Every minute</option>
                  <option value="*/5">Every 5 minutes</option>
                  <option value="*/10">Every 10 minutes</option>
                  <option value="*/15">Every 15 minutes</option>
                  <option value="*/30">Every 30 minutes</option>
                  <option value="0">At minute 0</option>
                  <option value="15">At minute 15</option>
                  <option value="30">At minute 30</option>
                  <option value="45">At minute 45</option>
                </select>
              </div>

              {/* Hour */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hour
                </label>
                <select
                  value={builderFields.hour}
                  onChange={(e) =>
                    setBuilderFields((f) => ({ ...f, hour: e.target.value }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="*">Every hour</option>
                  <option value="*/2">Every 2 hours</option>
                  <option value="*/4">Every 4 hours</option>
                  <option value="*/6">Every 6 hours</option>
                  <option value="*/12">Every 12 hours</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={String(i)}>
                      At {i.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>

              {/* Day of month */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Day of Month
                </label>
                <select
                  value={builderFields.dayOfMonth}
                  onChange={(e) =>
                    setBuilderFields((f) => ({
                      ...f,
                      dayOfMonth: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="*">Every day</option>
                  <option value="1">1st</option>
                  <option value="15">15th</option>
                  <option value="1,15">1st and 15th</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month pills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Month{" "}
                <span className="text-slate-500 font-normal">
                  ({builderFields.month === "*" ? "every month" : builderFields.month})
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MONTH_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => toggleMonth(i + 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isMonthActive(i + 1)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setBuilderFields((f) => ({ ...f, month: "*" }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    builderFields.month === "*"
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-500 hover:text-white"
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Day of week pills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Day of Week{" "}
                <span className="text-slate-500 font-normal">
                  ({builderFields.dayOfWeek === "*" ? "every day" : builderFields.dayOfWeek})
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DOW_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => toggleDow(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDowActive(i)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setBuilderFields((f) => ({ ...f, dayOfWeek: "*" }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    builderFields.dayOfWeek === "*"
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-500 hover:text-white"
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-slate-400 mb-2">
            Plain English
          </h2>
          {isValid ? (
            <p className="text-xl text-white font-medium">{description}</p>
          ) : (
            <p className="text-red-400 text-sm">
              Invalid cron expression. Use 5 fields: minute hour day-of-month
              month day-of-week
            </p>
          )}
        </div>

        {/* Week timeline */}
        {weekTimeline.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-sm font-medium text-slate-400 mb-4">
              Next 7 Days Timeline
            </h2>
            <div className="relative h-10 bg-slate-800/80 rounded-full overflow-hidden">
              {/* Day markers */}
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-slate-700/50"
                  style={{ left: `${((i + 1) / 7) * 100}%` }}
                />
              ))}
              {/* Run dots */}
              {weekTimeline.map((run, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                  style={{ left: `${run.pct}%` }}
                  title={run.date.toLocaleString()}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
              <span>Now</span>
              {Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i + 1);
                return (
                  <span key={i}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                );
              })}
              <span>+7d</span>
            </div>
          </div>
        )}

        {/* Next 20 runs */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-slate-400 mb-4">
            Next 20 Runs
          </h2>
          {nextRuns.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {nextRuns.map((run, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-2.5 border border-slate-700/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-5 text-right font-mono">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-200 font-mono">
                      {run.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {run.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </div>
                  <span className="text-xs text-blue-400">
                    {relativeTime(run)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              {isValid
                ? "No runs found in the next year."
                : "Enter a valid cron expression to see upcoming runs."}
            </p>
          )}
        </div>

        {/* Quick reference */}
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setShowReference((v) => !v)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
          >
            <h2 className="text-sm font-medium text-slate-400">
              Quick Reference
            </h2>
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform ${showReference ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showReference && (
            <div className="px-6 pb-6 border-t border-slate-800/50">
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-2 pr-4">Field</th>
                    <th className="pb-2 pr-4">Allowed</th>
                    <th className="pb-2">Special</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-t border-slate-800/40">
                    <td className="py-2 pr-4 text-blue-400">Minute</td>
                    <td className="py-2 pr-4">0-59</td>
                    <td className="py-2 font-mono text-xs">* , - /</td>
                  </tr>
                  <tr className="border-t border-slate-800/40">
                    <td className="py-2 pr-4 text-blue-400">Hour</td>
                    <td className="py-2 pr-4">0-23</td>
                    <td className="py-2 font-mono text-xs">* , - /</td>
                  </tr>
                  <tr className="border-t border-slate-800/40">
                    <td className="py-2 pr-4 text-blue-400">Day of Month</td>
                    <td className="py-2 pr-4">1-31</td>
                    <td className="py-2 font-mono text-xs">* , - /</td>
                  </tr>
                  <tr className="border-t border-slate-800/40">
                    <td className="py-2 pr-4 text-blue-400">Month</td>
                    <td className="py-2 pr-4">1-12</td>
                    <td className="py-2 font-mono text-xs">* , - /</td>
                  </tr>
                  <tr className="border-t border-slate-800/40">
                    <td className="py-2 pr-4 text-blue-400">Day of Week</td>
                    <td className="py-2 pr-4">0-6 (Sun=0)</td>
                    <td className="py-2 font-mono text-xs">* , - /</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 p-3 bg-slate-800/40 rounded-lg text-xs text-slate-400 space-y-1">
                <p>
                  <code className="text-blue-300">*</code> = any value &nbsp;
                  <code className="text-blue-300">,</code> = list &nbsp;
                  <code className="text-blue-300">-</code> = range &nbsp;
                  <code className="text-blue-300">/</code> = step
                </p>
                <p>
                  Example: <code className="text-blue-300">*/15 9-17 * * 1-5</code>{" "}
                  = every 15 min, 9 AM to 5 PM, weekdays
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <ToolPageFooter toolId="cron-visualizer" />
    </div>
  );
}

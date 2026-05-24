import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Visualizer — Understand & Build Cron Expressions",
  description:
    "Visualize cron schedules on a timeline. Plain English explanations, visual builder, next 20 runs. Free, runs in browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

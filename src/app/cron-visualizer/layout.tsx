import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Visualizer — Build & Explain Cron Expressions Free",
  description:
    "Free cron expression builder and explainer. See your schedule on a timeline with plain English descriptions. No sign-up, works offline.",
  alternates: {
    canonical: "https://devtoolboxes.net/cron-visualizer",
  },
  openGraph: {
    title: "Cron Visualizer — Build & Explain Cron Expressions Free",
    description:
      "Free cron expression builder and explainer. See your schedule on a timeline with plain English descriptions. No sign-up, works offline.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

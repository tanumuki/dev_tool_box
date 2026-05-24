import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Explorer — Format & Visualize JSON Online Free",
  description:
    "Free online JSON formatter and viewer. Paste JSON, get instant tree view, syntax highlighting, and comparison. No uploads, no sign-up. 100% client-side.",
  alternates: {
    canonical: "https://devtoolboxes.net/json-explorer",
  },
  openGraph: {
    title: "JSON Explorer — Format & Visualize JSON Online Free",
    description:
      "Free online JSON formatter and viewer. Paste JSON, get instant tree view, syntax highlighting, and comparison. No uploads, no sign-up. 100% client-side.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diff Checker — Compare Text, JSON & Code Side by Side",
  description:
    "Compare two texts with character-level highlighting. JSON-aware diff ignores key order. Side-by-side and inline views. Free, runs in browser.",
};

export default function DiffCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

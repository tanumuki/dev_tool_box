import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diff Checker — Compare Text & Code Online Free",
  description:
    "Free online diff checker. Compare two texts side by side with character-level highlighting. No uploads, no sign-up. Works offline.",
  alternates: {
    canonical: "https://devtoolboxes.net/diff-checker",
  },
  openGraph: {
    title: "Diff Checker — Compare Text & Code Online Free",
    description:
      "Free online diff checker. Compare two texts side by side with character-level highlighting. No uploads, no sign-up. Works offline.",
  },
};

export default function DiffCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

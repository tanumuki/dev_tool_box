import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Preview — Live Editor & HTML Renderer Online Free",
  description:
    "Free Markdown editor with live preview. Write markdown, see rendered HTML side by side. Download as .md or copy HTML. No sign-up.",
  alternates: {
    canonical: "https://devtoolboxes.net/markdown-preview",
  },
  openGraph: {
    title: "Markdown Preview — Live Editor & HTML Renderer Online Free",
    description:
      "Free Markdown editor with live preview. Write markdown, see rendered HTML side by side. Download as .md or copy HTML. No sign-up.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

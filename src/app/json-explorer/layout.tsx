import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Explorer — Format, Visualize & Compare JSON",
  description:
    "Paste JSON and explore with interactive tree view. Search keys, compare two JSONs, convert to YAML/TypeScript. Free, fast, runs in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

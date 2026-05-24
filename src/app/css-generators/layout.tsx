import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Generators — Box Shadow, Gradient & Flexbox",
  description:
    "Generate CSS box shadows, gradients, flexbox layouts, border radius, and glassmorphism effects. Live preview, copy-ready code. Free, runs in browser.",
};

export default function CssGeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

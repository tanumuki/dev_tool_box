import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Generators — Box Shadow, Gradient & Glassmorphism Free",
  description:
    "Free visual CSS generators. Create box shadows, gradients, flexbox layouts, and glassmorphism effects with live preview. Copy CSS with one click.",
  alternates: {
    canonical: "https://devtoolboxes.net/css-generators",
  },
  openGraph: {
    title: "CSS Generators — Box Shadow, Gradient & Glassmorphism Free",
    description:
      "Free visual CSS generators. Create box shadows, gradients, flexbox layouts, and glassmorphism effects with live preview. Copy CSS with one click.",
  },
};

export default function CssGeneratorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

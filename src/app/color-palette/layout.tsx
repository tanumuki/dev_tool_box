import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palette Generator — Create & Extract Colors",
  description:
    "Pick colors, generate harmonious palettes, check WCAG contrast ratios. Supports HEX, RGB, HSL, HSV, CMYK. Free, runs in browser.",
};

export default function ColorPaletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

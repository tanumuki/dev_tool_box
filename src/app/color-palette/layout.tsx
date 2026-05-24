import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palette Generator — HEX RGB HSL & WCAG Contrast Free",
  description:
    "Free color palette generator. Create harmonious palettes, convert HEX/RGB/HSL, and check WCAG contrast ratios. No sign-up required.",
  alternates: {
    canonical: "https://devtoolboxes.net/color-palette",
  },
  openGraph: {
    title: "Color Palette Generator — HEX RGB HSL & WCAG Contrast Free",
    description:
      "Free color palette generator. Create harmonious palettes, convert HEX/RGB/HSL, and check WCAG contrast ratios. No sign-up required.",
  },
};

export default function ColorPaletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator — Create QR Codes Online Free",
  description:
    "Free QR code generator with custom colors. Create QR codes instantly, download as PNG or SVG. No sign-up, no tracking. 100% client-side.",
  alternates: {
    canonical: "https://devtoolboxes.net/qr-generator",
  },
  openGraph: {
    title: "QR Code Generator — Create QR Codes Online Free",
    description:
      "Free QR code generator with custom colors. Create QR codes instantly, download as PNG or SVG. No sign-up, no tracking. 100% client-side.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

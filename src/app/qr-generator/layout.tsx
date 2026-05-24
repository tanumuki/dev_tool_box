import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator — Create QR Codes Instantly",
  description:
    "Generate QR codes for URLs, emails, WiFi, phone numbers and more. Customize colors, size, and error correction. Free, runs in browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

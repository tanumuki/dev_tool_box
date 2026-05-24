import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor — Compress & Resize Images Free",
  description:
    "Compress JPEG, PNG, and WebP images in your browser. Drag-and-drop, before/after comparison, quality control. No upload to servers.",
};

export default function ImageCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

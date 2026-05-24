import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor — Compress Images Online Free & Private",
  description:
    "Free image compressor. Reduce JPG, PNG, WebP file size in your browser. No uploads to any server. Your images never leave your device.",
  alternates: {
    canonical: "https://devtoolboxes.net/image-compressor",
  },
  openGraph: {
    title: "Image Compressor — Compress Images Online Free & Private",
    description:
      "Free image compressor. Reduce JPG, PNG, WebP file size in your browser. No uploads to any server. Your images never leave your device.",
  },
};

export default function ImageCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

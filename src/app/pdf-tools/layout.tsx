import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Tools — Merge, Split & Compress PDFs Online Free",
  description:
    "Free PDF tools. Merge, split, compress, rotate, and watermark PDFs in your browser. Your files never leave your device. No sign-up.",
  keywords: [
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf to jpg",
    "pdf tools",
    "free pdf merge",
    "rotate pdf",
    "reorder pdf pages",
    "pdf to images",
    "images to pdf",
    "add page numbers pdf",
    "watermark pdf",
    "extract text pdf",
  ],
  alternates: {
    canonical: "https://devtoolboxes.net/pdf-tools",
  },
  openGraph: {
    title: "PDF Tools — Merge, Split & Compress PDFs Online Free",
    description:
      "Free PDF tools. Merge, split, compress, rotate, and watermark PDFs in your browser. Your files never leave your device. No sign-up.",
  },
};

export default function PdfToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

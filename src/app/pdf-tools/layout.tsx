import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Tools — Merge, Split, Compress & Convert PDFs Free",
  description:
    "Merge, split, compress, rotate, reorder PDFs and convert to images. 100% client-side — your files never leave your browser. Free, no sign-up.",
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
};

export default function PdfToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

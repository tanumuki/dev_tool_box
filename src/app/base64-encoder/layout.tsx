import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder — Convert Text & Files Online Free",
  description:
    "Free Base64 encoder and decoder. Convert text and files to/from Base64 with URL-safe mode. No sign-up, no uploads. Works offline.",
  alternates: {
    canonical: "https://devtoolboxes.net/base64-encoder",
  },
  openGraph: {
    title: "Base64 Encoder & Decoder — Convert Text & Files Online Free",
    description:
      "Free Base64 encoder and decoder. Convert text and files to/from Base64 with URL-safe mode. No sign-up, no uploads. Works offline.",
  },
};

export default function Base64EncoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

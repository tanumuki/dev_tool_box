import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder & Decoder — Percent-Encode Strings Online Free",
  description:
    "Free URL encoder and decoder. Percent-encode strings, parse URL components, and build query strings visually. No sign-up required.",
  alternates: {
    canonical: "https://devtoolboxes.net/url-encoder",
  },
  openGraph: {
    title: "URL Encoder & Decoder — Percent-Encode Strings Online Free",
    description:
      "Free URL encoder and decoder. Percent-encode strings, parse URL components, and build query strings visually. No sign-up required.",
  },
};

export default function UrlEncoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

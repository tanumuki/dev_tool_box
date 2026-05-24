import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator — MD5 SHA-256 SHA-512 Online Free",
  description:
    "Free hash generator. Compute MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or files. Compare hashes. 100% client-side.",
  alternates: {
    canonical: "https://devtoolboxes.net/hash-generator",
  },
  openGraph: {
    title: "Hash Generator — MD5 SHA-256 SHA-512 Online Free",
    description:
      "Free hash generator. Compute MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or files. Compare hashes. 100% client-side.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

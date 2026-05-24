import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder — Decode JSON Web Tokens Online Free",
  description:
    "Free JWT decoder. Paste a token, instantly see header, payload, claims, and expiration status. No sign-up, 100% client-side.",
  alternates: {
    canonical: "https://devtoolboxes.net/jwt-decoder",
  },
  openGraph: {
    title: "JWT Decoder — Decode JSON Web Tokens Online Free",
    description:
      "Free JWT decoder. Paste a token, instantly see header, payload, claims, and expiration status. No sign-up, 100% client-side.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

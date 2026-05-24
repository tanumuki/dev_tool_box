import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All 16 Free Developer Tools",
  description:
    "Browse all 16 free developer tools: JSON formatter, diff checker, regex tester, JWT decoder, Base64 encoder, hash generator, PDF tools, and more. 100% client-side, no sign-up.",
  alternates: {
    canonical: "https://devtoolboxes.net/tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

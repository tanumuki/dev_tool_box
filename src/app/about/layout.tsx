import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DevToolBox — Free Developer Tools",
  description:
    "DevToolBox is a collection of 16 free, fast, private developer tools that run 100% in your browser. No servers, no tracking, no sign-ups.",
  alternates: {
    canonical: "https://devtoolboxes.net/about",
  },
  openGraph: {
    title: "About DevToolBox — Free Developer Tools",
    description:
      "16 free, fast, private developer tools. Everything runs in your browser. Open source.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

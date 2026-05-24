import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DevToolBox",
  description:
    "DevToolBox is a collection of free, fast, private developer tools that run 100% in your browser. No servers, no tracking, no sign-ups.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

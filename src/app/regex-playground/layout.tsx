import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Playground — Test & Debug Regular Expressions",
  description:
    "Test regex with live matching and colored capture groups. Pattern library, plain English explainer, code generator. Free, runs in browser.",
};

export default function RegexPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

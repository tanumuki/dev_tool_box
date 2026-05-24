import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Playground — Test Regular Expressions Online Free",
  description:
    "Free regex tester with live matching, capture groups, and code generation. Test patterns instantly in your browser. No sign-up required.",
  alternates: {
    canonical: "https://devtoolboxes.net/regex-playground",
  },
  openGraph: {
    title: "Regex Playground — Test Regular Expressions Online Free",
    description:
      "Free regex tester with live matching, capture groups, and code generation. Test patterns instantly in your browser. No sign-up required.",
  },
};

export default function RegexPlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

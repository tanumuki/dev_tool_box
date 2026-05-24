import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OG Preview — Test Open Graph & Social Media Tags Free",
  description:
    "Free Open Graph preview tool. See how your site looks on Google, Twitter, Facebook, Slack, and Discord. Generate correct meta tags instantly.",
  alternates: {
    canonical: "https://devtoolboxes.net/og-preview",
  },
  openGraph: {
    title: "OG Preview — Test Open Graph & Social Media Tags Free",
    description:
      "Free Open Graph preview tool. See how your site looks on Google, Twitter, Facebook, Slack, and Discord. Generate correct meta tags instantly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

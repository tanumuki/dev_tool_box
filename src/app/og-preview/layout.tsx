import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OG Preview — See How Your Site Looks on Social Media",
  description:
    "Preview your Open Graph meta tags. See how your website appears on Google, Twitter, Facebook, LinkedIn, and Slack before publishing.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

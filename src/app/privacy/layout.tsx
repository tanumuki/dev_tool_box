import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "DevToolBox privacy policy. Your files never leave your browser. No sign-ups, no tracking, no personal data collection.",
  alternates: {
    canonical: "https://devtoolboxes.net/privacy",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timestamp Converter — Unix Epoch to Date Online Free",
  description:
    "Free Unix timestamp converter. Convert epoch to date, compare timezones, format dates instantly. No sign-up, works offline.",
  alternates: {
    canonical: "https://devtoolboxes.net/timestamp-converter",
  },
  openGraph: {
    title: "Timestamp Converter — Unix Epoch to Date Online Free",
    description:
      "Free Unix timestamp converter. Convert epoch to date, compare timezones, format dates instantly. No sign-up, works offline.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

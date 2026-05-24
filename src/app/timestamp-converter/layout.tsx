import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timestamp Converter — Unix Epoch & Timezone Tool",
  description:
    "Convert Unix timestamps to human dates and back. Compare timezones, format dates in ISO 8601, RFC 2822, and more. Free, runs in browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

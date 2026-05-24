import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://devtoolboxes.net";
  const lastModified = new Date();

  const routes = [
    "",
    "/tools",
    "/json-explorer",
    "/diff-checker",
    "/regex-playground",
    "/cron-visualizer",
    "/css-generators",
    "/qr-generator",
    "/image-compressor",
    "/color-palette",
    "/og-preview",
    "/timestamp-converter",
    "/pdf-tools",
    "/jwt-decoder",
    "/base64-encoder",
    "/url-encoder",
    "/markdown-preview",
    "/hash-generator",
    "/about",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route === "/tools" ? 0.9 : route === "/about" || route === "/privacy" ? 0.3 : 0.8,
  }));
}

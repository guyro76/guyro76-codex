import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date("2026-07-01T00:00:00.000Z");
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy-request`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/accessibility`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/security`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.5 },
  ];
}

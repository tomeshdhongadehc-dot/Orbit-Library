import type { MetadataRoute } from "next";
import { getItems } from "@/lib/catalog";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/items", "/search", "/changelog", "/about"].map((p) => ({ url: `${base}${p}` }));
  const items = getItems().map((i) => ({ url: `${base}/items/${i.id}`, lastModified: i.date }));
  return [...fixed, ...items];
}

import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.seo_title,
    short_name: s.website_name,
    description: s.seo_description,
    start_url: "/",
    display: "standalone",
    background_color: "#fffafb",
    theme_color: s.accent_color,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

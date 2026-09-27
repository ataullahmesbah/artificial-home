import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCategories, getPosts, getProducts, getSettings } from "@/lib/data";
import { isSectionVisible } from "@/lib/sections";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts, settings] = await Promise.all([getProducts(), getCategories(), getPosts(), getSettings()]);
  const base = siteConfig.url;
  const now = new Date();
  const pages = (["about", "faq", "contact"] as const).filter((k) => isSectionVisible(settings.sections, k));
  const showBlog = isSectionVisible(settings.sections, "blog");
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({ url: `${base}/shop/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...pages.map((k) => ({ url: `${base}/${k}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${base}/track`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 },
    ...(showBlog ? [{ url: `${base}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 }] : []),
    ...(showBlog ? posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.updated_at ?? p.published_at), changeFrequency: "monthly" as const, priority: 0.5 })) : []),
  ];
}

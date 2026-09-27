import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import { demoBanners, demoCategories, demoFaqs, demoPosts, demoProducts, demoProfile, demoReviews, demoSettings } from "@/data/demo";
import type { Banner, BlogPost, Category, Faq, Product, Profile, SiteSettings, Testimonial } from "@/types/content";

/**
 * Public read layer. When Supabase is not configured every getter returns the
 * built-in demo content, so the shop never renders empty.
 */

async function list<T>(table: string, fallback: T[], filter: (q: any) => any, order = "sort_order"): Promise<T[]> {
  const db = getPublicClient();
  if (!db) return fallback;
  const { data, error } = await filter(db.from(table).select("*")).order(order, { ascending: order === "sort_order" });
  if (error) {
    console.error(`[data] ${table}:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

async function single<T>(table: string, fallback: T): Promise<T> {
  const db = getPublicClient();
  if (!db) return fallback;
  const { data, error } = await db.from(table).select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) console.error(`[data] ${table}:`, error.message);
  return data ? ({ ...fallback, ...data } as T) : fallback;
}

export const getSettings = cache(() => single<SiteSettings>("site_settings", demoSettings));
export const getProfile = cache(() => single<Profile>("profile", demoProfile));

export const getCategories = cache(() => list<Category>("categories", demoCategories, (q) => q.eq("active", true)));

export const getProducts = cache(async () =>
  // numeric columns can arrive as strings — normalise them once here
  (await list<Product>("products", demoProducts, (q) => q.eq("status", "published"))).map((p) => ({
    ...p,
    price: Number(p.price),
    sale_price: p.sale_price === null ? null : Number(p.sale_price),
    rating: Number(p.rating),
    stock: Number(p.stock),
    images: p.images ?? [],
    colors: p.colors ?? [],
  }))
);

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
});

export const getBanners = cache(() => list<Banner>("banners", demoBanners, (q) => q.eq("active", true)));
export const getFaqs = cache(() => list<Faq>("faqs", demoFaqs, (q) => q.eq("active", true)));
export const getReviews = cache(() => list<Testimonial>("testimonials", demoReviews, (q) => q.eq("active", true)));

export const getPosts = cache(() => list<BlogPost>("blog_posts", demoPosts, (q) => q.eq("status", "published"), "published_at"));

export const getPostBySlug = cache(async (slug: string) => {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
});

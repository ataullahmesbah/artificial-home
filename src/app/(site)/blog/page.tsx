import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { PageBanner } from "@/components/shop/page-banner";
import { BlogCard } from "@/components/shop/blog-card";
import { getPosts, getSettings } from "@/lib/data";
import { isSectionVisible } from "@/lib/sections";

export const metadata: Metadata = { title: "Blog", description: "Jewellery care, style guides and trends.", alternates: { canonical: "/blog" } };

export default async function BlogPage() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()]);
  if (!isSectionVisible(settings.sections, "blog")) notFound();
  return (
    <>
      <PageBanner title="Style Journal" text="Jewellery care, styling tips and the latest trends." crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      <div className="container-x section">
        {posts.length ? (
          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.id}>
                <BlogCard post={p} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="text-center">New articles are coming soon.</p>
        )}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClipReveal, Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/site/json-ld";
import { RichText } from "@/components/site/rich-text";
import { BlogCard } from "@/components/shop/blog-card";
import { getPostBySlug, getPosts, getProfile, getSettings } from "@/lib/data";
import { isSectionVisible } from "@/lib/sections";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, url: `/blog/${post.slug}`, publishedTime: post.published_at },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, posts, profile, settings] = await Promise.all([getPostBySlug(slug), getPosts(), getProfile(), getSettings()]);
  if (!post || !isSectionVisible(settings.sections, "blog")) notFound();
  const more = posts.filter((p) => p.id !== post.id).slice(0, 3);
  return (
    <article className="container-x section">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_at,
          image: new URL(post.cover_image_url, siteConfig.url).toString(),
          url: `${siteConfig.url}/blog/${post.slug}`,
          author: { "@type": "Person", name: profile.full_name },
          publisher: { "@type": "Organization", name: settings.website_name },
        }}
      />
      <div className="mx-auto max-w-[780px]">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent-ink">
          <ArrowLeft size={16} /> All articles
        </Link>
        <Reveal y={20} className="mt-6">
          <span className="chip bg-accent/10 text-accent-ink">{post.category}</span>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3rem)] leading-tight">{post.title}</h1>
          <p className="mt-3 text-muted">
            By {profile.full_name} · {formatDate(post.published_at)} · {post.read_time}
          </p>
        </Reveal>
      </div>
      <ClipReveal className="relative mx-auto mt-10 aspect-[3/2] max-w-[1000px] overflow-hidden rounded-[28px] bg-surface">
        <Image src={post.cover_image_url} alt="" fill preload sizes="(min-width: 1040px) 1000px, 100vw" className="object-cover" />
      </ClipReveal>
      <Reveal className="mx-auto mt-12 max-w-[760px]">
        <RichText content={post.content} />
      </Reveal>
      {more.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1100px] border-t border-line pt-14" aria-label="More articles">
          <h2 className="h-section mb-10 text-center">
            Keep <em>reading</em>
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

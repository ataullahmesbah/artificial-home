import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types/content";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group h-full">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="relative aspect-[3/2] overflow-hidden rounded-[22px] bg-surface">
          <Image src={post.cover_image_url} alt="" fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="chip absolute top-4 left-4 bg-card/90 text-heading backdrop-blur">{post.category}</span>
        </div>
        <p className="mt-4 text-sm text-muted">
          {formatDate(post.published_at)} · {post.read_time}
        </p>
        <h3 className="mt-1.5 text-[21px] leading-snug transition-colors group-hover:text-accent-ink">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-[15px]">{post.excerpt}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
          Read more <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </article>
  );
}

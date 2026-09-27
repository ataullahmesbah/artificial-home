import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionTitle } from "@/components/shop/section-title";
import type { Category } from "@/types/content";

export function CategoryCircles({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  if (!categories.length) return null;
  return (
    <section className="section" aria-labelledby="cats-title">
      <div className="container-x">
        <SectionTitle eyebrow="Shop by category" title="Find your *perfect* piece" />
        <Stagger className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-7">
          {categories.map((c) => (
            <StaggerItem key={c.id} className="w-[110px] shrink-0 sm:w-auto">
              <Link href={`/shop/${c.slug}`} className="group flex flex-col items-center text-center">
                <span className="relative block aspect-square w-full overflow-hidden rounded-full border-4 border-card bg-surface shadow-[var(--shadow)] ring-1 ring-line transition-all duration-500 group-hover:ring-accent">
                  {c.image_url && <Image src={c.image_url} alt="" fill sizes="(min-width: 1024px) 150px, 110px" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                </span>
                <span className="mt-3 font-heading text-[16px] font-semibold text-heading transition-colors group-hover:text-accent-ink">{c.name}</span>
                <span className="text-xs text-muted">{counts[c.slug] ?? 0} items</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

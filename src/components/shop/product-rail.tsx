"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/types/content";

/** Horizontally scrolling row of products with arrow buttons (swipe on phones). */
export function ProductRail({ products, categoryNames, label }: { products: Product[]; categoryNames: Record<string, string>; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  if (!products.length) return null;
  return (
    <div className="relative">
      <div className="mb-5 flex justify-end gap-2">
        <button type="button" onClick={() => scroll(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-heading hover:border-accent hover:text-accent-ink" aria-label={`Scroll ${label} left`}>
          <ChevronLeft size={20} />
        </button>
        <button type="button" onClick={() => scroll(1)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-heading hover:border-accent hover:text-accent-ink" aria-label={`Scroll ${label} right`}>
          <ChevronRight size={20} />
        </button>
      </div>
      <ul ref={ref} aria-label={label} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:gap-6 sm:px-0">
        {products.map((p) => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23.2%]">
            <ProductCard product={p} categoryName={p.category_slug ? categoryNames[p.category_slug] : undefined} />
          </li>
        ))}
      </ul>
    </div>
  );
}

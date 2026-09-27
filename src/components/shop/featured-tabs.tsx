"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/content";

export function FeaturedTabs({ products, categoryNames }: { products: Product[]; categoryNames: Record<string, string> }) {
  const tabs = [
    { key: "best", label: "Best Sellers", list: products.filter((p) => p.featured) },
    { key: "new", label: "New In", list: products.filter((p) => p.is_new) },
    { key: "sale", label: "On Sale", list: products.filter((p) => p.sale_price !== null && p.sale_price < p.price) },
  ].filter((t) => t.list.length);
  const [tab, setTab] = useState(tabs[0]?.key);
  if (!tabs.length) return null;
  const current = tabs.find((t) => t.key === tab) ?? tabs[0];

  return (
    <>
      <div role="tablist" aria-label="Product groups" className="mb-9 flex justify-center">
        <div className="inline-flex rounded-full border border-line bg-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={current.key === t.key}
              onClick={() => setTab(t.key)}
              className={cn("relative rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-6", current.key === t.key ? "text-on-accent" : "text-heading hover:text-accent-ink")}
            >
              {current.key === t.key && <motion.span layoutId="feat-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          role="tabpanel"
          className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
        >
          {current.list.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} categoryName={p.category_slug ? categoryNames[p.category_slug] : undefined} />
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="mt-12 text-center">
        <Link href={current.key === "sale" ? "/shop?sale=1" : current.key === "new" ? "/shop?new=1" : "/shop"} className="btn btn-dark">
          View All <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </>
  );
}

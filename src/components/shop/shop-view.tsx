"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { cn, formatPrice, priceOf } from "@/lib/utils";
import type { Category, Product } from "@/types/content";

export type ShopQuery = { q: string; sort: string; sale: boolean; isNew: boolean; inStock: boolean; min: string; max: string; cat: string };

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function ShopView({ products, categories, initial, fixedCategory }: { products: Product[]; categories: Category[]; initial: ShopQuery; fixedCategory?: string }) {
  const [f, setF] = useState<ShopQuery>(initial);
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<ShopQuery>) => setF((s) => ({ ...s, ...patch }));
  const names = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  // Keep the address bar in sync so filtered pages can be shared.
  useEffect(() => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.sort !== "featured") p.set("sort", f.sort);
    if (f.sale) p.set("sale", "1");
    if (f.isNew) p.set("new", "1");
    if (f.inStock) p.set("stock", "1");
    if (f.min) p.set("min", f.min);
    if (f.max) p.set("max", f.max);
    if (!fixedCategory && f.cat) p.set("cat", f.cat);
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [f, fixedCategory]);

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const min = Number(f.min) || 0;
    const max = Number(f.max) || Infinity;
    const cat = fixedCategory ?? f.cat;
    const out = products.filter((p) => {
      const price = priceOf(p).now;
      if (cat && p.category_slug !== cat) return false;
      if (q && !`${p.name} ${p.short_description} ${names[p.category_slug ?? ""] ?? ""}`.toLowerCase().includes(q)) return false;
      if (f.sale && priceOf(p).was === null) return false;
      if (f.isNew && !p.is_new) return false;
      if (f.inStock && p.stock <= 0) return false;
      return price >= min && price <= max;
    });
    const by: Record<string, (a: Product, b: Product) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order,
      new: (a, b) => Number(b.is_new) - Number(a.is_new) || (b.created_at ?? "").localeCompare(a.created_at ?? ""),
      "price-asc": (a, b) => priceOf(a).now - priceOf(b).now,
      "price-desc": (a, b) => priceOf(b).now - priceOf(a).now,
      rating: (a, b) => b.rating - a.rating || b.review_count - a.review_count,
    };
    return out.sort(by[f.sort] ?? by.featured);
  }, [products, f, fixedCategory, names]);

  const counts: Record<string, number> = {};
  for (const p of products) if (p.category_slug) counts[p.category_slug] = (counts[p.category_slug] ?? 0) + 1;
  const active = [f.sale, f.isNew, f.inStock, Boolean(f.min), Boolean(f.max), Boolean(!fixedCategory && f.cat), Boolean(f.q)].filter(Boolean).length;
  const reset = () => setF({ q: "", sort: f.sort, sale: false, isNew: false, inStock: false, min: "", max: "", cat: "" });

  const filters = (
    <div className="flex flex-col gap-8">
      {!fixedCategory ? (
        <fieldset>
          <legend className="mb-3 font-heading text-lg text-heading">Categories</legend>
          <ul className="flex flex-col gap-1">
            {[{ slug: "", name: "All products" }, ...categories].map((c) => (
              <li key={c.slug || "all"}>
                <button
                  type="button"
                  onClick={() => set({ cat: c.slug })}
                  aria-pressed={f.cat === c.slug}
                  className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[15px] transition-colors", f.cat === c.slug ? "bg-accent/10 font-semibold text-accent-ink" : "hover:bg-surface")}
                >
                  {c.name}
                  <span className="text-xs text-muted">{c.slug ? (counts[c.slug] ?? 0) : products.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : (
        <div>
          <p className="mb-3 font-heading text-lg text-heading">Categories</p>
          <ul className="flex flex-col gap-1">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop/${c.slug}`} className={cn("flex items-center justify-between rounded-xl px-3 py-2 text-[15px]", c.slug === fixedCategory ? "bg-accent/10 font-semibold text-accent-ink" : "hover:bg-surface")}>
                  {c.name} <span className="text-xs text-muted">{counts[c.slug] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <fieldset>
        <legend className="mb-3 font-heading text-lg text-heading">Price (৳)</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="f-min">
            Minimum price
          </label>
          <input id="f-min" inputMode="numeric" placeholder="Min" value={f.min} onChange={(e) => set({ min: e.target.value.replace(/\D/g, "") })} className="field !py-2" />
          <span className="text-muted">–</span>
          <label className="sr-only" htmlFor="f-max">
            Maximum price
          </label>
          <input id="f-max" inputMode="numeric" placeholder="Max" value={f.max} onChange={(e) => set({ max: e.target.value.replace(/\D/g, "") })} className="field !py-2" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["", "500"],
            ["500", "1000"],
            ["1000", "2000"],
            ["2000", ""],
          ].map(([a, b]) => (
            <button key={a + b} type="button" onClick={() => set({ min: a, max: b })} className="chip border border-line bg-card !font-medium text-heading hover:border-accent">
              {a ? formatPrice(+a) : "Under"} {b ? `– ${formatPrice(+b)}` : "+"}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-lg text-heading">Show only</legend>
        {(
          [
            ["sale", "On sale"],
            ["isNew", "New arrivals"],
            ["inStock", "In stock"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex cursor-pointer items-center gap-3 text-[15px]">
            <input type="checkbox" checked={f[k]} onChange={(e) => set({ [k]: e.target.checked })} className="h-5 w-5 rounded accent-[var(--accent)]" />
            {label}
          </label>
        ))}
      </fieldset>
      {active > 0 && (
        <button type="button" onClick={reset} className="btn btn-outline btn-sm">
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-28">{filters}</div>
      </aside>

      <div>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden />
            <label htmlFor="shop-q" className="sr-only">
              Search products
            </label>
            <input id="shop-q" type="search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search products…" className="field !rounded-full !pl-11" />
          </div>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm lg:hidden">
            <SlidersHorizontal size={16} /> Filters{active ? ` (${active})` : ""}
          </button>
          <label htmlFor="shop-sort" className="sr-only">
            Sort by
          </label>
          <select id="shop-sort" value={f.sort} onChange={(e) => set({ sort: e.target.value })} className="field !w-auto !rounded-full !py-2.5">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mb-6 text-sm text-muted" aria-live="polite">
          Showing {list.length} of {fixedCategory ? (counts[fixedCategory] ?? 0) : products.length} products
        </p>

        {list.length ? (
          <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((p) => (
                <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }}>
                  <ProductCard product={p} categoryName={p.category_slug ? names[p.category_slug] : undefined} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="rounded-[24px] border border-dashed border-line py-20 text-center">
            <p className="font-heading text-2xl text-heading">No products found</p>
            <p className="mt-2">Try another search or clear the filters.</p>
            <button type="button" onClick={reset} className="btn btn-primary btn-sm mt-6">
              Clear filters
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="fixed inset-y-0 left-0 z-[61] w-[min(340px,88vw)] overflow-y-auto bg-bg p-6 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="font-heading text-2xl text-heading">Filters</p>
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label="Close filters" autoFocus>
                  <X size={20} />
                </button>
              </div>
              {filters}
              <button type="button" onClick={() => setOpen(false)} className="btn btn-primary mt-8 w-full">
                Show {list.length} products
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

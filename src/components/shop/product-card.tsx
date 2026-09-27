"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Price, Stars } from "@/components/shop/price";
import { QuickView } from "@/components/shop/quick-view";
import { cart, useWishlist, wishlist } from "@/lib/shop/store";
import { cn, priceOf } from "@/lib/utils";
import type { Product } from "@/types/content";

export function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const wish = useWishlist();
  const liked = wish.includes(product.id);
  const [quick, setQuick] = useState(false);
  const { now, off } = priceOf(product);
  const soldOut = product.stock <= 0;
  const [img1, img2] = product.images;

  const addToCart = () =>
    cart.add({ id: product.id, slug: product.slug, name: product.name, image: img1 ?? null, price: now, color: product.colors[0]?.name ?? null, stock: product.stock });

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-surface">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          {img1 && <Image src={img1} alt={product.name} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw" className="object-cover transition-all duration-700 group-hover:scale-105" />}
          {img2 && <Image src={img2} alt="" fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="chip bg-accent text-on-accent">-{off}%</span>}
          {product.badge && !(product.badge === "Sale" && off > 0) && <span className="chip bg-card/90 text-heading backdrop-blur">{product.badge}</span>}
          {soldOut && <span className="chip bg-heading text-bg">Sold out</span>}
        </div>

        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={cn("absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors", liked ? "text-accent" : "text-heading hover:text-accent")}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "pop" : ""} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
          <button type="button" onClick={addToCart} disabled={soldOut} className="btn btn-primary btn-sm flex-1 !px-3 max-sm:!text-[13px]">
            <ShoppingBag size={16} aria-hidden /> {soldOut ? "Sold out" : "Add"}
          </button>
          <button type="button" onClick={() => setQuick(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-heading shadow-sm hover:text-accent-ink" aria-label={`Quick view: ${product.name}`}>
            <Eye size={17} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        {categoryName && <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{categoryName}</p>}
        <h3 className="mt-1 font-heading text-[17px] leading-snug">
          <Link href={`/product/${product.slug}`} className="transition-colors hover:text-accent-ink">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1.5">
          <Stars rating={product.rating} count={product.review_count} size={13} />
        </div>
        <Price product={product} className="mt-2" />
      </div>

      <AnimatePresence>{quick && <QuickView product={product} onClose={() => setQuick(false)} />}</AnimatePresence>
    </article>
  );
}

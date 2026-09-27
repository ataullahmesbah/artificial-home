"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { useWishlist } from "@/lib/shop/store";
import type { Product } from "@/types/content";

export function WishlistView({ products, categoryNames }: { products: Product[]; categoryNames: Record<string, string> }) {
  const ids = useWishlist();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="h-60" aria-busy="true" />;
  const list = products.filter((p) => ids.includes(p.id));
  if (!list.length)
    return (
      <div className="rounded-[28px] border border-dashed border-line py-20 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface text-accent">
          <Heart size={32} />
        </span>
        <p className="mt-5 font-heading text-2xl text-heading">Your wishlist is empty</p>
        <p className="mt-2">Tap the heart on any product to save it here.</p>
        <Link href="/shop" className="btn btn-primary mt-7">
          Browse Products
        </Link>
      </div>
    );
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {list.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} categoryName={p.category_slug ? categoryNames[p.category_slug] : undefined} />
        </li>
      ))}
    </ul>
  );
}

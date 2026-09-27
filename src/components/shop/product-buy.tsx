"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { cart, useWishlist, wishlist } from "@/lib/shop/store";
import { cn, priceOf } from "@/lib/utils";
import type { Product } from "@/types/content";

/** Colour picker, quantity, Add to cart, Buy now, wishlist and WhatsApp order. */
export function ProductBuy({ product, whatsapp, compact = false }: { product: Product; whatsapp: string | null; compact?: boolean }) {
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]?.name ?? null);
  const [qty, setQty] = useState(1);
  const liked = useWishlist().includes(product.id);
  const { now } = priceOf(product);
  const soldOut = product.stock <= 0;
  const max = Math.max(1, Math.min(20, product.stock));

  const item = { id: product.id, slug: product.slug, name: product.name, image: product.images[0] ?? null, price: now, color, stock: product.stock };
  const waText = encodeURIComponent(`Hi! I want to order:\n${product.name}${color ? ` (${color})` : ""} × ${qty}`);

  return (
    <div className="flex flex-col gap-5">
      {product.colors.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-heading">
            Colour: <span className="font-normal text-text">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-pressed={color === c.name}
                aria-label={c.name}
                title={c.name}
                className={cn("h-9 w-9 rounded-full border-2 p-0.5 transition-all", color === c.name ? "border-accent scale-110" : "border-line hover:border-muted")}
              >
                <span className="block h-full w-full rounded-full border border-black/10" style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-[50px] items-center rounded-full border-[1.5px] border-line bg-card">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-11 place-items-center text-heading disabled:opacity-40" disabled={qty <= 1} aria-label="Less">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-bold text-heading" aria-live="polite" aria-label={`Quantity ${qty}`}>
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => Math.min(max, q + 1))} className="grid h-full w-11 place-items-center text-heading disabled:opacity-40" disabled={qty >= max} aria-label="More">
            <Plus size={16} />
          </button>
        </div>
        <button type="button" disabled={soldOut} onClick={() => cart.add(item, qty)} className="btn btn-dark flex-1">
          <ShoppingBag size={18} aria-hidden /> {soldOut ? "Sold out" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={liked}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className={cn("grid h-[50px] w-[50px] place-items-center rounded-full border-[1.5px] border-line bg-card transition-colors", liked ? "text-accent" : "text-heading hover:text-accent")}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} className={liked ? "pop" : ""} />
        </button>
      </div>

      {!compact && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              cart.add(item, qty, false);
              router.push("/checkout");
            }}
            className="btn btn-primary"
          >
            <Zap size={18} aria-hidden /> Buy Now
          </button>
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn border-[1.5px] border-[#25d366] text-[#128c4a] hover:bg-[#25d366] hover:text-white dark:text-[#4ade80]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.8a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.5-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zM12 0a12 12 0 0 0-10.3 18.1L0 24l6-1.6A12 12 0 1 0 12 0z" />
              </svg>
              Order on WhatsApp
            </a>
          )}
        </div>
      )}
      {product.stock > 0 && product.stock <= 5 && <p className="text-sm font-semibold text-accent-ink">Hurry! Only {product.stock} left in stock.</p>}
    </div>
  );
}

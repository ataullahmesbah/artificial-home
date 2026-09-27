"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cart, useCart } from "@/lib/shop/store";
import { formatPrice } from "@/lib/utils";

export function CartView({ freeMin, inside, outside }: { freeMin: number; inside: number; outside: number }) {
  const { items, subtotal } = useCart();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="h-60" aria-busy="true" />;

  if (!items.length)
    return (
      <div className="rounded-[28px] border border-dashed border-line py-20 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface text-accent">
          <ShoppingBag size={32} />
        </span>
        <p className="mt-5 font-heading text-2xl text-heading">Your cart is empty</p>
        <p className="mt-2">Find something you&rsquo;ll love.</p>
        <Link href="/shop" className="btn btn-primary mt-7">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );

  const free = freeMin > 0 && subtotal >= freeMin;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <ul className="flex flex-col divide-y divide-line rounded-[24px] border border-line bg-card px-5 sm:px-7">
        {items.map((i) => (
          <li key={i.id + (i.color ?? "")} className="flex gap-4 py-6">
            <Link href={`/product/${i.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface sm:h-28 sm:w-28">
              {i.image && <Image src={i.image} alt="" fill sizes="112px" className="object-cover" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/product/${i.slug}`} className="font-heading text-lg text-heading hover:text-accent-ink">
                  {i.name}
                </Link>
                {i.color && <p className="text-sm text-muted">Colour: {i.color}</p>}
                <p className="text-sm">{formatPrice(i.price)} each</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-line">
                  <button type="button" className="grid h-9 w-9 place-items-center" onClick={() => cart.setQty(i.id, i.color, i.qty - 1)} aria-label={`Less ${i.name}`}>
                    <Minus size={15} />
                  </button>
                  <span className="w-7 text-center font-bold text-heading">{i.qty}</span>
                  <button type="button" className="grid h-9 w-9 place-items-center" onClick={() => cart.setQty(i.id, i.color, i.qty + 1)} aria-label={`More ${i.name}`}>
                    <Plus size={15} />
                  </button>
                </div>
                <span className="w-20 text-right font-bold text-heading">{formatPrice(i.price * i.qty)}</span>
                <button type="button" onClick={() => cart.remove(i.id, i.color)} className="p-1 text-muted hover:text-accent" aria-label={`Remove ${i.name}`}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-[24px] bg-surface p-7 lg:sticky lg:top-28">
        <h2 className="text-2xl">Order Summary</h2>
        <dl className="mt-6 flex flex-col gap-3 text-[15px]">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-heading">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="text-right text-heading">{free ? "Free 🎉" : `${formatPrice(inside)} – ${formatPrice(outside)}`}</dd>
          </div>
        </dl>
        {!free && freeMin > 0 && <p className="mt-3 text-sm">Add {formatPrice(freeMin - subtotal)} more for free delivery.</p>}
        <p className="mt-4 text-sm text-muted">Delivery is calculated at checkout from your area.</p>
        <Link href="/checkout" className="btn btn-primary mt-6 w-full">
          Proceed to Checkout <ArrowRight size={18} />
        </Link>
        <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-accent-ink hover:underline">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}

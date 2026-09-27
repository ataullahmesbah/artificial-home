"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cart, cartDrawer, useCart, useCartDrawer } from "@/lib/shop/store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer({ freeMin }: { freeMin: number }) {
  const open = useCartDrawer();
  const { items, subtotal, count } = useCart();
  const pathname = usePathname();

  useEffect(() => cartDrawer.close(), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cartDrawer.close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const left = freeMin > 0 ? Math.max(0, freeMin - subtotal) : 0;
  const progress = freeMin > 0 ? Math.min(100, (subtotal / freeMin) * 100) : 100;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cartDrawer.close} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-[61] flex w-[min(420px,100vw)] flex-col bg-bg shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-xl">Your Cart ({count})</h2>
              <button type="button" onClick={cartDrawer.close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label="Close cart" autoFocus>
                <X size={20} />
              </button>
            </div>

            {freeMin > 0 && items.length > 0 && (
              <div className="border-b border-line px-5 py-3 text-sm">
                {left > 0 ? (
                  <p>
                    Add <b className="text-accent-ink">{formatPrice(left)}</b> more for <b>free delivery</b> 🎉
                  </p>
                ) : (
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">You&rsquo;ve unlocked free delivery! 🎉</p>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface text-accent">
                      <ShoppingBag size={32} />
                    </span>
                    <p className="mt-4 font-heading text-xl text-heading">Your cart is empty</p>
                    <Link href="/shop" className="btn btn-primary btn-sm mt-5">
                      Start Shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((i) => (
                    <li key={i.id + (i.color ?? "")} className="flex gap-3">
                      <Link href={`/product/${i.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface">
                        {i.image && <Image src={i.image} alt="" fill sizes="80px" className="object-cover" />}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/product/${i.slug}`} className="line-clamp-2 font-semibold text-heading hover:text-accent-ink">
                          {i.name}
                        </Link>
                        {i.color && <p className="text-xs text-muted">{i.color}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-line">
                            <button type="button" className="grid h-8 w-8 place-items-center" onClick={() => cart.setQty(i.id, i.color, i.qty - 1)} aria-label="Less">
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-heading">{i.qty}</span>
                            <button type="button" className="grid h-8 w-8 place-items-center" onClick={() => cart.setQty(i.id, i.color, i.qty + 1)} aria-label="More">
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-bold text-heading">{formatPrice(i.price * i.qty)}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => cart.remove(i.id, i.color)} className="self-start p-1 text-muted hover:text-accent" aria-label={`Remove ${i.name}`}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-5 py-5">
                <div className="mb-4 flex justify-between text-lg">
                  <span className="font-semibold text-heading">Subtotal</span>
                  <span className="font-bold text-heading">{formatPrice(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/cart" className="btn btn-outline btn-sm">
                    View Cart
                  </Link>
                  <Link href="/checkout" className="btn btn-primary btn-sm">
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

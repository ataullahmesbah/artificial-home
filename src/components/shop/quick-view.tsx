"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Price, Stars } from "@/components/shop/price";
import { ProductBuy } from "@/components/shop/product-buy";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/content";

export function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`qv-${product.id}`}
        className="relative grid w-full max-w-[920px] gap-6 overflow-hidden rounded-[28px] bg-bg p-4 shadow-2xl sm:p-6 md:grid-cols-2"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" onClick={onClose} className="absolute top-3 right-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-card text-heading shadow-sm hover:text-accent" aria-label="Close">
          <X size={20} />
        </button>
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[20px] bg-surface">
            {product.images[active] && <Image src={product.images[active]} alt={product.name} fill sizes="440px" className="object-cover" />}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button key={src + i} type="button" onClick={() => setActive(i)} className={cn("relative h-16 w-16 overflow-hidden rounded-xl border-2", active === i ? "border-accent" : "border-transparent")} aria-label={`Picture ${i + 1}`}>
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 md:py-4 md:pr-6">
          <h2 id={`qv-${product.id}`} className="pr-10 text-[26px]">
            {product.name}
          </h2>
          <Stars rating={product.rating} count={product.review_count} />
          <Price product={product} big />
          <p>{product.short_description}</p>
          <ProductBuy product={product} whatsapp={null} compact />
          <Link href={`/product/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">
            View full details <ArrowRight size={15} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

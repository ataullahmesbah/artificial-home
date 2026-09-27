"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { Stars } from "@/components/shop/price";
import { SectionTitle } from "@/components/shop/section-title";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

export function Reviews({ reviews }: { reviews: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = reviews.length;
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6500);
    return () => clearInterval(t);
  }, [n, paused]);
  if (!n) return null;
  const r = reviews[i % n];
  const avg = reviews.reduce((s, x) => s + x.rating, 0) / n;

  return (
    <section className="section bg-surface/60" aria-roledescription="carousel" aria-label="Customer reviews" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x">
        <SectionTitle eyebrow="Happy customers" title="Loved by *girls* all over Bangladesh" text={`${avg.toFixed(1)} out of 5 from our customers`} />
        <div className="mx-auto max-w-[780px]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}
              className="card relative !rounded-[28px] px-7 py-10 text-center sm:px-14"
              aria-live="polite"
            >
              <Quote size={40} className="mx-auto text-accent/40" aria-hidden />
              <div className="mt-3 flex justify-center">
                <Stars rating={r.rating} size={17} />
              </div>
              <blockquote className="mt-5 font-heading text-[clamp(1.15rem,2.2vw,1.45rem)] leading-relaxed text-heading italic">&ldquo;{r.quote}&rdquo;</blockquote>
              <figcaption className="mt-7 flex items-center justify-center gap-3.5">
                {r.avatar_url && (
                  <span className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-accent/40 bg-surface">
                    <Image src={r.avatar_url} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                )}
                <span className="text-left">
                  <span className="block font-semibold text-heading">{r.name}</span>
                  <span className="block text-sm text-muted">
                    {[r.role, r.project_title && `bought ${r.project_title}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {n > 1 && (
            <div className="mt-7 flex items-center justify-center gap-4">
              <button type="button" onClick={() => setI((v) => (v - 1 + n) % n)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card hover:text-accent-ink" aria-label="Previous review">
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {reviews.map((x, k) => (
                  <button key={x.id} type="button" onClick={() => setI(k)} aria-label={`Review ${k + 1}`} aria-current={k === i % n} className={cn("h-2.5 rounded-full transition-all", k === i % n ? "w-8 bg-accent" : "w-2.5 bg-heading/20")} />
                ))}
              </div>
              <button type="button" onClick={() => setI((v) => (v + 1) % n)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card hover:text-accent-ink" aria-label="Next review">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

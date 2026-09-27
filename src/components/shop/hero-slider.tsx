"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types/content";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;
  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, paused]);
  if (!n) return null;
  const b = banners[i % n];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative min-h-[560px] sm:min-h-[600px] lg:h-[calc(100svh-120px)] lg:max-h-[760px] lg:min-h-[560px]">
        <AnimatePresence mode="sync">
          <motion.div key={b.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease }}>
            <Image src={b.image_url} alt="" fill preload={i === 0} sizes="100vw" className="object-cover object-[72%_center] max-md:object-[80%_center]" />
            {/* soft wash so the text is always readable on phones */}
            <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent max-md:bg-gradient-to-t max-md:from-bg max-md:via-bg/75 max-md:to-bg/10" />
          </motion.div>
        </AnimatePresence>

        <div className="container-x relative flex h-full min-h-[inherit] items-end pb-24 md:items-center md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={b.id} className="max-w-[560px]" initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
              {b.kicker && (
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }} className="eyebrow !text-[12px] sm:!text-[13px]">
                  {b.kicker}
                </motion.p>
              )}
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
                className="mt-4 text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.05] font-semibold"
              >
                {b.title}
              </motion.h1>
              {b.subtitle && (
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }} className="mt-5 max-w-[460px] text-[17px] leading-relaxed text-heading/75">
                  {b.subtitle}
                </motion.p>
              )}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }} className="mt-8 flex flex-wrap gap-3">
                <Link href={b.button_link || "/shop"} className="btn btn-primary">
                  {b.button_label || "Shop Now"} <ArrowRight size={18} aria-hidden />
                </Link>
                <Link href="/shop" className="btn btn-outline">
                  All Products
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {n > 1 && (
          <div className="container-x absolute inset-x-0 bottom-7 flex items-center gap-3">
            <button type="button" onClick={() => setI((v) => (v - 1 + n) % n)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card/80 text-heading backdrop-blur hover:text-accent-ink" aria-label="Previous slide">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {banners.map((x, k) => (
                <button key={x.id} type="button" onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} aria-current={k === i % n} className={cn("h-2.5 rounded-full transition-all duration-500", k === i % n ? "w-9 bg-accent" : "w-2.5 bg-heading/25 hover:bg-heading/50")} />
              ))}
            </div>
            <button type="button" onClick={() => setI((v) => (v + 1) % n)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card/80 text-heading backdrop-blur hover:text-accent-ink" aria-label="Next slide">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

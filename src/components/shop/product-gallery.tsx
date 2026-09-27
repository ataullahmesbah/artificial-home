"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Big picture with hover zoom + thumbnails. */
export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const src = images[active];
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto sm:flex-col">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show picture ${i + 1}`}
              aria-current={active === i}
              className={cn("relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-surface transition-colors sm:h-24 sm:w-24", active === i ? "border-accent" : "border-transparent hover:border-line")}
            >
              <Image src={img} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative aspect-square flex-1 overflow-hidden rounded-[28px] bg-surface"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait">
          <motion.div key={src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            {src && (
              <Image
                src={src}
                alt={name}
                fill
                preload
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover transition-transform duration-200"
                style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            )}
          </motion.div>
        </AnimatePresence>
        {badge}
      </div>
    </div>
  );
}

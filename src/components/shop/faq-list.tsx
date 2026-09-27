"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Faq } from "@/types/content";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <ul className="flex flex-col gap-3">
      {faqs.map((f) => {
        const isOpen = open === f.id;
        return (
          <li key={f.id} className={cn("rounded-[20px] border bg-card transition-colors", isOpen ? "border-accent/40" : "border-line")}>
            <h3>
              <button type="button" onClick={() => setOpen(isOpen ? null : f.id)} aria-expanded={isOpen} aria-controls={`faq-${f.id}`} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-heading text-lg text-heading">
                {f.question}
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300", isOpen ? "rotate-45 bg-accent text-on-accent" : "bg-surface")}>
                  <Plus size={18} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`faq-${f.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="px-6 pb-6 text-[16px] leading-relaxed">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

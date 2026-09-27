"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductTabs({ tabs }: { tabs: { key: string; label: string; content: React.ReactNode }[] }) {
  const [tab, setTab] = useState(tabs[0]?.key);
  return (
    <div>
      <div role="tablist" aria-label="Product information" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" id={`tab-${t.key}`} aria-controls={`panel-${t.key}`} aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={cn("relative shrink-0 pb-3 font-heading text-lg transition-colors", tab === t.key ? "text-heading" : "text-muted hover:text-heading")}>
            {t.label}
            {tab === t.key && <motion.span layoutId="ptab" className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" id={`panel-${t.key}`} aria-labelledby={`tab-${t.key}`} hidden={tab !== t.key} className="pt-7">
          {t.content}
        </div>
      ))}
    </div>
  );
}

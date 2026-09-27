import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** "— NEW IN —" eyebrow + serif heading with one italic word. Wrap the italic word in *stars*. */
export function SectionTitle({ eyebrow, title, text, className, align = "center" }: { eyebrow?: string; title: string; text?: string; className?: string; align?: "center" | "left" }) {
  const parts = title.split(/\*(.+?)\*/);
  return (
    <Reveal y={24} className={cn("mb-10 sm:mb-12", align === "center" ? "mx-auto max-w-[640px] text-center" : "", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h-section mt-3">{parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : p))}</h2>
      {text && <p className="mt-3 text-[16px]">{text}</p>}
    </Reveal>
  );
}

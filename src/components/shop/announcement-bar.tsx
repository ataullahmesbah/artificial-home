import { Sparkles } from "lucide-react";

/** Thin sliding strip above the navbar (Admin → Settings → Announcement). */
export function AnnouncementBar({ text }: { text: string }) {
  if (!text.trim()) return null;
  const parts = text.split("·").map((t) => t.trim()).filter(Boolean);
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {[...parts, ...parts].map((t, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap">
          {t}
          <Sparkles size={13} aria-hidden className="opacity-70" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden bg-heading py-2 text-[13px] font-medium text-bg" role="note" aria-label={text}>
      <div className="marquee-track flex w-max" aria-hidden>
        {row}
        {row}
      </div>
    </div>
  );
}

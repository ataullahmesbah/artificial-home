import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Text logo: first word big in italic serif, the rest as small caps underneath. */
export function Logo({ name, logo, className, light = false }: { name: string; logo: string | null; className?: string; light?: boolean }) {
  const [first, ...rest] = name.split(" ");
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label={`${name} — home`}>
      {logo ? (
        <Image src={logo} alt="" width={180} height={56} className="h-11 w-auto object-contain" />
      ) : (
        <span className="flex flex-col leading-none">
          <span className={cn("font-heading text-[26px] font-semibold italic", light ? "text-white" : "text-heading")}>
            {first}
            <span className="text-accent">.</span>
          </span>
          {rest.length > 0 && <span className={cn("mt-1 text-[10px] font-bold tracking-[0.42em] uppercase", light ? "text-white/70" : "text-accent-ink")}>{rest.join(" ")}</span>}
        </span>
      )}
    </Link>
  );
}

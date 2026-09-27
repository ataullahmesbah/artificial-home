import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/** Soft pink page header with breadcrumb. */
export function PageBanner({ title, text, crumbs }: { title: string; text?: string; crumbs: { label: string; href?: string }[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fdeef2] via-[#fff6f1] to-[#f7e9ff] dark:from-[#2a1720] dark:via-[#1f1418] dark:to-[#221a2b]">
      <div aria-hidden className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-accent-2/20 blur-3xl" />
      <div className="container-x relative py-12 sm:py-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} aria-hidden />}
                {c.href ? (
                  <Link href={c.href} className="hover:text-accent-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-heading">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <Reveal y={20}>
          <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.4rem)]">{title}</h1>
          {text && <p className="mt-3 max-w-[560px] text-[17px]">{text}</p>}
        </Reveal>
      </div>
    </section>
  );
}

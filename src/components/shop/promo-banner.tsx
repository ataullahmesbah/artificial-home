"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ClipReveal, Reveal } from "@/components/motion/reveal";

function useCountdown(end: string | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!end || now === null) return null;
  const diff = new Date(end).getTime() - now;
  if (!Number.isFinite(diff) || diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

type Props = { kicker: string; title: string; text: string; button: string; link: string; image: string | null; endsAt: string | null };

export function PromoBanner({ kicker, title, text, button, link, image, endsAt }: Props) {
  const left = useCountdown(endsAt);
  if (!title) return null;
  return (
    <section className="section" aria-labelledby="promo-title">
      <div className="container-x">
        <div className="relative grid overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fbe3ea] to-[#f6d6c6] dark:from-[#3a1f2b] dark:to-[#2d1d1a] lg:grid-cols-2">
          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <Reveal>
              {kicker && <p className="eyebrow">{kicker}</p>}
              <h2 id="promo-title" className="mt-4 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.08] font-semibold">
                {title}
              </h2>
              {text && <p className="mt-4 max-w-[440px] text-[17px] text-heading/75">{text}</p>}
            </Reveal>
            {left && (
              <Reveal delay={0.1}>
                <dl className="mt-8 flex gap-3" aria-label="Offer ends in">
                  {(
                    [
                      ["Days", left.d],
                      ["Hours", left.h],
                      ["Mins", left.m],
                      ["Secs", left.s],
                    ] as const
                  ).map(([label, v]) => (
                    <div key={label} className="w-[70px] rounded-2xl bg-card/90 py-3 text-center shadow-sm backdrop-blur sm:w-[78px]">
                      <dd className="font-heading text-[28px] leading-none font-bold text-heading tabular-nums">{String(v).padStart(2, "0")}</dd>
                      <dt className="mt-1 text-[11px] font-semibold tracking-wider text-muted uppercase">{label}</dt>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
            {button && (
              <Reveal delay={0.2}>
                <Link href={link || "/shop"} className="btn btn-primary mt-9">
                  {button} <ArrowRight size={18} aria-hidden />
                </Link>
              </Reveal>
            )}
          </div>
          {image && (
            <ClipReveal className="relative min-h-[300px] lg:min-h-full">
              <Image src={image} alt="" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
            </ClipReveal>
          )}
        </div>
      </div>
    </section>
  );
}

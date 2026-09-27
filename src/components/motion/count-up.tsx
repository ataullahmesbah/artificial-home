"use client";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Splits "120+", "$4.9k", "95%" into prefix / number / suffix. */
export function parseStat(value: string) {
  const m = value.trim().match(/^([^\d-]*)(-?\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) return null;
  const num = Number(m[2].replace(",", "."));
  const decimals = (m[2].split(/[.,]/)[1] ?? "").length;
  return { prefix: m[1], num, decimals, suffix: m[3] };
}

/** Counts up to the number inside `value` when it scrolls into view. Non-numeric values render as-is. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const parsed = parseStat(value);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!parsed || !inView) return;
    if (reduce) {
      setN(parsed.num);
      return;
    }
    const controls = animate(0, parsed.num, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: setN });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  if (!parsed) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden>
        {parsed.prefix}
        {n.toFixed(parsed.decimals)}
        {parsed.suffix}
      </span>
    </span>
  );
}

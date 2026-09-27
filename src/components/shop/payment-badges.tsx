import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/content";

export const PAYMENT_LABELS = {
  cod: { label: "Cash on Delivery", short: "COD", bg: "#f6e3ea", fg: "#7a1f35" },
  bkash: { label: "bKash", short: "bKash", bg: "#e2136e", fg: "#ffffff" },
  nagad: { label: "Nagad", short: "Nagad", bg: "#f6921e", fg: "#ffffff" },
  rocket: { label: "Rocket", short: "Rocket", bg: "#8c3494", fg: "#ffffff" },
  qr: { label: "Bangla QR", short: "Bangla QR", bg: "#006a4e", fg: "#ffffff" },
} as const;

export type PaymentKey = keyof typeof PAYMENT_LABELS;

/** Payment methods switched on in Settings (a method is on when its number / QR is filled in). */
export function enabledPayments(s: Pick<SiteSettings, "cod_enabled" | "bkash_number" | "nagad_number" | "rocket_number" | "payment_qr_url">): PaymentKey[] {
  const list: PaymentKey[] = [];
  if (s.cod_enabled) list.push("cod");
  if (s.bkash_number) list.push("bkash");
  if (s.nagad_number) list.push("nagad");
  if (s.rocket_number) list.push("rocket");
  if (s.payment_qr_url) list.push("qr");
  return list;
}

/** Text badges in each wallet's colour (not official logos). */
export function PaymentBadges({ methods, className }: { methods: PaymentKey[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Payment methods">
      {methods.map((m) => (
        <li key={m} className="rounded-md px-2.5 py-1 text-[12px] font-bold tracking-wide" style={{ background: PAYMENT_LABELS[m].bg, color: PAYMENT_LABELS[m].fg }}>
          {PAYMENT_LABELS[m].short}
        </li>
      ))}
    </ul>
  );
}

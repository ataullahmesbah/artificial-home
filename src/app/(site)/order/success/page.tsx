import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, PackageSearch, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PAYMENT_LABELS } from "@/components/shop/payment-badges";
import { getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function OrderSuccess({ searchParams }: Props) {
  const [sp, settings] = await Promise.all([searchParams, getSettings()]);
  const number = one(sp.no).replace(/[^A-Z0-9-]/gi, "").slice(0, 24);
  const total = Number(one(sp.total)) || 0;
  const m = one(sp.m) as keyof typeof PAYMENT_LABELS;
  const method = PAYMENT_LABELS[m] ? PAYMENT_LABELS[m].label : "Cash on Delivery";
  const demo = one(sp.demo) === "1";
  const wa = settings.whatsapp_number?.replace(/\D/g, "");
  const waText = encodeURIComponent(`Hi! I just placed order ${number}. Please confirm it.`);

  return (
    <div className="container-x section">
      <Reveal className="mx-auto max-w-[620px] rounded-[32px] border border-line bg-card px-6 py-12 text-center shadow-[var(--shadow)] sm:px-12">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={44} />
        </span>
        <h1 className="mt-6 text-[clamp(1.9rem,4vw,2.6rem)]">Thank you for your order! 💖</h1>
        <p className="mt-3 text-[17px]">We&rsquo;ve received your order and will call you soon to confirm it.</p>
        {number && (
          <div className="mt-8 rounded-2xl bg-surface p-5">
            <p className="text-sm text-muted">Your order number</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-heading">{number}</p>
            <p className="mt-3 text-[15px]">
              {total > 0 && (
                <>
                  Total <b className="text-heading">{formatPrice(total)}</b> ·{" "}
                </>
              )}
              {method}
            </p>
          </div>
        )}
        {demo && <p className="mt-4 text-sm text-muted">Demo mode: connect the shop to Supabase to save real orders.</p>}
        <p className="mt-6 text-sm">Keep your order number and phone number to track your order.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/track" className="btn btn-outline">
            <PackageSearch size={18} /> Track Order
          </Link>
          {wa && number && (
            <a href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25d366] text-white hover:bg-[#1eb457]">
              Confirm on WhatsApp
            </a>
          )}
          <Link href="/shop" className="btn btn-primary">
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

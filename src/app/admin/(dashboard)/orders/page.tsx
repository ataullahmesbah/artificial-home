import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
const tone: Record<string, "warning" | "accent" | "success" | "neutral"> = { pending: "warning", confirmed: "accent", shipped: "accent", delivered: "success", cancelled: "neutral" };

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number]) ? (sp.status as string) : "all";
  const q = (sp.q ?? "").trim().slice(0, 40);
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("orders").select("id, order_number, customer_name, phone, total, status, payment_method, payment_status, created_at, items").order("created_at", { ascending: false }).limit(300);
  if (status !== "all") query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[^A-Za-z0-9+ -]/g, "");
    query = query.or(`order_number.ilike.%${safe}%,phone.ilike.%${safe}%,customer_name.ilike.%${safe}%`);
  }
  const { data, error } = await query;

  return (
    <>
      <PageHeader title="Orders" description="Every order placed on the website. Open an order to confirm it, mark it shipped or delivered, or cancel it." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter orders" className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
              aria-current={status === s ? "page" : undefined}
              className={cn("rounded-full border px-3.5 py-1.5 text-sm capitalize", status === s ? "border-accent bg-accent/10 font-semibold text-accent-ink" : "border-line text-text hover:text-heading")}
            >
              {s}
            </Link>
          ))}
        </nav>
        <form className="relative" role="search">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="o-q" className="sr-only">
            Search orders
          </label>
          <input id="o-q" name="q" defaultValue={q} placeholder="Order no, phone or name" className="w-full rounded-xl border border-line bg-[var(--input-bg)] py-2 pr-3 pl-9 text-sm text-heading lg:w-72" />
        </form>
      </div>
      {error ? (
        <EmptyState text="Could not load orders. Make sure supabase/migrations/0004_shop.sql was run." />
      ) : !data?.length ? (
        <EmptyState text={q || status !== "all" ? "No orders match this filter." : "No orders yet. They appear here as soon as a customer checks out."} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-[var(--card-to)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--bg)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-heading hover:text-accent-ink">
                      {o.order_number}
                    </Link>
                    <span className="block text-xs text-muted">{formatDate(o.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-heading">{o.customer_name}</span>
                    <a href={`tel:${o.phone}`} className="text-xs text-muted hover:text-accent-ink">
                      {o.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">{(o.items as unknown[]).length}</td>
                  <td className="px-4 py-3 font-semibold text-heading">৳{Number(o.total).toLocaleString("en-US")}</td>
                  <td className="px-4 py-3">
                    <span className="uppercase">{o.payment_method}</span> · <Badge tone={o.payment_status === "paid" ? "success" : "neutral"}>{o.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[o.status] ?? "neutral"}>{o.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

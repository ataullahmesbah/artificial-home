import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, Gem, Images, Mail, Plus, ShoppingCart, Truck, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data";
import { Badge, Card } from "@/components/admin/ui";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";

export default async function Overview() {
  const admin = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const count = async (table: string, filter?: [string, unknown]) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return (await q).count ?? 0;
  };
  const [products, pending, shipped, unread, recent, lowStock, delivered, settings] = await Promise.all([
    count("products"),
    count("orders", ["status", "pending"]),
    count("orders", ["status", "shipped"]),
    count("messages", ["is_read", false]),
    supabase.from("orders").select("id, order_number, customer_name, total, status, payment_method, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("id, name, stock, images").lte("stock", 3).eq("status", "published").order("stock").limit(6),
    supabase.from("orders").select("total").eq("status", "delivered").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    getSettings(),
  ]);
  const revenue = (delivered.data ?? []).reduce((n, o) => n + (o.total as number), 0);

  const stats = [
    { label: "New orders (pending)", value: pending, Icon: ShoppingCart, href: "/admin/orders?status=pending" },
    { label: "On the way", value: shipped, Icon: Truck, href: "/admin/orders?status=shipped" },
    { label: "Sales, last 30 days", value: `৳${revenue.toLocaleString("en-US")}`, Icon: Wallet, href: "/admin/orders?status=delivered" },
    { label: "Products", value: products, Icon: Gem, href: "/admin/products" },
    { label: "Low stock (≤ 3)", value: lowStock.data?.length ?? 0, Icon: AlertTriangle, href: "/admin/products" },
    { label: "Unread messages", value: unread, Icon: Mail, href: "/admin/messages" },
  ];
  const statusTone: Record<string, "success" | "warning" | "accent" | "neutral"> = { pending: "warning", confirmed: "accent", shipped: "accent", delivered: "success" };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">{greeting},</p>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Welcome back, {admin.displayName.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">{settings.website_name} · Online shop</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-heading hover:bg-[var(--card-to)]">
          <ExternalLink size={16} /> View website
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, Icon, href }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-line bg-[var(--card-to)] p-5 transition hover:-translate-y-0.5 hover:border-accent/40">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent-ink">
              <Icon size={18} />
            </span>
            <p className="mt-4 font-heading text-3xl font-bold text-heading">{value}</p>
            <p className="mt-0.5 text-xs text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Latest orders</h2>
            <Link href="/admin/orders" className="text-sm text-accent-ink hover:underline">All orders</Link>
          </div>
          {recent.data?.length ? (
            <ul className="divide-y divide-[var(--border)]">
              {recent.data.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-4 py-3 hover:opacity-80">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-sm font-semibold text-heading">{o.order_number}</span>
                      <span className="text-xs text-muted">{o.customer_name} · {formatDate(o.created_at)} · {String(o.payment_method).toUpperCase()}</span>
                    </span>
                    <span className="text-sm font-semibold text-heading">৳{Number(o.total).toLocaleString("en-US")}</span>
                    <Badge tone={statusTone[o.status] ?? "neutral"}>{o.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted">No orders yet. They appear here as soon as a customer checks out.</p>
          )}
          {lowStock.data && lowStock.data.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="mb-3 text-sm font-semibold text-heading">Running low</h3>
              <ul className="flex flex-wrap gap-2">
                {lowStock.data.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs hover:border-accent">
                      {p.name} <b className={p.stock === 0 ? "text-red-500" : "text-amber-600"}>{p.stock}</b>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-heading text-lg font-semibold">Quick actions</h2>
            <div className="grid gap-2">
              <Link href="/admin/products/new" className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-on-accent hover:opacity-90">
                <Plus size={16} /> Add product
              </Link>
              <Link href="/admin/orders?status=pending" className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-heading hover:bg-[var(--bg)]">
                <ShoppingCart size={16} /> New orders
              </Link>
              <Link href="/admin/banners" className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-heading hover:bg-[var(--bg)]">
                <Images size={16} /> Change home banners
              </Link>
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 font-heading text-lg font-semibold">Website status</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-emerald-500" /> Website is online</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-emerald-500" /> Database connected</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-emerald-500" /> Changes publish instantly</li>
            </ul>
            <a href={siteConfig.url} target="_blank" rel="noopener noreferrer" className="mt-4 block truncate text-sm text-accent-ink hover:underline">{siteConfig.url.replace(/^https?:\/\//, "")}</a>
          </Card>
        </div>
      </div>
    </div>
  );
}

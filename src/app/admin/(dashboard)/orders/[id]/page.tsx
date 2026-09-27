import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { OrderActions } from "@/components/admin/order-actions";
import { formatDate } from "@/lib/utils";
import type { Order } from "@/types/content";

export const metadata: Metadata = { title: "Order" };

const taka = (n: number) => `৳${Number(n).toLocaleString("en-US")}`;
const METHOD: Record<string, string> = { cod: "Cash on Delivery", bkash: "bKash", nagad: "Nagad", rocket: "Rocket", qr: "Bangla QR" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const phone = o.phone.replace(/\D/g, "").replace(/^0/, "880");
  const wa = `https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${o.customer_name}! Your order ${o.order_number} is confirmed.`)}`;

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading">
        <ArrowLeft size={15} /> Orders
      </Link>
      <PageHeader title={`Order ${o.order_number}`} description={`Placed ${formatDate(o.created_at)} at ${new Date(o.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" })}`} />
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Items</h2>
              <Badge tone={o.status === "delivered" ? "success" : o.status === "pending" ? "warning" : "accent"}>{o.status}</Badge>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {o.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-[var(--bg)]">{it.image && <Image src={it.image} alt="" fill sizes="56px" className="object-cover" />}</span>
                  <span className="min-w-0 flex-1">
                    <a href={`/product/${it.slug}`} target="_blank" rel="noopener noreferrer" className="block font-medium text-heading hover:text-accent-ink">
                      {it.name}
                    </a>
                    <span className="text-xs text-muted">
                      {it.color ? `${it.color} · ` : ""}
                      {taka(it.price)} × {it.qty}
                    </span>
                  </span>
                  <span className="font-semibold text-heading">{taka(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{taka(o.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery ({o.area === "inside" ? "inside Dhaka" : "outside Dhaka"})</dt>
                <dd>{o.delivery_charge ? taka(o.delivery_charge) : "Free"}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold text-heading">
                <dt>Total</dt>
                <dd>{taka(o.total)}</dd>
              </div>
            </dl>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-heading text-lg font-semibold">Customer</h2>
              <p className="font-medium text-heading">{o.customer_name}</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Phone size={15} className="text-muted" />
                <a href={`tel:${o.phone}`} className="hover:text-accent-ink">
                  {o.phone}
                </a>
              </p>
              {o.email && <p className="mt-1 text-sm break-all">{o.email}</p>}
              <p className="mt-2 flex items-start gap-2 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0 text-muted" />
                <span>
                  {o.address}
                  {o.city ? `, ${o.city}` : ""}
                </span>
              </p>
              {o.note && <p className="mt-3 rounded-xl bg-[var(--bg)] px-3 py-2 text-sm">“{o.note}”</p>}
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-3.5 py-2 text-sm font-medium text-white hover:opacity-90">
                <MessageCircle size={15} /> WhatsApp customer
              </a>
            </Card>
            <Card>
              <h2 className="mb-3 font-heading text-lg font-semibold">Payment</h2>
              <p className="font-medium text-heading">{METHOD[o.payment_method] ?? o.payment_method}</p>
              <p className="mt-1 text-sm">
                Status: <Badge tone={o.payment_status === "paid" ? "success" : "neutral"}>{o.payment_status}</Badge>
              </p>
              {o.payment_method !== "cod" && (
                <dl className="mt-3 space-y-1 text-sm">
                  {o.payment_sender && (
                    <div>
                      <dt className="inline text-muted">Paid from: </dt>
                      <dd className="inline font-mono">{o.payment_sender}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline text-muted">Transaction ID: </dt>
                    <dd className="inline font-mono font-semibold text-heading">{o.payment_trx}</dd>
                  </div>
                </dl>
              )}
              {o.payment_method !== "cod" && o.payment_status !== "paid" && (
                <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">Check the Transaction ID in your {METHOD[o.payment_method]} app, then mark the payment as Paid.</p>
              )}
            </Card>
          </div>
        </div>
        <OrderActions id={o.id} status={o.status} paymentStatus={o.payment_status} note={o.admin_note} />
      </div>
    </>
  );
}

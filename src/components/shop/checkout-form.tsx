"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AlertCircle, Copy, Loader2, Lock, ShoppingBag } from "lucide-react";
import { placeOrder } from "@/actions/shop";
import { PAYMENT_LABELS, type PaymentKey } from "@/components/shop/payment-badges";
import { cart, useCart } from "@/lib/shop/store";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  methods: PaymentKey[];
  numbers: { bkash: string | null; nagad: string | null; rocket: string | null };
  qr: string | null;
  note: string;
  inside: number;
  outside: number;
  freeMin: number;
};

function Field({ id, label, error, children, className }: { id: string; label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-heading">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({ methods, numbers, qr, note, inside, outside, freeMin }: Props) {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const [ready, setReady] = useState(false);
  const [pending, start] = useTransition();
  const [area, setArea] = useState<"inside" | "outside">("inside");
  const [method, setMethod] = useState<PaymentKey>(methods[0] ?? "cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setReady(true), []);

  const delivery = freeMin > 0 && subtotal >= freeMin ? 0 : area === "inside" ? inside : outside;
  const total = subtotal + delivery;
  const wallet = method === "bkash" || method === "nagad" || method === "rocket" ? numbers[method] : null;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_name: String(fd.get("customer_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      area,
      note: String(fd.get("note") ?? ""),
      payment_method: method,
      payment_sender: String(fd.get("payment_sender") ?? ""),
      payment_trx: String(fd.get("payment_trx") ?? ""),
      items: items.map((i) => ({ product_id: i.id, qty: i.qty, color: i.color })),
    };
    setMessage("");
    start(async () => {
      const res = await placeOrder(payload);
      if (res.ok && res.order) {
        cart.clear();
        const t = res.order.demo ? total : res.order.total;
        router.push(`/order/success?no=${encodeURIComponent(res.order.number)}&total=${t}&m=${method}${res.order.demo ? "&demo=1" : ""}`);
        return;
      }
      setErrors(res.errors ?? {});
      setMessage(res.message ?? "Something went wrong.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  if (!ready) return <div className="h-60" aria-busy="true" />;
  if (!items.length)
    return (
      <div className="rounded-[28px] border border-dashed border-line py-20 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-surface text-accent">
          <ShoppingBag size={32} />
        </span>
        <p className="mt-5 font-heading text-2xl text-heading">Your cart is empty</p>
        <Link href="/shop" className="btn btn-primary mt-7">
          Start Shopping
        </Link>
      </div>
    );

  const e = (k: string) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `c-${k}-err` : undefined });

  return (
    <form
      onSubmit={submit}
      onInput={(ev) => {
        const name = (ev.target as HTMLInputElement).name;
        if (name && errors[name]) setErrors(({ [name]: _gone, ...rest }) => rest);
      }}
      noValidate
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]"
    >
      <div className="flex flex-col gap-8">
        {message && (
          <p role="alert" className="flex items-start gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /> {message}
          </p>
        )}

        <section className="rounded-[24px] border border-line bg-card p-6 sm:p-8">
          <h2 className="text-2xl">1. Delivery details</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field id="c-customer_name" label="Full name *" error={errors.customer_name}>
              <input id="c-customer_name" name="customer_name" autoComplete="name" className="field" required {...e("customer_name")} />
            </Field>
            <Field id="c-phone" label="Mobile number *" error={errors.phone}>
              <input id="c-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className="field" required {...e("phone")} />
            </Field>
            <Field id="c-address" label="Full address *" error={errors.address} className="sm:col-span-2">
              <textarea id="c-address" name="address" rows={2} autoComplete="street-address" placeholder="House, road, area" className="field resize-y" required {...e("address")} />
            </Field>
            <Field id="c-city" label="City / District" error={errors.city}>
              <input id="c-city" name="city" autoComplete="address-level2" placeholder="e.g. Dhaka" className="field" {...e("city")} />
            </Field>
            <Field id="c-email" label="Email (optional)" error={errors.email}>
              <input id="c-email" name="email" type="email" autoComplete="email" className="field" {...e("email")} />
            </Field>
          </div>
          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-semibold text-heading">Delivery area *</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["inside", "Inside Dhaka", inside],
                  ["outside", "Outside Dhaka", outside],
                ] as const
              ).map(([v, label, fee]) => (
                <label key={v} className={cn("flex cursor-pointer items-center justify-between rounded-2xl border-2 px-4 py-3.5 transition-colors", area === v ? "border-accent bg-accent/5" : "border-line hover:border-muted")}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="area" value={v} checked={area === v} onChange={() => setArea(v)} className="h-4 w-4 accent-[var(--accent)]" />
                    <span className="font-semibold text-heading">{label}</span>
                  </span>
                  <span className="text-sm">{freeMin > 0 && subtotal >= freeMin ? "Free" : formatPrice(fee)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field id="c-note" label="Order note (optional)" className="mt-5">
            <textarea id="c-note" name="note" rows={2} placeholder="Gift wrap, delivery time …" className="field resize-y" />
          </Field>
        </section>

        <section className="rounded-[24px] border border-line bg-card p-6 sm:p-8">
          <h2 className="text-2xl">2. Payment</h2>
          <fieldset className="mt-6">
            <legend className="sr-only">Payment method</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {methods.map((m) => (
                <label key={m} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-colors", method === m ? "border-accent bg-accent/5" : "border-line hover:border-muted")}>
                  <input type="radio" name="payment_method" value={m} checked={method === m} onChange={() => setMethod(m)} className="h-4 w-4 accent-[var(--accent)]" />
                  <span className="rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: PAYMENT_LABELS[m].bg, color: PAYMENT_LABELS[m].fg }}>
                    {PAYMENT_LABELS[m].short}
                  </span>
                  <span className="text-[15px] font-semibold text-heading">{m === "cod" ? "Cash on Delivery" : PAYMENT_LABELS[m].label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 rounded-2xl bg-surface p-5 text-[15px]">
            {method === "cod" ? (
              <p>Pay in cash when your parcel arrives. Our team will call you to confirm the order.</p>
            ) : (
              <>
                {wallet && (
                  <ol className="list-decimal space-y-1.5 pl-5">
                    <li>
                      Open your <b>{PAYMENT_LABELS[method].label}</b> app and choose <b>Send Money</b>.
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      Send <b className="text-accent-ink">{formatPrice(total)}</b> to{" "}
                      <b className="font-mono text-heading">{wallet}</b>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(wallet.replace(/\D/g, ""));
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-0.5 text-xs font-semibold"
                      >
                        <Copy size={12} /> {copied ? "Copied" : "Copy"}
                      </button>
                    </li>
                    <li>Enter the number you paid from and the Transaction ID below.</li>
                  </ol>
                )}
                {method === "qr" && qr && (
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                    <span className="relative h-44 w-40 shrink-0 overflow-hidden rounded-xl bg-white">
                      <Image src={qr} alt="Bangla QR code for payment" fill sizes="160px" className="object-contain" />
                    </span>
                    <p>
                      Scan this <b>Bangla QR</b> with any bank or wallet app and pay <b className="text-accent-ink">{formatPrice(total)}</b>. Then enter the Transaction ID below.
                    </p>
                  </div>
                )}
                {note && <p className="mt-3 text-sm text-muted">{note}</p>}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {method !== "qr" && (
                    <Field id="c-payment_sender" label="Your number (paid from) *" error={errors.payment_sender}>
                      <input id="c-payment_sender" name="payment_sender" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" className="field" {...e("payment_sender")} />
                    </Field>
                  )}
                  <Field id="c-payment_trx" label="Transaction ID *" error={errors.payment_trx} className={method === "qr" ? "sm:col-span-2" : ""}>
                    <input id="c-payment_trx" name="payment_trx" placeholder="e.g. 9BC7D2XK1L" autoCapitalize="characters" className="field font-mono uppercase" {...e("payment_trx")} />
                  </Field>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-[24px] bg-surface p-6 sm:p-7 lg:sticky lg:top-28">
        <h2 className="text-2xl">Your Order</h2>
        <ul className="mt-5 flex max-h-[340px] flex-col gap-4 overflow-y-auto pr-1">
          {items.map((i) => (
            <li key={i.id + (i.color ?? "")} className="flex items-center gap-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-card">
                {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}
                <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-heading px-1 text-[11px] font-bold text-bg">{i.qty}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 font-semibold text-heading">{i.name}</span>
                {i.color && <span className="text-xs text-muted">{i.color}</span>}
              </span>
              <span className="font-semibold text-heading">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5 text-[15px]">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="text-heading">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery ({area === "inside" ? "Inside Dhaka" : "Outside Dhaka"})</dt>
            <dd className="text-heading">{delivery ? formatPrice(delivery) : "Free"}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg">
            <dt className="font-bold text-heading">Total</dt>
            <dd className="font-bold text-heading">{formatPrice(total)}</dd>
          </div>
        </dl>
        <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full !min-h-[56px] text-base">
          {pending ? <Loader2 size={20} className="animate-spin" /> : <Lock size={17} />} {pending ? "Placing order…" : `Place Order · ${formatPrice(total)}`}
        </button>
        <p className="mt-3 text-center text-xs text-muted">The final total is confirmed by the shop when your order is placed.</p>
      </aside>
    </form>
  );
}

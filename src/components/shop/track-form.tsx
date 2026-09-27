"use client";
import { useActionState } from "react";
import { Check, Loader2, PackageSearch } from "lucide-react";
import { trackOrder, type TrackState } from "@/actions/shop";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

export function TrackForm() {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrder, {});
  const r = state.result;
  const step = r ? STEPS.findIndex((s) => s.key === r.status) : -1;
  return (
    <div className="mx-auto max-w-[680px]">
      <form action={action} className="grid gap-4 rounded-[24px] border border-line bg-card p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-8">
        <div>
          <label htmlFor="t-no" className="mb-2 block text-sm font-semibold text-heading">
            Order number
          </label>
          <input id="t-no" name="order_number" key={`n-${state.values?.order_number}`} defaultValue={state.values?.order_number} required placeholder="AH260927-7A1B2" className="field font-mono uppercase" />
        </div>
        <div>
          <label htmlFor="t-phone" className="mb-2 block text-sm font-semibold text-heading">
            Phone number
          </label>
          <input id="t-phone" name="phone" type="tel" key={`p-${state.values?.phone}`} defaultValue={state.values?.phone} required placeholder="01XXXXXXXXX" className="field" />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? <Loader2 size={18} className="animate-spin" /> : <PackageSearch size={18} />} Track
        </button>
      </form>

      {state.message && (
        <p role="status" className="mt-6 rounded-2xl bg-surface px-5 py-4 text-center">
          {state.message}
        </p>
      )}

      {r && (
        <div className="mt-8 rounded-[24px] border border-line bg-card p-6 sm:p-8" role="status">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-xl font-bold text-heading">{r.order_number}</p>
            <p className="text-sm text-muted">Placed {formatDate(r.created_at)}</p>
          </div>
          <p className="mt-1 text-[15px]">
            {r.items} item{r.items === 1 ? "" : "s"} · {formatPrice(r.total)} · Payment: <b className="text-heading">{r.payment_status}</b>
          </p>
          {r.status === "cancelled" ? (
            <p className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 font-semibold text-red-700 dark:text-red-300">This order was cancelled. Please contact us if you have questions.</p>
          ) : (
            <ol className="mt-8 grid grid-cols-4 gap-2">
              {STEPS.map((s, i) => (
                <li key={s.key} className="relative flex flex-col items-center text-center">
                  {i > 0 && <span className={cn("absolute top-5 right-1/2 h-0.5 w-full", i <= step ? "bg-accent" : "bg-track")} aria-hidden />}
                  <span className={cn("relative grid h-10 w-10 place-items-center rounded-full border-2", i <= step ? "border-accent bg-accent text-on-accent" : "border-line bg-card text-muted")}>
                    {i <= step ? <Check size={18} /> : i + 1}
                  </span>
                  <span className={cn("mt-2 text-xs font-semibold sm:text-sm", i <= step ? "text-heading" : "text-muted")}>{s.label}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

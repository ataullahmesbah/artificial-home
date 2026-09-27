"use client";
import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import { deleteOrder, updateOrder, type FormState } from "@/actions/admin";
import { useToast } from "./toast";
import { btn, Card } from "./ui";
import { cn } from "@/lib/utils";

const inputCls = "w-full rounded-xl border border-line bg-[var(--input-bg)] px-3.5 py-2.5 text-sm text-heading";

export function OrderActions({ id, status, paymentStatus, note }: { id: string; status: string; paymentStatus: string; note: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateOrder.bind(null, id), {});
  const [deleting, startDelete] = useTransition();
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
  }, [state, toast]);

  return (
    <Card>
      <h2 className="mb-4 font-heading text-lg font-semibold">Update order</h2>
      <form action={action} className="grid gap-4">
        <div>
          <label htmlFor="o-status" className="mb-1.5 block text-sm font-medium text-heading">
            Order status
          </label>
          <select id="o-status" name="status" defaultValue={status} className={inputCls}>
            <option value="pending">Pending (new)</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped / on the way</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled (puts items back in stock)</option>
          </select>
        </div>
        <div>
          <label htmlFor="o-pay" className="mb-1.5 block text-sm font-medium text-heading">
            Payment
          </label>
          <select id="o-pay" name="payment_status" defaultValue={paymentStatus} className={inputCls}>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid (checked)</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label htmlFor="o-note" className="mb-1.5 block text-sm font-medium text-heading">
            Private note
          </label>
          <textarea id="o-note" name="admin_note" rows={3} defaultValue={note} maxLength={1000} className={inputCls} placeholder="e.g. Courier tracking number" />
        </div>
        <button type="submit" disabled={pending} className={cn(btn.base, btn.primary)}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
        </button>
      </form>
      <button
        type="button"
        disabled={deleting}
        onClick={() => {
          if (!window.confirm("Delete this order permanently? Stock is not changed.")) return;
          startDelete(async () => {
            const res = await deleteOrder(id);
            toast(res.message ?? "", res.ok ? "success" : "error");
            if (res.ok) router.push("/admin/orders");
          });
        }}
        className={cn(btn.base, "mt-4 w-full text-red-500 hover:bg-red-500/10")}
      >
        <Trash2 size={16} /> Delete order
      </button>
    </Card>
  );
}

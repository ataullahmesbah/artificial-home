"use client";
import { useState, useTransition } from "react";
import { Copy, Trash2 } from "lucide-react";
import { deleteSubscriber } from "@/actions/admin";
import { useToast } from "./toast";
import { btn } from "./ui";
import { cn, formatDate } from "@/lib/utils";

export function SubscribersList({ rows }: { rows: { id: string; email: string; created_at: string }[] }) {
  const [list, setList] = useState(rows);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(list.map((r) => r.email).join(", "));
          toast("All emails copied.");
        }}
        className={cn(btn.base, btn.ghost, "mb-4")}
      >
        <Copy size={16} /> Copy all emails
      </button>
      <ul className="divide-y divide-[var(--border)] rounded-2xl border border-line bg-[var(--card-to)]">
        {list.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span className="min-w-0 truncate font-medium text-heading">{r.email}</span>
            <span className="flex items-center gap-3">
              <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await deleteSubscriber(r.id);
                    if (res.ok) setList((l) => l.filter((x) => x.id !== r.id));
                  })
                }
                className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500"
                aria-label={`Remove ${r.email}`}
              >
                <Trash2 size={15} />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

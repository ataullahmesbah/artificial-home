"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/actions/admin";
import { ConfirmDialog } from "./confirm";
import { useToast } from "./toast";
import { Badge } from "./ui";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/content";

export function MessagesList({ messages }: { messages: Message[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Message | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const expand = (m: Message) => {
    setOpen(open === m.id ? null : m.id);
    if (!m.is_read) start(async () => { await setMessageRead(m.id, true); router.refresh(); });
  };

  return (
    <>
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className={cn("rounded-2xl border bg-[var(--card-to)]", m.is_read ? "border-line" : "border-accent/40")}>
            <button type="button" onClick={() => expand(m)} aria-expanded={open === m.id} className="flex w-full items-start gap-4 p-5 text-left">
              <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full", m.is_read ? "bg-[var(--bg)] text-muted" : "bg-accent/10 text-accent-ink")}>
                {m.is_read ? <MailOpen size={18} /> : <Mail size={18} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-heading">{m.name}</span>
                  {!m.is_read && <Badge tone="accent">New</Badge>}
                  {m.service && <Badge>{m.service}</Badge>}
                </span>
                <span className="block truncate text-sm text-muted">{m.email} · {new Date(m.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                {open !== m.id && <span className="mt-1 block truncate text-sm">{m.message}</span>}
              </span>
            </button>
            {open === m.id && (
              <div className="border-t border-line px-5 pt-4 pb-5">
                <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-3">
                  {m.phone && <div><dt className="text-xs text-muted">Phone</dt><dd className="text-heading">{m.phone}</dd></div>}
                  {m.budget && <div><dt className="text-xs text-muted">Budget</dt><dd className="text-heading">{m.budget}</dd></div>}
                </dl>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your enquiry")}`} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-on-accent">
                    <Reply size={16} /> Reply by email
                  </a>
                  <button type="button" disabled={pending} onClick={() => start(async () => { await setMessageRead(m.id, !m.is_read); router.refresh(); })} className="rounded-xl border border-line px-4 py-2 text-sm text-heading hover:bg-[var(--bg)]">
                    Mark as {m.is_read ? "unread" : "read"}
                  </button>
                  <button type="button" onClick={() => setConfirm(m)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this message?"
        body={`The message from ${confirm?.name ?? ""} will be permanently removed.`}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          start(async () => {
            const res = await deleteMessage(confirm!.id);
            setConfirm(null);
            toast(res.message ?? "Done", res.ok ? "success" : "error");
            router.refresh();
          })
        }
      />
    </>
  );
}

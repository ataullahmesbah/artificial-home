"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deleteResource, duplicateProduct, moveResource, toggleResource } from "@/actions/admin";
import { ConfirmDialog } from "./confirm";
import { useToast } from "./toast";
import { Badge } from "./ui";
import { cn, formatDate } from "@/lib/utils";
import type { Resource } from "@/lib/admin/resources";

type Row = Record<string, any> & { id: string };

export function ResourceTable({ resource, rows }: { resource: Omit<Resource, "fields">; rows: Row[] }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<Row | null>(null);
  const toast = useToast();
  const router = useRouter();

  const run = (fn: () => Promise<{ ok?: boolean; message?: string }>, success?: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        if (success || res.message) toast(res.message ?? success!);
        router.refresh();
      } else toast(res.message ?? "Something went wrong.", "error");
    });

  const titleKey = resource.columns.find((c) => !c.kind || c.kind === "text")?.name ?? "id";

  return (
    <>
      <div className={cn("overflow-hidden rounded-2xl border border-line bg-[var(--card-to)]", pending && "opacity-70")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-[var(--bg)] text-xs uppercase tracking-wider text-muted">
              <tr>
                {resource.sortable && <th className="w-16 px-4 py-3 font-medium"><span className="sr-only">Order</span></th>}
                {resource.columns.map((c) => (
                  <th key={c.name} className="px-4 py-3 font-medium">
                    {c.label || <span className="sr-only">Image</span>}
                  </th>
                ))}
                {resource.toggles?.map((t) => (
                  <th key={t.name} className="px-4 py-3 font-medium">
                    {t.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row, i) => (
                <tr key={row.id} className="hover:bg-[var(--bg)]/60">
                  {resource.sortable && (
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <button type="button" disabled={i === 0 || pending} onClick={() => run(() => moveResource(resource.key, row.id, "up"))} className="rounded p-0.5 text-muted hover:text-heading disabled:opacity-30" aria-label={`Move ${row[titleKey]} up`}>
                          <ArrowUp size={15} />
                        </button>
                        <button type="button" disabled={i === rows.length - 1 || pending} onClick={() => run(() => moveResource(resource.key, row.id, "down"))} className="rounded p-0.5 text-muted hover:text-heading disabled:opacity-30" aria-label={`Move ${row[titleKey]} down`}>
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                  {resource.columns.map((c) => (
                    <td key={c.name} className="px-4 py-3">
                      {c.kind === "image" ? (
                        <span className="relative block h-11 w-16 overflow-hidden rounded-lg border border-line bg-[var(--bg)]">
                          {(Array.isArray(row[c.name]) ? row[c.name][0] : row[c.name]) && <Image src={Array.isArray(row[c.name]) ? row[c.name][0] : row[c.name]} alt="" fill sizes="64px" className="object-cover" />}
                        </span>
                      ) : c.kind === "badge" ? (
                        row[c.name] ? <Badge>{row[c.name]}</Badge> : "—"
                      ) : c.kind === "price" ? (
                        <span className="whitespace-nowrap font-medium text-heading">{row[c.name] === null || row[c.name] === undefined ? "—" : `৳${Number(row[c.name]).toLocaleString("en-US")}`}</span>
                      ) : c.kind === "date" ? (
                        <span className="whitespace-nowrap text-muted">{row[c.name] ? formatDate(row[c.name]) : "—"}</span>
                      ) : (
                        <span className={cn(c.name === titleKey && "block min-w-[180px] font-medium text-heading")}>{String(row[c.name] ?? "—")}</span>
                      )}
                    </td>
                  ))}
                  {resource.toggles?.map((t) => {
                    const on = row[t.name] === t.on;
                    return (
                      <td key={t.name} className="px-4 py-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          aria-label={`${t.label}: ${row[titleKey]}`}
                          disabled={pending}
                          onClick={() => run(() => toggleResource(resource.key, row.id, t.name), "Updated.")}
                          className={cn("relative h-6 w-11 rounded-full transition", on ? "bg-accent" : "bg-[var(--border)]")}
                        >
                          <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition", on && "translate-x-5")} />
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {resource.publicPath && row.slug && (
                        <a href={resource.publicPath.replace("{slug}", row.slug)} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-muted hover:bg-[var(--bg)] hover:text-heading" aria-label="View on website" title="View on website">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      {resource.key === "products" && (
                        <button type="button" onClick={() => run(() => duplicateProduct(row.id), "Duplicated as draft.")} className="rounded-lg p-2 text-muted hover:bg-[var(--bg)] hover:text-heading" aria-label="Duplicate" title="Duplicate">
                          <Copy size={16} />
                        </button>
                      )}
                      <Link href={`/admin/${resource.key}/${row.id}`} className="rounded-lg p-2 text-muted hover:bg-[var(--bg)] hover:text-heading" aria-label={`Edit ${row[titleKey]}`} title="Edit">
                        <Pencil size={16} />
                      </Link>
                      <button type="button" onClick={() => setConfirm(row)} className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500" aria-label={`Delete ${row[titleKey]}`} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete this ${resource.singular.toLowerCase()}?`}
        body={`“${confirm?.[titleKey] ?? ""}” and its uploaded images will be permanently removed. This cannot be undone.`}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const row = confirm!;
          run(async () => {
            const res = await deleteResource(resource.key, row.id);
            setConfirm(null);
            return res;
          });
        }}
      />
    </>
  );
}

"use client";
import Image from "next/image";
import { ArrowDown, ArrowUp, FileText, ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { brandIconKeys } from "@/components/ui/brand-icon";
import { siteConfig } from "@/config/site";
import { cn, slugify } from "@/lib/utils";
import { normalizeSections, sectionDescription, sectionLabel, type SectionSetting } from "@/lib/sections";
import type { Field } from "@/lib/admin/resources";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const PDF_TYPES = ["application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

export const inputCls =
  "w-full rounded-xl border border-line bg-[var(--bg)] px-3.5 py-2.5 text-sm text-heading placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

async function upload(file: File, folder: string, kind: "image" | "pdf") {
  const allowed = kind === "image" ? IMAGE_TYPES : PDF_TYPES;
  if (!allowed.includes(file.type)) throw new Error(kind === "image" ? "Use a JPG, PNG, WebP or AVIF image." : "Upload a PDF file.");
  if (file.size > MAX_BYTES) throw new Error("File is larger than 5 MB.");
  const ext = kind === "pdf" ? "pdf" : file.type.split("/")[1].replace("jpeg", "jpg");
  // Never trust the original filename: random, unguessable path.
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

function Wrapper({ field, error, children, htmlFor }: { field: Field; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className={cn(field.full && "sm:col-span-2")}>
      <label htmlFor={htmlFor ?? `f-${field.name}`} className="mb-1.5 block text-sm font-medium text-heading">
        {field.label}
        {field.required && <span className="text-accent-ink"> *</span>}
      </label>
      {children}
      {field.help && !error && <p className="mt-1.5 text-xs text-muted">{field.help}</p>}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ImageField({ field, value, error }: { field: Field; value: string; error?: string }) {
  const [url, setUrl] = useState(value);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  return (
    <Wrapper field={field} error={err ?? error} htmlFor={`f-${field.name}-file`}>
      <input type="hidden" name={field.name} value={url} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-[var(--bg)] sm:w-44">
          {url ? <Image src={url} alt="" fill sizes="176px" className="object-cover" /> : <ImagePlus className="text-muted" aria-hidden />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-heading hover:bg-[var(--bg)]">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {url ? "Replace" : "Upload"}
          </button>
          {url && !field.required && (
            <button type="button" onClick={() => setUrl("")} className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm text-red-500 hover:bg-red-500/10">
              <Trash2 size={16} /> Remove
            </button>
          )}
          <p className="w-full text-xs text-muted">JPG, PNG, WebP or AVIF · max 5 MB</p>
        </div>
      </div>
      <input
        ref={input}
        id={`f-${field.name}-file`}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setErr(undefined);
          try {
            setUrl(await upload(file, field.folder ?? "misc", "image"));
          } catch (ex) {
            setErr((ex as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
    </Wrapper>
  );
}

function FileField({ field, value, error }: { field: Field; value: string; error?: string }) {
  const [url, setUrl] = useState(value);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  return (
    <Wrapper field={field} error={err ?? error} htmlFor={`f-${field.name}-file`}>
      <input type="hidden" name={field.name} value={url} />
      <div className="flex flex-wrap items-center gap-3">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg)] px-3.5 py-2 text-sm text-heading underline-offset-2 hover:underline">
            <FileText size={16} className="text-accent-ink" /> Current file
          </a>
        ) : (
          <span className="text-sm text-muted">No file uploaded</span>
        )}
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-heading hover:bg-[var(--bg)]">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {url ? "Replace PDF" : "Upload PDF"}
        </button>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-500/10">
            Remove
          </button>
        )}
      </div>
      <input
        ref={input}
        id={`f-${field.name}-file`}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setErr(undefined);
          try {
            setUrl(await upload(file, field.folder ?? "documents", "pdf"));
          } catch (ex) {
            setErr((ex as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
    </Wrapper>
  );
}

function GalleryField({ field, value, error }: { field: Field; value: string[]; error?: string }) {
  const [items, setItems] = useState<string[]>(value ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const input = useRef<HTMLInputElement>(null);
  const move = (i: number, d: number) =>
    setItems((arr) => {
      const next = [...arr];
      const j = i + d;
      if (j < 0 || j >= next.length) return arr;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  return (
    <Wrapper field={field} error={err ?? error} htmlFor={`f-${field.name}-file`}>
      <input type="hidden" name={field.name} value={JSON.stringify(items)} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((src, i) => (
          <li key={src + i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-[var(--bg)]">
            <Image src={src} alt={`Gallery image ${i + 1}`} fill sizes="200px" className="object-cover" />
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="rounded-lg bg-black/60 p-1.5 text-white" aria-label="Move earlier">
                  <ArrowUp size={14} className="-rotate-90" />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="rounded-lg bg-black/60 p-1.5 text-white" aria-label="Move later">
                  <ArrowDown size={14} className="-rotate-90" />
                </button>
              </div>
              <button type="button" onClick={() => setItems((a) => a.filter((_, j) => j !== i))} className="rounded-lg bg-red-600/90 p-1.5 text-white" aria-label="Remove image">
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
        {items.length < 12 && (
          <li>
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="grid aspect-[4/3] w-full place-items-center rounded-xl border border-dashed border-line text-sm text-muted hover:border-accent hover:text-accent-ink">
              <span className="flex flex-col items-center gap-1.5">
                {busy ? <Loader2 className="animate-spin" /> : <Plus />} Add images
              </span>
            </button>
          </li>
        )}
      </ul>
      <input
        ref={input}
        id={`f-${field.name}-file`}
        type="file"
        multiple
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []).slice(0, 12 - items.length);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          setErr(undefined);
          try {
            const urls: string[] = [];
            for (const f of files) urls.push(await upload(f, field.folder ?? "misc", "image"));
            setItems((a) => [...a, ...urls]);
          } catch (ex) {
            setErr((ex as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
    </Wrapper>
  );
}

function PairsField({
  field,
  value,
  error,
  keys,
}: {
  field: Field;
  value: Record<string, string>[];
  error?: string;
  keys: { first: string; second: string; firstLabel: string; secondLabel: string; firstOptions: string[]; secondPlaceholder: string };
}) {
  const [rows, setRows] = useState<Record<string, string>[]>(value ?? []);
  const update = (i: number, k: string, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  return (
    <Wrapper field={field} error={error} htmlFor={`f-${field.name}-0`}>
      <input type="hidden" name={field.name} value={JSON.stringify(rows)} />
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            {keys.firstOptions.length ? (
              <select id={`f-${field.name}-${i}`} aria-label={keys.firstLabel} className={cn(inputCls, "sm:w-44")} value={row[keys.first]} onChange={(e) => update(i, keys.first, e.target.value)}>
                {keys.firstOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input id={`f-${field.name}-${i}`} aria-label={keys.firstLabel} className={cn(inputCls, "sm:w-44")} value={row[keys.first]} placeholder={keys.firstLabel} maxLength={30} onChange={(e) => update(i, keys.first, e.target.value)} />
            )}
            <input aria-label={keys.secondLabel} className={inputCls} value={row[keys.second]} maxLength={120} placeholder={keys.secondPlaceholder} onChange={(e) => update(i, keys.second, e.target.value)} />
            <button type="button" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} className="rounded-xl px-3 py-2 text-red-500 hover:bg-red-500/10" aria-label="Remove row">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { [keys.first]: keys.firstOptions[0] ?? "", [keys.second]: "" }])}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line px-3.5 py-2 text-sm text-muted hover:border-accent hover:text-accent-ink"
        >
          <Plus size={16} /> Add
        </button>
      </div>
    </Wrapper>
  );
}

function SlugField({ field, value, error }: { field: Field; value: string; error?: string }) {
  const [slug, setSlug] = useState(value);
  // New items: follow the name/title automatically until the slug is edited by hand.
  const [auto, setAuto] = useState(!value);
  useEffect(() => {
    if (!auto || !field.from) return;
    const src = document.getElementById(`f-${field.from}`) as HTMLInputElement | null;
    if (!src) return;
    const sync = () => setSlug(slugify(src.value));
    src.addEventListener("input", sync);
    return () => src.removeEventListener("input", sync);
  }, [auto, field.from]);
  return (
    <Wrapper field={field} error={error}>
      <div className="flex gap-2">
        <input
          id={`f-${field.name}`}
          name={field.name}
          className={inputCls}
          value={slug}
          onChange={(e) => {
            setAuto(false);
            setSlug(slugify(e.target.value));
          }}
          required={field.required}
        />
        <button
          type="button"
          className="shrink-0 rounded-xl border border-line px-3 text-sm text-heading hover:bg-[var(--bg)]"
          onClick={() => {
            const src = document.getElementById(`f-${field.from}`) as HTMLInputElement | null;
            if (src) setSlug(slugify(src.value));
          }}
        >
          Generate
        </button>
      </div>
    </Wrapper>
  );
}

function ColorField({ field, value, error }: { field: Field; value: string; error?: string }) {
  const [color, setColor] = useState(value || "#ff014f");
  return (
    <Wrapper field={field} error={error}>
      <div className="flex flex-wrap items-center gap-3">
        <input type="color" aria-label="Pick a custom colour" value={color.length === 7 ? color : "#ff014f"} onChange={(e) => setColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-transparent" />
        <input id={`f-${field.name}`} name={field.name} value={color} onChange={(e) => setColor(e.target.value)} className={cn(inputCls, "w-32 font-mono")} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Accent presets">
        {siteConfig.accentPresets.map((p) => (
          <button
            key={p.value}
            type="button"
            title={p.name}
            aria-label={p.name}
            aria-pressed={color.toLowerCase() === p.value}
            onClick={() => setColor(p.value)}
            className={cn("h-8 w-8 rounded-full ring-offset-2 ring-offset-[var(--card-to)] transition", color.toLowerCase() === p.value && "ring-2 ring-heading")}
            style={{ background: p.value }}
          />
        ))}
      </div>
    </Wrapper>
  );
}

function SectionsField({ field, value, error }: { field: Field; value: unknown; error?: string }) {
  const [rows, setRows] = useState<SectionSetting[]>(() => normalizeSections(value));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const toggle = (i: number) => setRows((r) => r.map((row, j) => (j === i ? { ...row, visible: !row.visible } : row)));

  return (
    <Wrapper field={field} error={error} htmlFor={`f-${field.name}-0`}>
      <input type="hidden" name={field.name} value={JSON.stringify(rows)} />
      <ol className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-line">
        <li className="flex items-center gap-3 bg-[var(--bg)] px-3 py-2.5 text-sm text-muted">
          <span className="w-14 text-center text-xs">—</span>
          <span className="flex-1">
            <span className="font-medium text-heading">Home page</span> · always shown
          </span>
        </li>
        {rows.map((row, i) => (
          <li key={row.key} className={cn("flex items-center gap-3 px-3 py-2.5", !row.visible && "opacity-60")}>
            <span className="flex w-14 shrink-0 justify-center gap-0.5">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted hover:bg-[var(--bg)] hover:text-heading disabled:opacity-30" aria-label={`Move ${sectionLabel(row.key)} up`}>
                <ArrowUp size={15} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="rounded p-1 text-muted hover:bg-[var(--bg)] hover:text-heading disabled:opacity-30" aria-label={`Move ${sectionLabel(row.key)} down`}>
                <ArrowDown size={15} />
              </button>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-heading">{sectionLabel(row.key)}</span>
              <span className="block truncate text-xs text-muted">{sectionDescription(row.key)}</span>
            </span>
            <button
              id={`f-${field.name}-${i}`}
              type="button"
              role="switch"
              aria-checked={row.visible}
              aria-label={`Show ${sectionLabel(row.key)}`}
              onClick={() => toggle(i)}
              className={cn("relative h-6 w-11 shrink-0 rounded-full transition", row.visible ? "bg-accent" : "bg-[var(--border)]")}
            >
              <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition", row.visible && "translate-x-5")} />
            </button>
          </li>
        ))}
      </ol>
    </Wrapper>
  );
}

export function FieldInput({ field, value, error }: { field: Field; value: unknown; error?: string }) {
  const id = `f-${field.name}`;
  const common = {
    id,
    name: field.name,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    className: inputCls,
  };
  switch (field.type) {
    case "textarea":
      return (
        <Wrapper field={field} error={error}>
          <textarea {...common} rows={field.rows ?? 4} maxLength={field.maxLength} defaultValue={(value as string) ?? ""} placeholder={field.placeholder} />
        </Wrapper>
      );
    case "number":
      return (
        <Wrapper field={field} error={error}>
          <input {...common} type="number" min={field.min} max={field.max} step={field.decimal ? "0.1" : undefined} defaultValue={(value as number) ?? ""} placeholder={field.placeholder} />
        </Wrapper>
      );
    case "heading":
      return (
        <div className="border-t border-line pt-6 sm:col-span-2 [&:first-child]:border-0 [&:first-child]:pt-0">
          <h3 className="font-heading text-lg font-semibold text-heading">{field.label}</h3>
          {field.help && <p className="mt-1 text-sm text-muted">{field.help}</p>}
        </div>
      );
    case "datetime": {
      // Shown and entered in Bangladesh time (UTC+6).
      const v = typeof value === "string" && value ? new Date(new Date(value).getTime() + 6 * 3600 * 1000).toISOString().slice(0, 16) : "";
      return (
        <Wrapper field={field} error={error}>
          <input {...common} type="datetime-local" defaultValue={v} />
        </Wrapper>
      );
    }
    case "colors":
      return (
        <PairsField
          field={field}
          value={((value as { name: string; hex: string }[]) ?? []).map((c) => ({ name: c.name, hex: c.hex }))}
          error={error}
          keys={{ first: "name", second: "hex", firstLabel: "Colour name", secondLabel: "Colour code", firstOptions: [], secondPlaceholder: "#d4a24c" }}
        />
      );
    case "boolean":
      return (
        <div className={cn("flex items-center", field.full && "sm:col-span-2")}>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-heading">
            <input type="hidden" name={field.name} value="false" />
            <input type="checkbox" name={field.name} value="true" defaultChecked={Boolean(value)} className="peer sr-only" />
            <span className="relative h-6 w-11 rounded-full bg-[var(--border)] transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
            {field.label}
          </label>
        </div>
      );
    case "select":
      return (
        <Wrapper field={field} error={error}>
          <select {...common} defaultValue={(value as string) ?? ""}>
            {!field.required && <option value="">—</option>}
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Wrapper>
      );
    case "list":
      return (
        <Wrapper field={field} error={error}>
          <textarea {...common} rows={5} defaultValue={((value as string[]) ?? []).join("\n")} />
        </Wrapper>
      );
    case "date":
      return (
        <Wrapper field={field} error={error}>
          <input {...common} type="date" defaultValue={((value as string) ?? new Date().toISOString()).slice(0, 10)} />
        </Wrapper>
      );
    case "email":
    case "url":
    case "embed":
      return (
        <Wrapper field={field} error={error}>
          <input {...common} type={field.type === "embed" ? "url" : field.type} defaultValue={(value as string) ?? ""} placeholder={field.placeholder ?? (field.type === "email" ? undefined : "https://")} />
        </Wrapper>
      );
    case "sections":
      return <SectionsField field={field} value={value} error={error} />;
    case "slug":
      return <SlugField field={field} value={(value as string) ?? ""} error={error} />;
    case "color":
      return <ColorField field={field} value={(value as string) ?? ""} error={error} />;
    case "image":
      return <ImageField field={field} value={(value as string) ?? ""} error={error} />;
    case "file":
      return <FileField field={field} value={(value as string) ?? ""} error={error} />;
    case "gallery":
      return <GalleryField field={field} value={(value as string[]) ?? []} error={error} />;
    case "links":
      return (
        <PairsField
          field={field}
          value={(value as Record<string, string>[]) ?? []}
          error={error}
          keys={{
            first: "platform",
            second: "url",
            firstLabel: "Platform",
            secondLabel: "Profile URL",
            firstOptions: ["facebook", "instagram", "linkedin", "x", "github", "dribbble", "behance", "youtube", "tiktok", "whatsapp", "messenger"],
            secondPlaceholder: "https://",
          }}
        />
      );
    case "info":
      return (
        <PairsField
          field={field}
          value={(value as Record<string, string>[]) ?? []}
          error={error}
          keys={{ first: "label", second: "value", firstLabel: "Label", secondLabel: "Value", firstOptions: [], secondPlaceholder: "e.g. 01.07.1994" }}
        />
      );
    case "tools":
      return (
        <PairsField
          field={field}
          value={((value as { name: string; icon: string }[]) ?? []).map((t) => ({ icon: t.icon, name: t.name }))}
          error={error}
          keys={{ first: "icon", second: "name", firstLabel: "Icon", secondLabel: "Tool name", firstOptions: brandIconKeys, secondPlaceholder: "e.g. Figma" }}
        />
      );
    default:
      return (
        <Wrapper field={field} error={error}>
          <input {...common} type="text" maxLength={field.maxLength} defaultValue={(value as string) ?? ""} placeholder={field.placeholder} />
        </Wrapper>
      );
  }
}

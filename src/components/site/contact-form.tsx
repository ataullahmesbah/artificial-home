"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { sendMessage } from "@/actions/contact";
import type { ContactState } from "@/lib/validation/contact";
import { cn } from "@/lib/utils";
import { useFormSubmit } from "@/lib/utils/use-form-submit";

const initial: ContactState = { status: "idle" };

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ services, defaultService = "", defaultMessage = "" }: { services: string[]; defaultService?: string; defaultMessage?: string }) {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const [startedAt, setStartedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const onSubmit = useFormSubmit(action);

  useEffect(() => setStartedAt(Date.now()), []);
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const err = (k: keyof NonNullable<ContactState["errors"]>) => state.errors?.[k];
  const a11y = (k: keyof NonNullable<ContactState["errors"]>, id: string) => ({
    "aria-invalid": Boolean(err(k)) || undefined,
    "aria-describedby": err(k) ? `${id}-error` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2" noValidate>
      <input type="hidden" name="started_at" value={startedAt} />
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field id="c-name" label="Your name" error={err("name")}>
        <input id="c-name" name="name" className="field" placeholder="Name" autoComplete="name" required {...a11y("name", "c-name")} />
      </Field>
      <Field id="c-email" label="Email" error={err("email")}>
        <input id="c-email" name="email" type="email" className="field" placeholder="Email" autoComplete="email" required {...a11y("email", "c-email")} />
      </Field>
      <Field id="c-phone" label="Phone number (optional)" error={err("phone")}>
        <input id="c-phone" name="phone" type="tel" className="field" placeholder="Phone (optional)" autoComplete="tel" {...a11y("phone", "c-phone")} />
      </Field>
      <Field id="c-service" label="Service" error={err("service")}>
        <select id="c-service" name="service" className="field" defaultValue={services.includes(defaultService) ? defaultService : ""}>
          <option value="">Subject</option>
          {services.map((s) => (
            <option key={s}>{s}</option>
          ))}
          <option>Something else</option>
        </select>
      </Field>
      <Field id="c-message" label="Your message" error={err("message")} className="sm:col-span-2">
        <textarea id="c-message" name="message" rows={6} className="field resize-y" placeholder="Message" required defaultValue={defaultMessage} {...a11y("message", "c-message")} />
      </Field>

      <div className="sm:col-span-2">
        {state.message && (
          <p
            role="status"
            className={cn(
              "mb-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm",
              state.status === "success" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {state.status === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            {state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary disabled:cursor-wait disabled:opacity-70">
          {pending ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              Send Message <Send size={17} aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

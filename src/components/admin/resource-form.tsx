"use client";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { FieldInput } from "./fields";
import { useToast } from "./toast";
import { btn, Card } from "./ui";
import { cn } from "@/lib/utils";
import { useFormSubmit } from "@/lib/utils/use-form-submit";
import type { Field } from "@/lib/admin/resources";
import type { FormState } from "@/actions/admin";

export function ResourceForm({
  fields,
  values,
  action,
  cancelHref,
  submitLabel = "Save changes",
}: {
  fields: Field[];
  values: Record<string, unknown>;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  cancelHref?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useToast();
  const onSubmit = useFormSubmit(formAction);

  useEffect(() => {
    if (state.ok && state.message) toast(state.message);
    if (!state.ok && state.message) toast(state.message, "error");
  }, [state, toast]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    const form = document.getElementById("resource-form");
    let dirty = false;
    const mark = () => (dirty = true);
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const clear = () => (dirty = false);
    form?.addEventListener("input", mark);
    form?.addEventListener("submit", clear);
    window.addEventListener("beforeunload", warn);
    return () => {
      form?.removeEventListener("input", mark);
      form?.removeEventListener("submit", clear);
      window.removeEventListener("beforeunload", warn);
    };
  }, []);

  return (
    <form id="resource-form" onSubmit={onSubmit} noValidate>
      <Card>
        <div className="grid gap-6 sm:grid-cols-2">
          {fields.map((f) => (
            <FieldInput key={f.name} field={f} value={values[f.name]} error={state.errors?.[f.name]} />
          ))}
        </div>
      </Card>
      {state.message && !state.ok && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500" role="alert">
          {state.message}
        </p>
      )}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex justify-end gap-3 border-t border-line bg-[var(--header-bg)] px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border">
        {cancelHref && (
          <Link href={cancelHref} className={cn(btn.base, btn.ghost)}>
            Cancel
          </Link>
        )}
        <button type="submit" disabled={pending} className={cn(btn.base, btn.primary)}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

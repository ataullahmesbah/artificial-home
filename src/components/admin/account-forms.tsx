"use client";
import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { changePassword, setNewPassword, updateAccount, type FormState } from "@/actions/admin";
import { FieldInput, inputCls } from "./fields";
import { useToast } from "./toast";
import { btn, Card } from "./ui";
import { cn } from "@/lib/utils";
import { useFormSubmit } from "@/lib/utils/use-form-submit";

function useResult(state: FormState) {
  const toast = useToast();
  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
  }, [state, toast]);
}

function Input({ name, label, type = "password", error, autoComplete }: { name: string; label: string; type?: string; error?: string; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={`a-${name}`} className="mb-1.5 block text-sm font-medium text-heading">{label}</label>
      <input id={`a-${name}`} name={name} type={type} autoComplete={autoComplete} className={inputCls} aria-invalid={error ? true : undefined} />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ProfileForm({ name, avatar }: { name: string; avatar: string | null }) {
  const [state, action, pending] = useActionState(updateAccount, {});
  const onSubmit = useFormSubmit(action);
  useResult(state);
  return (
    <Card>
      <h2 className="mb-5 font-heading text-lg font-semibold">Your details</h2>
      <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="a-display_name" className="mb-1.5 block text-sm font-medium text-heading">Display name</label>
          <input id="a-display_name" name="display_name" defaultValue={name} className={inputCls} />
          {state.errors?.display_name && <p className="mt-1.5 text-xs text-red-500">{state.errors.display_name}</p>}
        </div>
        <FieldInput field={{ name: "avatar_url", label: "Avatar", type: "image", folder: "profile", full: true }} value={avatar ?? ""} error={state.errors?.avatar_url} />
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending} className={cn(btn.base, btn.primary)}>
            {pending && <Loader2 size={16} className="animate-spin" />} Save details
          </button>
        </div>
      </form>
    </Card>
  );
}

export function PasswordForm({ reset }: { reset: boolean }) {
  const [state, action, pending] = useActionState(reset ? setNewPassword : changePassword, {});
  const onSubmit = useFormSubmit(action);
  useResult(state);
  return (
    <Card>
      <h2 className="font-heading text-lg font-semibold">{reset ? "Set a new password" : "Change password"}</h2>
      <p className="mt-1 mb-5 text-sm text-muted">At least 10 characters, including a letter and a number.</p>
      <form onSubmit={onSubmit} className="grid max-w-md gap-4" key={state.ok ? "done" : "form"}>
        {!reset && <Input name="current" label="Current password" autoComplete="current-password" error={state.errors?.current} />}
        <Input name="password" label="New password" autoComplete="new-password" error={state.errors?.password} />
        <Input name="confirm" label="Confirm new password" autoComplete="new-password" error={state.errors?.confirm} />
        <div>
          <button type="submit" disabled={pending} className={cn(btn.base, btn.primary)}>
            {pending && <Loader2 size={16} className="animate-spin" />} Update password
          </button>
        </div>
      </form>
    </Card>
  );
}

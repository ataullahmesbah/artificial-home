"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { requestPasswordReset, signIn } from "@/actions/admin";
import { inputCls } from "./fields";
import { btn } from "./ui";
import { cn } from "@/lib/utils";
import { useFormSubmit } from "@/lib/utils/use-form-submit";

export function LoginForm({ linkError }: { linkError?: boolean }) {
  const [state, action, pending] = useActionState(signIn, {});
  const onSubmit = useFormSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {(state.message || linkError) && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500" role="alert">
          {state.message ?? "That link is invalid or has expired. Please request a new one."}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-heading">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} aria-invalid={Boolean(state.errors?.email) || undefined} />
        {state.errors?.email && <p className="mt-1.5 text-xs text-red-500">{state.errors.email}</p>}
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-heading">Password</label>
          <Link href="/admin/forgot-password" className="text-xs text-accent-ink hover:underline">Forgot password?</Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} aria-invalid={Boolean(state.errors?.password) || undefined} />
        {state.errors?.password && <p className="mt-1.5 text-xs text-red-500">{state.errors.password}</p>}
      </div>
      <button type="submit" disabled={pending} className={cn(btn.base, btn.primary, "w-full py-3")}>
        {pending && <Loader2 size={16} className="animate-spin" />} {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  const onSubmit = useFormSubmit(action);
  if (state.ok) {
    return (
      <div className="space-y-5">
        <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400" role="status">{state.message}</p>
        <Link href="/admin/login" className={cn(btn.base, btn.ghost, "w-full")}>Back to sign in</Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-heading">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
        {state.errors?.email && <p className="mt-1.5 text-xs text-red-500">{state.errors.email}</p>}
      </div>
      <button type="submit" disabled={pending} className={cn(btn.base, btn.primary, "w-full py-3")}>
        {pending && <Loader2 size={16} className="animate-spin" />} Send reset link
      </button>
      <Link href="/admin/login" className="block text-center text-sm text-muted hover:text-heading">Back to sign in</Link>
    </form>
  );
}

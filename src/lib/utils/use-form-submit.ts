"use client";
import { startTransition } from "react";

/**
 * React 19 resets uncontrolled fields after a `<form action>` completes, which
 * would wipe what the user typed when validation fails. Submitting through
 * onSubmit keeps their input intact.
 */
export function useFormSubmit(formAction: (formData: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  };
}

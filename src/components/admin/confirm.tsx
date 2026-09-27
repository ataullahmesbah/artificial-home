"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";
import { btn } from "./ui";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-body"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-line bg-[var(--card-to)] p-6 shadow-2xl"
          >
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h2 id="confirm-title" className="font-heading text-lg font-semibold">{title}</h2>
                <p id="confirm-body" className="mt-1.5 text-sm text-muted">{body}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button ref={cancelRef} type="button" className={cn(btn.base, btn.ghost)} onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className={cn(btn.base, btn.danger)} onClick={onConfirm} disabled={pending}>
                {pending ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

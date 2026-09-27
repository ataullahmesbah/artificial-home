"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Toast = { id: number; text: string; tone: "success" | "error" };
const ToastContext = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <SavedParamToast push={push} />
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-[var(--card-to)] px-4 py-3 text-sm text-heading shadow-lg"
            >
              {t.tone === "success" ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** Shows a toast after a redirect with ?saved=1 and cleans the URL. */
function SavedParamToast({ push }: { push: (t: string) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (params.get("saved") === "1") {
      push("Saved and published.");
      router.replace(pathname, { scroll: false });
    }
  }, [params, pathname, push, router]);
  return null;
}

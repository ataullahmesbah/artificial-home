import Link from "next/link";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-[var(--card-to)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const btn = {
  base: "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  primary: "bg-accent text-on-accent hover:opacity-90",
  ghost: "border border-line text-heading hover:bg-[var(--bg)]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" }) {
  return (
    <Link href={href} className={cn(btn.base, btn[variant])}>
      {children}
    </Link>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="max-w-sm text-muted">{text}</p>
      {action}
    </Card>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "success" | "warning" }) {
  const tones = {
    neutral: "bg-[var(--bg)] text-text",
    accent: "bg-accent/10 text-accent-ink",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

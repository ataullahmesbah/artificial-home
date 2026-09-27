import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AuthCard({ title, subtitle, logo, siteName, children }: { title: string; subtitle: string; logo: string; siteName: string; children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--bg)] p-5">
      <div className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[120px]" aria-hidden />
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="relative block h-12 w-12 overflow-hidden rounded-full border border-line">
            <Image src={logo} alt="" fill sizes="48px" className="object-cover object-top" />
          </span>
          <span className="font-heading text-lg font-semibold text-heading">{siteName}</span>
        </Link>
        <div className="rounded-2xl border border-line bg-[var(--card-to)] p-7 shadow-xl sm:p-8">
          <h1 className="font-heading text-2xl font-bold">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </main>
  );
}

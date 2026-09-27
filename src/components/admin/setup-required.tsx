import Link from "next/link";
import { Database } from "lucide-react";

export function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5">
      <div className="w-full max-w-xl rounded-2xl border border-line bg-[var(--card-to)] p-8">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent-ink">
          <Database />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-bold">Connect Supabase to use the dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          The public website is running on built-in demo content. To edit content, add your Supabase keys and run the database
          migration.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm">
          <li>Create a project at supabase.com.</li>
          <li>
            Run <code className="rounded bg-[var(--bg)] px-1.5 py-0.5">supabase/migrations/0001_init.sql</code>,{" "}
            <code className="rounded bg-[var(--bg)] px-1.5 py-0.5">0002_hardening.sql</code>,{" "}
            <code className="rounded bg-[var(--bg)] px-1.5 py-0.5">0003_awards_sections.sql</code> and then{" "}
            <code className="rounded bg-[var(--bg)] px-1.5 py-0.5">supabase/seed.sql</code> in the SQL editor.
          </li>
          <li>
            Set <code className="rounded bg-[var(--bg)] px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-[var(--bg)] px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel (or .env.local).
          </li>
          <li>Create your owner user and add it to the admins table (see README).</li>
        </ol>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent">
          Back to website
        </Link>
      </div>
    </main>
  );
}

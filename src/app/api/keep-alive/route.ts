import { getPublicClient } from "@/lib/supabase/public";

/**
 * Keeps a free Supabase project from pausing after 7 idle days.
 * Vercel Cron calls this once a day (see vercel.json); it runs one tiny read query.
 * If CRON_SECRET is set in Vercel, only Vercel's cron (which sends it) can call this route.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const db = getPublicClient();
  if (!db) return Response.json({ ok: true, database: "not configured (demo mode)" });
  const { error } = await db.from("site_settings").select("id").limit(1);
  return Response.json({ ok: !error, at: new Date().toISOString() }, { status: error ? 500 : 200, headers: { "Cache-Control": "no-store" } });
}

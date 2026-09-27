import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_SCHEMA, SUPABASE_URL, isSupabaseConfigured } from "./env";

let client: SupabaseClient<any, string> | null = null;

/** Cookie-less anon client for public reads, so public pages stay statically cacheable. */
export function getPublicClient(): SupabaseClient<any, string> | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: SUPABASE_SCHEMA },
  });
  return client;
}

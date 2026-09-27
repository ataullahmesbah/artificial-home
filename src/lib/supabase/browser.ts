"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_SCHEMA, SUPABASE_URL } from "./env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: SUPABASE_SCHEMA } });
}

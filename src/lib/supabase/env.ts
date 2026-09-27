export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when Supabase credentials are present. Without them the public site runs on demo data. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Database schema this website reads and writes. Leave it empty for a normal client install ("public").
 * Set it (e.g. "site01") to run several websites from ONE Supabase project — see README "One Supabase project, many websites".
 */
const rawSchema = (process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? "").trim().toLowerCase();
export const SUPABASE_SCHEMA = /^[a-z][a-z0-9_]{0,30}$/.test(rawSchema) ? rawSchema : "public";

/** Storage bucket for uploads: "portfolio-media", or "<schema>-media" when a custom schema is used. */
export const MEDIA_BUCKET = SUPABASE_SCHEMA === "public" ? "portfolio-media" : `${SUPABASE_SCHEMA.replace(/_/g, "-")}-media`;

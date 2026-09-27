import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminSession = {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: "owner";
};

/** Returns the signed-in, active admin — or null. Verified against Supabase Auth on every call. */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase
    .from("admins")
    .select("display_name, avatar_url, role, active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin || !admin.active) return null;
  return {
    userId: user.id,
    email: user.email ?? "",
    displayName: admin.display_name,
    avatarUrl: admin.avatar_url,
    role: "owner",
  };
});

/** Use in admin pages: redirects to login when there is no active admin session. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Use in server actions: throws instead of redirecting. */
export async function assertAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised");
  return admin;
}

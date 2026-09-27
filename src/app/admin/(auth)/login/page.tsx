import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { AuthCard } from "@/components/admin/auth-card";
import { LoginForm } from "@/components/admin/auth-forms";
import { SetupRequired } from "@/components/admin/setup-required";
import { getProfile, getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!isSupabaseConfigured) return <SetupRequired />;
  if (await getAdmin()) redirect("/admin");
  const [{ error }, settings, profile] = await Promise.all([searchParams, getSettings(), getProfile()]);
  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage your shop." logo={settings.logo_url || profile.profile_image_url} siteName={settings.website_name}>
      <LoginForm linkError={error === "link"} />
    </AuthCard>
  );
}

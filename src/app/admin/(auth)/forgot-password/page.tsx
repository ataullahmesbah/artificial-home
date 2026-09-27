import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/auth-card";
import { ForgotForm } from "@/components/admin/auth-forms";
import { SetupRequired } from "@/components/admin/setup-required";
import { getProfile, getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPage() {
  if (!isSupabaseConfigured) return <SetupRequired />;
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  return (
    <AuthCard title="Reset your password" subtitle="We’ll email you a secure link to set a new password." logo={settings.logo_url || profile.profile_image_url} siteName={settings.website_name}>
      <ForgotForm />
    </AuthCard>
  );
}

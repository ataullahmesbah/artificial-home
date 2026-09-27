import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { settingsFields } from "@/lib/admin/resources";
import { demoSettings } from "@/data/demo";
import { PageHeader } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { saveSettings } from "@/actions/admin";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return (
    <>
      <PageHeader title="Shop settings" description="Shop name, colours, delivery charges, payment numbers, offer banner, sections and SEO." />
      <ResourceForm fields={settingsFields} values={data ?? demoSettings} action={saveSettings} />
    </>
  );
}

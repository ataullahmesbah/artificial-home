import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileFields } from "@/lib/admin/resources";
import { demoProfile } from "@/data/demo";
import { PageHeader } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { saveProfile } from "@/actions/admin";

export const metadata: Metadata = { title: "Our story" };

export default async function ProfilePage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profile").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return (
    <>
      <PageHeader title="Our story &amp; contact" description="The shop owner, your story (About page), address, phone and social links." />
      <ResourceForm fields={profileFields} values={data ?? demoProfile} action={saveProfile} />
    </>
  );
}

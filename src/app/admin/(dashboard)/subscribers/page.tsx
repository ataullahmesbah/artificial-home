import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { SubscribersList } from "@/components/admin/subscribers-list";

export const metadata: Metadata = { title: "Newsletter" };

export default async function SubscribersPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("subscribers").select("id, email, created_at").order("created_at", { ascending: false }).limit(2000);
  return (
    <>
      <PageHeader title="Newsletter" description={`People who signed up for your emails (${data?.length ?? 0}). Copy the list into your email tool.`} />
      {data?.length ? <SubscribersList rows={data} /> : <EmptyState text="No subscribers yet." />}
    </>
  );
}

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { MessagesList } from "@/components/admin/messages-list";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageHeader title="Messages" description="Enquiries sent through the contact form on your website." />
      {data?.length ? <MessagesList messages={data} /> : <EmptyState text="No messages yet. New enquiries from your contact form will appear here." />}
    </>
  );
}

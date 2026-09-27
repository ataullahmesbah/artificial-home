import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resources } from "@/lib/admin/resources";
import { ButtonLink, EmptyState, PageHeader } from "@/components/admin/ui";
import { ResourceTable } from "@/components/admin/resource-table";

type Props = { params: Promise<{ resource: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resource } = await params;
  return { title: resources[resource]?.label ?? "Not found" };
}

export default async function ResourceList({ params }: Props) {
  await requireAdmin();
  const { resource: key } = await params;
  const resource = resources[key];
  if (!resource) notFound();

  const supabase = await createSupabaseServerClient();
  let query = supabase.from(resource.table).select("*").order(resource.orderBy.column, { ascending: resource.orderBy.ascending });
  if (resource.sortable) query = query.order("created_at", { ascending: true });
  const { data, error } = await query;

  const { fields: _fields, ...meta } = resource;
  const add = (
    <ButtonLink href={`/admin/${key}/new`}>
      <Plus size={16} /> Add {resource.singular.toLowerCase()}
    </ButtonLink>
  );

  return (
    <>
      <PageHeader title={resource.label} description={resource.description} action={add} />
      {error ? (
        <EmptyState
          text={
            error.code === "PGRST205" || error.code === "42P01"
              ? "This table does not exist yet. Run the latest file in supabase/migrations (e.g. 0003_awards_sections.sql) in the Supabase SQL Editor, then refresh."
              : "Could not load items. Please refresh the page."
          }
        />
      ) : !data?.length ? (
        <EmptyState text={resource.emptyText} action={add} />
      ) : (
        <ResourceTable resource={meta} rows={data} />
      )}
    </>
  );
}

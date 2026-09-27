import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resources } from "@/lib/admin/resources";
import { PageHeader } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { saveResource } from "@/actions/admin";

type Props = { params: Promise<{ resource: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resource, id } = await params;
  const r = resources[resource];
  return { title: r ? `${id === "new" ? "New" : "Edit"} ${r.singular.toLowerCase()}` : "Not found" };
}

const defaults: Record<string, Record<string, unknown>> = {
  products: { status: "published", stock: 10, rating: 5, review_count: 0, sort_order: 0, images: [], colors: [], featured: false, is_new: true },
  categories: { active: true, sort_order: 0 },
  banners: { active: true, sort_order: 0, button_label: "Shop Now", button_link: "/shop" },
  reviews: { rating: 5, active: true, sort_order: 0 },
  faqs: { active: true, sort_order: 0 },
  blog: { status: "published", read_time: "3 min read", published_at: new Date().toISOString().slice(0, 10) },
};

export default async function ResourceEdit({ params }: Props) {
  await requireAdmin();
  const { resource: key, id } = await params;
  const resource = resources[key];
  if (!resource) notFound();

  const isNew = id === "new";
  let values: Record<string, unknown> = defaults[key] ?? {};
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from(resource.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    values = data;
  }

  // Select fields whose options come from another table (e.g. product → category).
  const fields = await Promise.all(
    resource.fields.map(async (f) => {
      if (!f.optionsFrom) return f;
      const supabase = await createSupabaseServerClient();
      const { data: rows } = await supabase.from(f.optionsFrom.table).select(`${f.optionsFrom.value}, ${f.optionsFrom.label}`).order("sort_order");
      const opts = ((rows ?? []) as unknown as Record<string, string>[]).map((r) => ({ value: r[f.optionsFrom!.value], label: r[f.optionsFrom!.label] }));
      return { ...f, options: opts };
    })
  );

  return (
    <>
      <Link href={`/admin/${key}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading">
        <ArrowLeft size={15} /> {resource.label}
      </Link>
      <PageHeader title={isNew ? `New ${resource.singular.toLowerCase()}` : `Edit ${resource.singular.toLowerCase()}`} description={resource.description} />
      <ResourceForm
        fields={fields}
        values={values}
        action={saveResource.bind(null, key, isNew ? null : id)}
        cancelHref={`/admin/${key}`}
        submitLabel={isNew ? `Create ${resource.singular.toLowerCase()}` : "Save changes"}
      />
    </>
  );
}

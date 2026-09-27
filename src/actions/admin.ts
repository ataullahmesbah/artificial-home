"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET, SUPABASE_URL } from "@/lib/supabase/env";
import { profileFields, resources, settingsFields, type Field } from "@/lib/admin/resources";
import { buildSchema, collectErrors, formToObject } from "@/lib/admin/schema";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

function getResource(key: string) {
  const r = resources[key];
  if (!r) throw new Error("Unknown resource");
  return r;
}

const idSchema = z.string().uuid();

function refreshSite() {
  revalidatePath("/", "layout");
}

/** Storage paths (inside our bucket) referenced by a record's media fields. */
function mediaPaths(fields: Field[], record: Record<string, unknown>) {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const urls: string[] = [];
  for (const f of fields) {
    const v = record[f.name];
    if ((f.type === "image" || f.type === "file") && typeof v === "string") urls.push(v);
    if (f.type === "gallery" && Array.isArray(v)) urls.push(...(v as string[]));
  }
  return urls.filter((u) => SUPABASE_URL && u.startsWith(prefix)).map((u) => decodeURIComponent(u.slice(prefix.length)));
}

/** Every storage path still referenced by any record (e.g. a duplicated project shares its images). */
async function referencedPaths() {
  const supabase = await createSupabaseServerClient();
  const sources: { table: string; fields: Field[] }[] = [
    ...Object.values(resources).map((r) => ({ table: r.table, fields: r.fields })),
    { table: "profile", fields: profileFields },
    { table: "site_settings", fields: settingsFields },
    { table: "admins", fields: [{ name: "avatar_url", label: "", type: "image" }] },
  ];
  const results = await Promise.all(sources.map((s) => supabase.from(s.table).select("*")));
  const used = new Set<string>();
  results.forEach(({ data }, i) => (data ?? []).forEach((row) => mediaPaths(sources[i].fields, row).forEach((p) => used.add(p))));
  return used;
}

async function removeMedia(candidates: string[]) {
  if (!candidates.length) return;
  const used = await referencedPaths();
  const paths = candidates.filter((p) => !used.has(p));
  if (!paths.length) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) console.error("[admin] media cleanup failed:", error.message);
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export async function saveResource(key: string, id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin();
  const resource = getResource(key);
  if (id && !idSchema.safeParse(id).success) return { message: "Invalid record." };

  const parsed = buildSchema(resource.fields).safeParse(formToObject(resource.fields, formData));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: collectErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  let previous: Record<string, unknown> | null = null;
  if (id) {
    const { data } = await supabase.from(resource.table).select("*").eq("id", id).maybeSingle();
    previous = data;
  }

  const query = id
    ? supabase.from(resource.table).update(parsed.data).eq("id", id)
    : supabase.from(resource.table).insert(parsed.data);
  const { error } = await query;
  if (error) {
    if (error.code === "23505") return { message: "That URL slug is already used.", errors: { slug: "Already used by another item." } };
    if (error.code === "23514") return { message: "One value is not allowed — e.g. the sale price must be lower than the regular price." };
    if (error.code === "23503") return { message: "Please choose a category from the list." };
    console.error(`[admin] save ${key}:`, error.message);
    return { message: "Could not save. Please try again." };
  }

  // Remove media files that were replaced or removed in this edit.
  if (previous) {
    const keep = new Set(mediaPaths(resource.fields, parsed.data));
    await removeMedia(mediaPaths(resource.fields, previous).filter((p) => !keep.has(p)));
  }

  refreshSite();
  redirect(`/admin/${key}?saved=1`);
}

export async function deleteResource(key: string, id: string) {
  await assertAdmin();
  const resource = getResource(key);
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid record." };
  const supabase = await createSupabaseServerClient();
  const { data: record } = await supabase.from(resource.table).select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from(resource.table).delete().eq("id", id);
  if (error) return { ok: false, message: "Could not delete. Please try again." };
  if (record) await removeMedia(mediaPaths(resource.fields, record));
  refreshSite();
  revalidatePath(`/admin/${key}`);
  return { ok: true, message: `${resource.singular} deleted.` };
}

export async function toggleResource(key: string, id: string, field: string) {
  await assertAdmin();
  const resource = getResource(key);
  const toggle = resource.toggles?.find((t) => t.name === field);
  if (!toggle || !idSchema.safeParse(id).success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from(resource.table).select(field).eq("id", id).maybeSingle();
  if (!data) return { ok: false };
  const current = (data as unknown as Record<string, unknown>)[field];
  const { error } = await supabase
    .from(resource.table)
    .update({ [field]: current === toggle.on ? toggle.off : toggle.on })
    .eq("id", id);
  if (error) return { ok: false };
  refreshSite();
  revalidatePath(`/admin/${key}`);
  return { ok: true };
}

export async function moveResource(key: string, id: string, direction: "up" | "down") {
  await assertAdmin();
  const resource = getResource(key);
  if (!resource.sortable || !idSchema.safeParse(id).success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase.from(resource.table).select("id, sort_order").order("sort_order").order("created_at");
  if (!rows) return { ok: false };
  const index = rows.findIndex((r) => r.id === id);
  const swap = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= rows.length) return { ok: false };
  // Normalise order to 1..n, then swap the two neighbours.
  const ordered = rows.map((r) => r.id as string);
  [ordered[index], ordered[swap]] = [ordered[swap], ordered[index]];
  await Promise.all(ordered.map((rowId, i) => supabase.from(resource.table).update({ sort_order: i + 1 }).eq("id", rowId)));
  refreshSite();
  revalidatePath(`/admin/${key}`);
  return { ok: true };
}

export async function duplicateProduct(id: string) {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) return { ok: false };
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = data;
  const suffix = Math.random().toString(36).slice(2, 6);
  const { error } = await supabase
    .from("products")
    .insert({ ...rest, name: `${rest.name} (copy)`, slug: `${rest.slug}-copy-${suffix}`, status: "draft", featured: false });
  if (error) return { ok: false };
  revalidatePath("/admin/products");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Singletons: profile + settings                                      */
/* ------------------------------------------------------------------ */

async function saveSingleton(table: "profile" | "site_settings", fields: Field[], formData: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = buildSchema(fields).safeParse(formToObject(fields, formData));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: collectErrors(parsed.error) };
  const supabase = await createSupabaseServerClient();
  // Singleton tables: always work on the most recently updated row.
  const { data: existing } = await supabase
    .from(table)
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: saved, error } = existing
    ? await supabase.from(table).update(parsed.data).eq("id", existing.id).select("id")
    : await supabase.from(table).insert(parsed.data).select("id");
  if (error) {
    console.error(`[admin] save ${table}:`, error.message);
    // Column missing = a database migration was not run yet.
    if (error.code === "PGRST204" || error.code === "42703") {
      return { message: "Database update needed: run the latest file in supabase/migrations (e.g. 0004_shop.sql) in the Supabase SQL Editor, then save again." };
    }
    if (error.code === "23514") {
      return { message: "One value is not allowed. Check the order prefix (1–4 capital letters) and the map link." };
    }
    return { message: "Could not save. Please try again." };
  }
  // RLS blocks silently (0 rows, no error) — never report success in that case.
  if (!saved?.length) {
    console.error(`[admin] save ${table}: no row was written (check the admins table / RLS policies)`);
    return { message: "Nothing was saved: your account is not allowed to edit this. Make sure your user is in the admins table and active." };
  }
  // Self-heal: remove stray duplicate rows so the website and dashboard always read the same one.
  await supabase.from(table).delete().neq("id", saved[0].id);
  if (existing) {
    const keep = new Set(mediaPaths(fields, parsed.data));
    await removeMedia(mediaPaths(fields, existing).filter((p) => !keep.has(p)));
  }
  refreshSite();
  return { ok: true, message: "Changes saved and published." };
}

export async function saveProfile(_prev: FormState, formData: FormData) {
  return saveSingleton("profile", profileFields, formData);
}

export async function saveSettings(_prev: FormState, formData: FormData) {
  return saveSingleton("site_settings", settingsFields, formData);
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export async function setMessageRead(id: string, read: boolean) {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("messages").update({ is_read: read }).eq("id", id);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: !error };
}

export async function deleteMessage(id: string) {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  revalidatePath("/admin/messages");
  return { ok: !error, message: error ? "Could not delete." : "Message deleted." };
}

/* ------------------------------------------------------------------ */
/* Account                                                             */
/* ------------------------------------------------------------------ */

export async function updateAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const schema = z.object({
    display_name: z.string().trim().min(2, "Name is too short.").max(60),
    avatar_url: z.preprocess((v) => (v === "" ? null : v), z.string().nullable()),
  });
  const parsed = schema.safeParse({ display_name: formData.get("display_name"), avatar_url: formData.get("avatar_url") ?? "" });
  if (!parsed.success) return { errors: collectErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { isAllowedMediaUrl } = await import("@/lib/admin/schema");
  if (parsed.data.avatar_url && !isAllowedMediaUrl(parsed.data.avatar_url)) {
    return { errors: { avatar_url: "Please upload the image using the uploader." } };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("admins").update(parsed.data).eq("user_id", admin.userId);
  if (error) return { message: "Could not update your account." };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Account updated." };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const limit = rateLimit(`pw:${admin.userId}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return { message: "Too many attempts. Please try again later." };

  const schema = z
    .object({
      current: z.string().min(1, "Enter your current password."),
      password: newPasswordSchema,
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, { message: "Passwords do not match.", path: ["confirm"] });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: collectErrors(parsed.error), message: "Please fix the highlighted fields." };

  const supabase = await createSupabaseServerClient();
  const { error: authError } = await supabase.auth.signInWithPassword({ email: admin.email, password: parsed.data.current });
  if (authError) return { errors: { current: "Current password is incorrect." } };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: error.message };
  return { ok: true, message: "Password changed." };
}

const newPasswordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(72)
  .regex(/[a-zA-Z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

/** Used after a password-reset email link: the callback route sets a short-lived cookie. */
export async function setNewPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin();
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  if (jar.get("pw_reset")?.value !== "1") return { message: "This reset link has expired. Please request a new one." };
  const parsed = z
    .object({ password: newPasswordSchema, confirm: z.string() })
    .refine((d) => d.password === d.confirm, { message: "Passwords do not match.", path: ["confirm"] })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: collectErrors(parsed.error), message: "Please fix the highlighted fields." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: error.message };
  jar.delete("pw_reset");
  return { ok: true, message: "Your new password is set." };
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIp();
  const limit = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) return { message: "Too many login attempts. Please wait a few minutes and try again." };

  const parsed = z
    .object({ email: z.string().trim().email("Enter a valid email."), password: z.string().min(1, "Enter your password.") })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: collectErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  // Generic message: never reveal whether the account exists.
  if (error || !data.user) return { message: "Invalid email or password." };

  const { data: admin } = await supabase.from("admins").select("active").eq("user_id", data.user.id).maybeSingle();
  if (!admin?.active) {
    await supabase.auth.signOut();
    return { message: "Invalid email or password." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIp();
  const limit = rateLimit(`reset:${ip}`, 3, 15 * 60 * 1000);
  const done: FormState = { ok: true, message: "If an account exists for that email, a reset link is on its way." };
  if (!limit.ok) return done;
  const email = z.string().trim().email().safeParse(formData.get("email"));
  if (!email.success) return { errors: { email: "Enter a valid email." } };
  const { siteConfig } = await import("@/config/site");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${siteConfig.url}/admin/auth/callback`,
  });
  return done;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const orderUpdate = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  payment_status: z.enum(["unpaid", "paid", "refunded"]),
  admin_note: z.string().trim().max(1000),
});

/** Updates status / payment. Cancelling puts the items back in stock; un-cancelling takes them out again. */
export async function updateOrder(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { message: "Invalid order." };
  const parsed = orderUpdate.safeParse({
    status: formData.get("status"),
    payment_status: formData.get("payment_status"),
    admin_note: formData.get("admin_note") ?? "",
  });
  if (!parsed.success) return { message: "Please choose a valid status." };
  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase.from("orders").select("status, items").eq("id", id).maybeSingle();
  if (!order) return { message: "Order not found." };

  const wasCancelled = order.status === "cancelled";
  const nowCancelled = parsed.data.status === "cancelled";
  if (wasCancelled !== nowCancelled) {
    const items = (order.items ?? []) as { product_id: string; qty: number }[];
    for (const it of items) {
      const { data: p } = await supabase.from("products").select("stock").eq("id", it.product_id).maybeSingle();
      if (!p) continue;
      const stock = Math.max(0, (p.stock as number) + (nowCancelled ? it.qty : -it.qty));
      await supabase.from("products").update({ stock }).eq("id", it.product_id);
    }
  }

  const { data: saved, error } = await supabase.from("orders").update(parsed.data).eq("id", id).select("id");
  if (error || !saved?.length) return { message: "Could not update the order." };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin", "layout");
  if (wasCancelled !== nowCancelled) refreshSite();
  return { ok: true, message: nowCancelled && !wasCancelled ? "Order cancelled — items are back in stock." : "Order updated." };
}

export async function deleteOrder(id: string) {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid order." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin", "layout");
  return { ok: !error, message: error ? "Could not delete." : "Order deleted." };
}

export async function deleteSubscriber(id: string) {
  await assertAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("subscribers").delete().eq("id", id);
  revalidatePath("/admin/subscribers");
  return { ok: !error };
}

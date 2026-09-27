"use server";
import { contactSchema, type ContactState } from "@/lib/validation/contact";
import { getPublicClient } from "@/lib/supabase/public";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("website") ?? "").length > 0) {
    return { status: "success", message: "Thanks! Your message has been sent." };
  }
  // Submissions faster than 3s after render are almost always bots.
  const startedAt = Number(formData.get("started_at") ?? 0);
  if (startedAt && Date.now() - startedAt < 3000) {
    return { status: "error", message: "That was quick! Please wait a moment and try again." };
  }

  const ip = await clientIp();
  const limit = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return { status: "error", message: `Too many messages. Please try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).` };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactState["errors"]>;
      errors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  const db = getPublicClient();
  if (!db) {
    console.info("[contact] Demo mode (Supabase not configured). Message:", parsed.data.email);
    return { status: "success", message: "Thanks! Your message has been sent. (Demo mode)" };
  }

  const { name, email, phone, service, budget, message } = parsed.data;
  const { error } = await db.from("messages").insert({
    name,
    email,
    phone: phone || null,
    service: service || null,
    budget: budget || null,
    message,
  });
  if (error) {
    // Database anti-spam guard (see supabase/migrations/0002_hardening.sql)
    if (error.code === "P0001") return { status: "error", message: error.message };
    console.error("[contact] insert failed:", error.message);
    return { status: "error", message: "Something went wrong. Please try again or email me directly." };
  }
  return { status: "success", message: "Thanks! Your message has been sent. I'll reply within 1–2 business days." };
}

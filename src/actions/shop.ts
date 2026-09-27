"use server";
import { z } from "zod";
import { getPublicClient } from "@/lib/supabase/public";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export type SubscribeState = { ok?: boolean; message?: string };

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = z.string().trim().toLowerCase().email().max(120).safeParse(formData.get("email"));
  if (!email.success) return { ok: false, message: "Please enter a valid email address." };
  const limit = rateLimit(`nl:${await clientIp()}`, 5, 10 * 60 * 1000);
  if (!limit.ok) return { ok: false, message: "Too many tries. Please wait a few minutes." };
  const db = getPublicClient();
  if (!db) return { ok: true, message: "Thank you! You're on the list. (Demo mode)" };
  const { error } = await db.from("subscribers").insert({ email: email.data });
  // Already subscribed counts as success.
  if (error && error.code !== "23505") {
    if (error.code === "P0001") return { ok: false, message: error.message };
    console.error("[newsletter]", error.message);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  return { ok: true, message: "Thank you! You're on the list. 💌" };
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+?88)?01[3-9]\d{8}$/.test(v), "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).");

const orderSchema = z
  .object({
    customer_name: z.string().trim().min(2, "Please enter your name.").max(80),
    phone,
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid email or leave it empty.").max(120)]),
    address: z.string().trim().min(5, "Please enter your full address.").max(300),
    city: z.string().trim().max(60),
    area: z.enum(["inside", "outside"], { message: "Please choose a delivery area." }),
    note: z.string().trim().max(500),
    payment_method: z.enum(["cod", "bkash", "nagad", "rocket", "qr"], { message: "Please choose a payment method." }),
    payment_sender: z.string().trim().max(20),
    payment_trx: z.string().trim().toUpperCase().max(20),
    items: z
      .array(z.object({ product_id: z.string().uuid().or(z.string().regex(/^p\d+$/)), qty: z.number().int().min(1).max(20), color: z.string().max(40).nullable() }))
      .min(1, "Your cart is empty.")
      .max(30),
  })
  .superRefine((d, ctx) => {
    if (d.payment_method === "cod") return;
    if (!/^[A-Z0-9]{6,20}$/.test(d.payment_trx)) ctx.addIssue({ code: "custom", path: ["payment_trx"], message: "Enter the Transaction ID from your payment SMS." });
    if (d.payment_method !== "qr" && !/^(\+?88)?01[3-9]\d{8}$/.test(d.payment_sender.replace(/[\s-]/g, ""))) {
      ctx.addIssue({ code: "custom", path: ["payment_sender"], message: "Enter the number you paid from." });
    }
  });

export type OrderState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  order?: { number: string; total: number; demo?: boolean };
};

export async function placeOrder(input: unknown): Promise<OrderState> {
  const limit = rateLimit(`order:${await clientIp()}`, 6, 30 * 60 * 1000);
  if (!limit.ok) return { message: "Too many orders from this device. Please try again later or contact us on WhatsApp." };

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { message: errors.items ?? "Please check the highlighted fields.", errors };
  }

  const db = getPublicClient();
  if (!db) {
    // Demo mode: no database, so show a realistic confirmation without saving.
    const number = `AH${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-DEMO`;
    return { ok: true, order: { number, total: 0, demo: true } };
  }

  const { data, error } = await db.rpc("place_order", { payload: parsed.data });
  if (error) {
    // Friendly messages raised by public.place_order() (stock, payment method …)
    if (error.code === "P0001") return { message: error.message };
    console.error("[order]", error.message);
    return { message: "Sorry, we could not place your order. Please try again or order on WhatsApp." };
  }
  const result = data as { order_number: string; total: number };
  return { ok: true, order: { number: result.order_number, total: result.total } };
}

export type TrackState = {
  message?: string;
  /** what the visitor typed, so the form keeps it after submitting */
  values?: { order_number: string; phone: string };
  result?: { order_number: string; status: string; payment_status: string; payment_method: string; total: number; items: number; created_at: string } | null;
};

export async function trackOrder(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const values = { order_number: String(formData.get("order_number") ?? "").slice(0, 30), phone: String(formData.get("phone") ?? "").slice(0, 20) };
  const res = await track(formData);
  return { ...res, values };
}

async function track(formData: FormData): Promise<TrackState> {
  const limit = rateLimit(`track:${await clientIp()}`, 15, 10 * 60 * 1000);
  if (!limit.ok) return { message: "Too many tries. Please wait a few minutes." };
  const number = z.string().trim().toUpperCase().regex(/^[A-Z]{1,4}\d{6}-[A-Z0-9]{4,5}$/).safeParse(formData.get("order_number"));
  const tel = phone.safeParse(formData.get("phone"));
  if (!number.success || !tel.success) return { message: "Enter your order number (e.g. AH260927-7A1B2) and the phone number you used.", result: null };
  const db = getPublicClient();
  if (!db) return { message: "Order tracking works once the shop is connected to its database.", result: null };
  const { data, error } = await db.rpc("track_order", { p_number: number.data, p_phone: tel.data });
  if (error) {
    console.error("[track]", error.message);
    return { message: "Something went wrong. Please try again.", result: null };
  }
  if (!data) return { message: "We couldn't find an order with that number and phone. Please check and try again.", result: null };
  return { result: data as TrackState["result"] };
}

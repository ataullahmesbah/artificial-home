import "server-only";

/**
 * PROTECTED COMPANY SUPPORT CONFIG
 * Rendered read-only at /admin/support. There is intentionally NO database
 * table, form or server action that can change these values from the
 * dashboard. Replace the defaults below (or set the SUPPORT_* env vars in
 * Vercel) with your company's real details before handover.
 */
export const supportConfig = {
  companyName: process.env.SUPPORT_COMPANY_NAME || "Hyascka",
  supportPhone: process.env.SUPPORT_PHONE || "+8801571083401",
  whatsappUrl: process.env.SUPPORT_WHATSAPP_URL || "https://wa.me/8801571083401",
  messengerUrl: process.env.SUPPORT_MESSENGER_URL || "https://www.facebook.com/hyascka",
  email: process.env.SUPPORT_EMAIL || "contact@ataullahmesbah.com",
  websiteUrl: process.env.SUPPORT_WEBSITE_URL || "https://ataullahmesbah.com",
  officeHours: "Saturday – Thursday, 10:00 – 19:00 (GMT+6)",
  message:
    "For updates, maintenance, redesigns or a new project, contact our team directly.",
} as const;

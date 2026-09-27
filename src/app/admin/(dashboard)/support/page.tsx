import type { Metadata } from "next";
import { Globe, Lock, Mail, MessageCircle, Phone, Clock } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { supportConfig } from "@/config/support";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Support" };

/** Read-only by design: there is no form, action or table behind this page. */
export default async function SupportPage() {
  await requireAdmin();
  const s = supportConfig;
  const actions = [
    { label: "WhatsApp support", href: s.whatsappUrl, icon: <BrandIcon name="whatsapp" size={18} />, primary: true },
    { label: "Messenger", href: s.messengerUrl, icon: <MessageCircle size={18} /> },
    { label: "Call support", href: `tel:${s.supportPhone.replace(/\s/g, "")}`, icon: <Phone size={18} /> },
    { label: "Email us", href: `mailto:${s.email}`, icon: <Mail size={18} /> },
  ];
  return (
    <>
      <PageHeader title="Support & future projects" />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="relative overflow-hidden lg:col-span-3">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <h2 className="relative font-heading text-2xl font-bold">Need help with your website?</h2>
          <p className="relative mt-2 max-w-lg text-muted">{s.message}</p>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
            {actions.map((a) => (
              <a
                key={a.label}
                href={a.href}
                target={a.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={a.primary ? "flex items-center gap-3 rounded-xl bg-accent px-4 py-3.5 text-sm font-medium text-on-accent hover:opacity-90" : "flex items-center gap-3 rounded-xl border border-line px-4 py-3.5 text-sm font-medium text-heading hover:bg-[var(--bg)]"}
              >
                {a.icon} {a.label}
              </a>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Company</dt>
              <dd className="mt-1 font-heading text-lg font-semibold text-heading">{s.companyName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Website</dt>
              <dd className="mt-1">
                <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent-ink hover:underline">
                  <Globe size={15} /> {s.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Phone</dt>
              <dd className="mt-1 text-heading">{s.supportPhone}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Email</dt>
              <dd className="mt-1 break-all text-heading">{s.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Office hours</dt>
              <dd className="mt-1 inline-flex items-center gap-2 text-heading"><Clock size={15} /> {s.officeHours}</dd>
            </div>
          </dl>
          <p className="mt-6 flex items-start gap-2 rounded-xl bg-[var(--bg)] p-3 text-xs text-muted">
            <Lock size={14} className="mt-0.5 shrink-0" /> This information is provided by your website development partner and cannot be edited from this dashboard.
          </p>
        </Card>
      </div>
    </>
  );
}

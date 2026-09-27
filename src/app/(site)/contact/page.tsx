import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ClipReveal, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { PageBanner } from "@/components/shop/page-banner";
import { ContactForm } from "@/components/site/contact-form";
import { getProfile, getSettings } from "@/lib/data";
import { isSectionVisible } from "@/lib/sections";
import { isAllowedEmbedUrl } from "@/lib/admin/schema";

export const metadata: Metadata = { title: "Contact Us", description: "Questions about an order or a product? We're happy to help.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  if (!isSectionVisible(settings.sections, "contact")) notFound();
  const map = settings.map_embed_url && isAllowedEmbedUrl(settings.map_embed_url) ? settings.map_embed_url : null;
  const phone = settings.public_phone ?? profile.phone;
  const cards = [
    profile.location && { Icon: MapPin, label: "Visit us", value: profile.location, href: null },
    phone && { Icon: Phone, label: "Call us", value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` },
    { Icon: Mail, label: "Email us", value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    { Icon: Clock, label: "Open", value: "Sat – Thu, 10am – 9pm", href: null },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; value: string; href: string | null }[];

  return (
    <>
      <PageBanner title="Contact Us" text="Questions about an order, a product or wholesale? Send us a message." crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <div className="container-x section">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, label, value, href }) => (
            <StaggerItem key={label}>
              <div className="card flex h-full flex-col items-center gap-2 !rounded-[22px] px-5 py-7 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon size={22} />
                </span>
                <span className="mt-1 text-sm font-semibold tracking-wide text-muted uppercase">{label}</span>
                {href ? (
                  <a href={href} className="font-semibold break-all text-heading hover:text-accent-ink">
                    {value}
                  </a>
                ) : (
                  <span className="font-semibold text-heading">{value}</span>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="h-section">
              Send us a <em>message</em>
            </h2>
            <p className="mt-3 mb-8">We usually reply within a few hours. For faster help, message us on WhatsApp.</p>
            <ContactForm services={["Order question", "Product question", "Exchange / return", "Wholesale"]} />
          </Reveal>
          {map && (
            <ClipReveal className="relative min-h-[380px] overflow-hidden rounded-[28px] bg-surface">
              <iframe src={map} title={`Map: ${profile.location || "our shop"}`} className="map-frame absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </ClipReveal>
          )}
        </div>
      </div>
    </>
  );
}

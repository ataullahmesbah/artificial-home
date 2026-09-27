import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/shop/logo";
import { PaymentBadges, enabledPayments } from "@/components/shop/payment-badges";
import { BrandIcon } from "@/components/ui/brand-icon";
import { siteConfig } from "@/config/site";
import type { NavItem } from "@/lib/sections";
import type { Category, Profile, SiteSettings } from "@/types/content";

export function Footer({ settings, profile, categories, nav }: { settings: SiteSettings; profile: Profile; categories: Category[]; nav: NavItem[] }) {
  const year = new Date().getFullYear();
  const phone = settings.public_phone ?? profile.phone;
  const help = [{ label: "Track Your Order", href: "/track" }, { label: "Wishlist", href: "/wishlist" }, { label: "Cart", href: "/cart" }, ...nav];
  return (
    <footer className="mt-10 bg-[#2b1520] text-[#e9d6dd] dark:bg-[#120a0e]">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo name={settings.website_name} logo={settings.logo_url} light />
          <p className="mt-5 max-w-[320px] text-[15px] leading-relaxed text-[#cdb6bf]">{settings.footer_text}</p>
          {profile.social_links.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Social media">
              {profile.social_links.map((s) => (
                <li key={s.platform + s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white transition-colors hover:bg-accent">
                    <BrandIcon name={s.platform} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-heading text-lg text-white">Shop</h2>
          <ul className="mt-5 flex flex-col gap-2.5 text-[15px]">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop/${c.slug}`} className="transition-colors hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-lg text-white">Help</h2>
          <ul className="mt-5 flex flex-col gap-2.5 text-[15px]">
            {help.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-lg text-white">Contact</h2>
          <ul className="mt-5 flex flex-col gap-3 text-[15px]">
            {profile.location && (
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent-2" aria-hidden /> {profile.location}
              </li>
            )}
            {phone && (
              <li>
                <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex gap-3 hover:text-white">
                  <Phone size={18} className="mt-0.5 shrink-0 text-accent-2" aria-hidden /> {phone}
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${settings.contact_email}`} className="flex gap-3 break-all hover:text-white">
                <Mail size={18} className="mt-0.5 shrink-0 text-accent-2" aria-hidden /> {settings.contact_email}
              </a>
            </li>
          </ul>
          <p className="mt-6 mb-2.5 text-sm font-semibold text-white">We accept</p>
          <PaymentBadges methods={enabledPayments(settings)} />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-sm text-[#b89fa9] sm:flex-row">
          <p>
            © {year} {settings.website_name}. All rights reserved.
          </p>
          <p>
            Developed by{" "}
            <a href={siteConfig.developer.url} target="_blank" rel="noopener" className="font-semibold text-white hover:text-accent-2">
              {siteConfig.developer.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { Navbar } from "@/components/shop/navbar";
import { Footer } from "@/components/shop/footer";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { WhatsAppButton } from "@/components/shop/whatsapp-button";
import { Cursor } from "@/components/site/cursor";
import { getCategories, getProfile, getSettings } from "@/lib/data";
import { navItems } from "@/lib/sections";

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, profile, categories] = await Promise.all([getSettings(), getProfile(), getCategories()]);
  const nav = navItems(settings.sections);
  const whatsapp = settings.whatsapp_number?.replace(/\D/g, "") || null;
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
        Skip to content
      </a>
      <AnnouncementBar text={settings.announcement} />
      <Navbar name={settings.website_name} logo={settings.logo_url} categories={categories} nav={nav} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} profile={profile} categories={categories} nav={nav} />
      <CartDrawer freeMin={settings.free_delivery_min} />
      {whatsapp && <WhatsAppButton number={whatsapp} shop={settings.website_name} />}
      {settings.cursor_enabled !== false && <Cursor />}
    </>
  );
}

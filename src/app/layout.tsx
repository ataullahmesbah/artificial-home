import type { Metadata, Viewport } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/400-italic.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/500-italic.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getSettings } from "@/lib/data";
import { siteConfig } from "@/config/site";
import { contrastText, safeHex } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: s.seo_title, template: `%s | ${s.website_name}` },
    description: s.seo_description,
    applicationName: s.website_name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: "/",
      siteName: s.website_name,
      title: s.seo_title,
      description: s.seo_description,
    },
    twitter: { card: "summary_large_image", title: s.seo_title, description: s.seo_description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1a1015" },
    { media: "(prefers-color-scheme: light)", color: "#fffafb" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const accent = safeHex(settings.accent_color, "#e0457b");
  const accent2 = safeHex(settings.accent_color_2, "#c9956b");
  // Light brand colours get dark text on top and a darker "ink" shade for text on light backgrounds.
  const onAccent = contrastText(accent);
  const accentInkLight = onAccent === "#ffffff" ? accent : `color-mix(in srgb, ${accent} 50%, #000)`;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ "--accent": accent, "--accent-2": accent2, "--on-accent": onAccent, "--accent-ink-light": accentInkLight } as React.CSSProperties}
    >
      <body>
        <Providers defaultTheme={settings.default_theme}>{children}</Providers>
      </body>
    </html>
  );
}

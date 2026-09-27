/**
 * Website sections: which ones are shown and in what order.
 * Stored in site_settings.sections and edited in Admin → Settings.
 * The hero slider is always first on the home page. Turning off a "page"
 * section (About, Blog, FAQ, Contact) also removes it from the menu.
 */
export type SectionKey =
  | "trust"
  | "categories"
  | "featured"
  | "promo"
  | "new_arrivals"
  | "reviews"
  | "gallery"
  | "blog"
  | "newsletter"
  | "about"
  | "faq"
  | "contact";

export type SectionSetting = { key: SectionKey; visible: boolean };

type SectionDef = {
  key: SectionKey;
  label: string;
  description: string;
  /** Menu link to a full page (the page is hidden too when the section is turned off). */
  page?: { label: string; href: string };
};

export const SECTION_DEFS: SectionDef[] = [
  { key: "trust", label: "Trust bar", description: "Free delivery, Cash on Delivery, easy return … (home)" },
  { key: "categories", label: "Shop by category", description: "Round category pictures (home)" },
  { key: "featured", label: "Featured products", description: "Tabs: Best sellers / New / On sale (home)" },
  { key: "promo", label: "Offer banner", description: "Big offer with countdown (home, set it up in Settings)" },
  { key: "new_arrivals", label: "New arrivals", description: "Product slider (home)" },
  { key: "reviews", label: "Customer reviews", description: "Review slider (home)" },
  { key: "gallery", label: "Instagram gallery", description: "Photo grid (home, pictures in Settings)" },
  { key: "blog", label: "Blog", description: "Latest articles (home) and /blog", page: { label: "Blog", href: "/blog" } },
  { key: "newsletter", label: "Newsletter", description: "Email sign-up (home)" },
  { key: "about", label: "About page", description: "Your story (/about)", page: { label: "About", href: "/about" } },
  { key: "faq", label: "FAQ page", description: "Questions & answers (/faq)", page: { label: "FAQ", href: "/faq" } },
  { key: "contact", label: "Contact page", description: "Map, contact details and form (/contact)", page: { label: "Contact", href: "/contact" } },
];

export const SECTION_KEYS = SECTION_DEFS.map((d) => d.key);

export const defaultSections: SectionSetting[] = SECTION_DEFS.map((d) => ({ key: d.key, visible: true }));

/** Merges saved settings with the known sections: keeps saved order, drops unknown keys, appends new ones. */
export function normalizeSections(saved: unknown): SectionSetting[] {
  // Older saves may have stored the list as a JSON string — accept both.
  if (typeof saved === "string") {
    try {
      saved = JSON.parse(saved);
    } catch {
      saved = [];
    }
  }
  const list = Array.isArray(saved) ? saved : [];
  const seen = new Set<string>();
  const result: SectionSetting[] = [];
  for (const item of list) {
    const key = (item as SectionSetting)?.key;
    if (!SECTION_KEYS.includes(key) || seen.has(key)) continue;
    seen.add(key);
    result.push({ key, visible: (item as SectionSetting).visible !== false });
  }
  for (const d of SECTION_DEFS) if (!seen.has(d.key)) result.push({ key: d.key, visible: true });
  return result;
}

export function isSectionVisible(saved: unknown, key: SectionKey) {
  return normalizeSections(saved).find((s) => s.key === key)?.visible ?? true;
}

export type NavItem = { label: string; href: string };

/** Extra menu links (after Home and Shop), following visibility. */
export function navItems(saved: unknown): NavItem[] {
  const visible = new Set(normalizeSections(saved).filter((s) => s.visible).map((s) => s.key));
  const items: NavItem[] = [];
  for (const d of SECTION_DEFS) if (d.page && visible.has(d.key)) items.push(d.page);
  return items;
}

export function sectionLabel(key: SectionKey) {
  return SECTION_DEFS.find((d) => d.key === key)?.label ?? key;
}

export function sectionDescription(key: SectionKey) {
  return SECTION_DEFS.find((d) => d.key === key)?.description ?? "";
}

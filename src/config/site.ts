export const siteConfig = {
  /** Developer credit shown at the end of the footer (not editable from the dashboard). */
  developer: { name: "Ataullah Mesbah", url: "https://www.ataullahmesbah.com" },
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_US",
  // Sidebar links come from Admin → Settings → Page sections (src/lib/sections.ts).
  /** Accent presets offered in Admin → Settings (any custom hex is also allowed). */
  accentPresets: [
    { name: "Gold", value: "#f2b35b" },
    { name: "Royal Purple", value: "#4f3cf0" },
    { name: "Ocean Blue", value: "#2563eb" },
    { name: "Crimson", value: "#e11d48" },
    { name: "Sunset", value: "#f97316" },
    { name: "Emerald", value: "#10b981" },
    { name: "Teal", value: "#0d9488" },
    { name: "Pink", value: "#ec4899" },
  ],
} as const;

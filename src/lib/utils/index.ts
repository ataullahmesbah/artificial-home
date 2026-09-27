export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Validates a #rgb / #rrggbb colour and returns a safe fallback otherwise. */
export function safeHex(value: string | null | undefined, fallback = "#ff014f") {
  return value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : fallback;
}

/** Picks dark or light text for readable contrast on top of a hex background. */
export function contrastText(hex: string) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#111111" : "#ffffff";
}

/** "৳1,150" — prices are whole Taka. */
export function formatPrice(value: number) {
  return `৳${Math.round(value).toLocaleString("en-US")}`;
}

/** Current price and discount of a product. */
export function priceOf(p: { price: number; sale_price: number | null }) {
  const sale = p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.price;
  return {
    now: sale ? (p.sale_price as number) : p.price,
    was: sale ? p.price : null,
    off: sale ? Math.round((1 - (p.sale_price as number) / p.price) * 100) : 0,
  };
}

import type { ShopQuery } from "@/components/shop/shop-view";

export type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function readQuery(sp: SP): ShopQuery {
  return {
    q: one(sp.q).slice(0, 60),
    sort: one(sp.sort) || "featured",
    sale: one(sp.sale) === "1",
    isNew: one(sp.new) === "1",
    inStock: one(sp.stock) === "1",
    min: one(sp.min).replace(/\D/g, "").slice(0, 7),
    max: one(sp.max).replace(/\D/g, "").slice(0, 7),
    cat: one(sp.cat).replace(/[^a-z0-9-]/g, "").slice(0, 60),
  };
}


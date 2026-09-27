import type { Metadata } from "next";
import { PageBanner } from "@/components/shop/page-banner";
import { CartView } from "@/components/shop/cart-view";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default async function CartPage() {
  const s = await getSettings();
  return (
    <>
      <PageBanner title="Shopping Cart" crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <div className="container-x section">
        <CartView freeMin={s.free_delivery_min} inside={s.delivery_inside} outside={s.delivery_outside} />
      </div>
    </>
  );
}

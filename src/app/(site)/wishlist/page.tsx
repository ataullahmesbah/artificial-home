import type { Metadata } from "next";
import { PageBanner } from "@/components/shop/page-banner";
import { WishlistView } from "@/components/shop/wishlist-view";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageBanner title="My Wishlist" crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <div className="container-x section">
        <WishlistView products={products} categoryNames={Object.fromEntries(categories.map((c) => [c.slug, c.name]))} />
      </div>
    </>
  );
}

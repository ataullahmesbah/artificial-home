import type { Metadata } from "next";
import { PageBanner } from "@/components/shop/page-banner";
import { ShopView } from "@/components/shop/shop-view";
import { readQuery, type SP } from "@/lib/shop/query";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Shop artificial jewellery, bangles, earrings, necklaces, hair accessories and beauty care.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [products, categories, sp] = await Promise.all([getProducts(), getCategories(), searchParams]);
  const initial = readQuery(sp);
  const title = initial.sale ? "On Sale" : initial.isNew ? "New Arrivals" : "Shop All";
  return (
    <>
      <PageBanner title={title} text="Handpicked artificial jewellery and accessories — Cash on Delivery all over Bangladesh." crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <div className="container-x section">
        <ShopView key={JSON.stringify(initial)} products={products} categories={categories} initial={initial} />
      </div>
    </>
  );
}

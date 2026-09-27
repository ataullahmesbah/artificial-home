import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/shop/page-banner";
import { ShopView } from "@/components/shop/shop-view";
import { getCategories, getProducts } from "@/lib/data";
import { readQuery } from "@/lib/shop/query";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = (await getCategories()).find((x) => x.slug === category);
  if (!c) return { title: "Category not found" };
  return { title: c.name, description: c.description || `Shop ${c.name}`, alternates: { canonical: `/shop/${c.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ category }, products, categories, sp] = await Promise.all([params, getProducts(), getCategories(), searchParams]);
  const c = categories.find((x) => x.slug === category);
  if (!c) notFound();
  const initial = { ...readQuery(sp), cat: c.slug };
  return (
    <>
      <PageBanner title={c.name} text={c.description} crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: c.name }]} />
      <div className="container-x section">
        <ShopView key={c.slug + JSON.stringify(initial)} products={products} categories={categories} initial={initial} fixedCategory={c.slug} />
      </div>
    </>
  );
}

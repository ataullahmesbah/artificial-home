import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/site/json-ld";
import { RichText } from "@/components/site/rich-text";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductBuy } from "@/components/shop/product-buy";
import { ProductTabs } from "@/components/shop/product-tabs";
import { ProductRail } from "@/components/shop/product-rail";
import { SectionTitle } from "@/components/shop/section-title";
import { PaymentBadges, enabledPayments } from "@/components/shop/payment-badges";
import { Price, Stars } from "@/components/shop/price";
import { getCategories, getProductBySlug, getProducts, getReviews, getSettings } from "@/lib/data";
import { siteConfig } from "@/config/site";
import { formatPrice, priceOf } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  const img = p.images[0];
  return {
    title: p.name,
    description: `${p.short_description} ${formatPrice(priceOf(p).now)} — Cash on Delivery all over Bangladesh.`.slice(0, 160),
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description: p.short_description, url: `/product/${p.slug}`, images: [{ url: img && !img.endsWith(".svg") ? img : "/opengraph-image" }] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, products, categories, settings, reviews] = await Promise.all([getProductBySlug(slug), getProducts(), getCategories(), getSettings(), getReviews()]);
  if (!product) notFound();
  const category = categories.find((c) => c.slug === product.category_slug);
  const names = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const related = products.filter((p) => p.id !== product.id && p.category_slug === product.category_slug);
  const more = related.length >= 4 ? related : [...related, ...products.filter((p) => p.id !== product.id && p.category_slug !== product.category_slug && p.featured)].slice(0, 8);
  const { now, off } = priceOf(product);
  const productReviews = reviews.filter((r) => r.project_title === product.name);
  const whatsapp = settings.whatsapp_number?.replace(/\D/g, "") || null;

  const perks = [
    { Icon: Truck, text: `Delivery ${formatPrice(settings.delivery_inside)} inside Dhaka, ${formatPrice(settings.delivery_outside)} outside${settings.free_delivery_min ? ` · free over ${formatPrice(settings.free_delivery_min)}` : ""}` },
    { Icon: ShieldCheck, text: "Cash on Delivery available" },
    { Icon: RefreshCcw, text: "Free exchange within 3 days if damaged" },
    { Icon: BadgeCheck, text: "Quality checked before packing" },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.short_description,
          sku: product.sku ?? undefined,
          image: product.images.map((i) => new URL(i, siteConfig.url).toString()),
          category: category?.name,
          aggregateRating: product.review_count ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.review_count } : undefined,
          offers: {
            "@type": "Offer",
            priceCurrency: "BDT",
            price: now,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${siteConfig.url}/product/${product.slug}`,
          },
        }}
      />
      <div className="container-x pt-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-accent-ink">
                Home
              </Link>
            </li>
            <ChevronRight size={14} aria-hidden />
            <li>
              <Link href="/shop" className="hover:text-accent-ink">
                Shop
              </Link>
            </li>
            {category && (
              <>
                <ChevronRight size={14} aria-hidden />
                <li>
                  <Link href={`/shop/${category.slug}`} className="hover:text-accent-ink">
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight size={14} aria-hidden />
            <li aria-current="page" className="text-heading">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <Reveal y={20}>
          <ProductGallery
            images={product.images}
            name={product.name}
            badge={off > 0 ? <span className="chip absolute top-4 left-4 bg-accent text-on-accent">-{off}% OFF</span> : null}
          />
        </Reveal>
        <Reveal y={20} delay={0.1} className="flex flex-col gap-5">
          {category && (
            <Link href={`/shop/${category.slug}`} className="text-[13px] font-bold tracking-[0.18em] text-accent-ink uppercase">
              {category.name}
            </Link>
          )}
          <h1 className="text-[clamp(1.9rem,3.6vw,2.7rem)] leading-tight">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <Stars rating={product.rating} count={product.review_count} size={16} />
            <span className={product.stock > 0 ? "text-sm font-semibold text-emerald-600 dark:text-emerald-400" : "text-sm font-semibold text-accent-ink"}>
              {product.stock > 0 ? "● In stock" : "● Sold out"}
            </span>
            {product.sku && <span className="text-sm text-muted">SKU: {product.sku}</span>}
          </div>
          <Price product={product} big />
          <p className="text-[17px] leading-relaxed">{product.short_description}</p>
          <div className="border-t border-line pt-5">
            <ProductBuy product={product} whatsapp={whatsapp} />
          </div>
          <ul className="grid gap-3 rounded-[22px] bg-surface p-5 text-[15px]">
            {perks.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon size={19} className="mt-0.5 shrink-0 text-accent" aria-hidden /> {text}
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-2 text-sm font-semibold text-heading">Pay with</p>
            <PaymentBadges methods={enabledPayments(settings)} />
          </div>
        </Reveal>
      </section>

      <section className="container-x pb-6">
        <ProductTabs
          tabs={[
            { key: "desc", label: "Description", content: <div className="max-w-[760px]"><RichText content={product.description || product.short_description} /></div> },
            {
              key: "delivery",
              label: "Delivery & Payment",
              content: (
                <div className="grid max-w-[760px] gap-4 text-[16px]">
                  <p>
                    <b className="text-heading">Delivery charge:</b> {formatPrice(settings.delivery_inside)} inside Dhaka · {formatPrice(settings.delivery_outside)} outside Dhaka
                    {settings.free_delivery_min ? ` · Free on orders over ${formatPrice(settings.free_delivery_min)}` : ""}.
                  </p>
                  {settings.delivery_note && (
                    <p>
                      <b className="text-heading">Delivery time:</b> {settings.delivery_note}
                    </p>
                  )}
                  <p>
                    <b className="text-heading">Payment:</b> Cash on Delivery, or pay first with bKash, Nagad, Rocket or Bangla QR and enter your Transaction ID at checkout.
                  </p>
                  <p>
                    <b className="text-heading">Exchange:</b> If your product arrives damaged or different, message us within 3 days with a photo.
                  </p>
                </div>
              ),
            },
            {
              key: "reviews",
              label: `Reviews (${product.review_count})`,
              content: (
                <div className="max-w-[760px]">
                  <div className="flex items-center gap-4">
                    <span className="font-heading text-5xl font-bold text-heading">{product.rating.toFixed(1)}</span>
                    <span>
                      <Stars rating={product.rating} size={18} />
                      <span className="block text-sm text-muted">Based on {product.review_count} reviews</span>
                    </span>
                  </div>
                  <ul className="mt-8 flex flex-col gap-6">
                    {(productReviews.length ? productReviews : reviews.slice(0, 3)).map((r) => (
                      <li key={r.id} className="flex gap-4 border-b border-line pb-6">
                        {r.avatar_url && (
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface">
                            <Image src={r.avatar_url} alt="" fill sizes="48px" className="object-cover" />
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-heading">
                            {r.name} <span className="text-sm font-normal text-muted">· {r.role}</span>
                          </p>
                          <Stars rating={r.rating} size={13} />
                          <p className="mt-2">{r.quote}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            },
          ]}
        />
      </section>

      {more.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionTitle eyebrow="You may also like" title="Complete the *look*" align="left" className="!mb-0" />
            <ProductRail products={more} categoryNames={names} label="Related products" />
          </div>
        </section>
      )}
    </>
  );
}

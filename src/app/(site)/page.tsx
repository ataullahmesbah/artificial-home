import { Fragment } from "react";
import { HeroSlider } from "@/components/shop/hero-slider";
import { TrustBar } from "@/components/shop/trust-bar";
import { CategoryCircles } from "@/components/shop/category-circles";
import { SectionTitle } from "@/components/shop/section-title";
import { FeaturedTabs } from "@/components/shop/featured-tabs";
import { PromoBanner } from "@/components/shop/promo-banner";
import { ProductRail } from "@/components/shop/product-rail";
import { Reviews } from "@/components/shop/reviews";
import { Gallery } from "@/components/shop/gallery";
import { BlogCard } from "@/components/shop/blog-card";
import { Newsletter } from "@/components/shop/newsletter";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/site/json-ld";
import { siteConfig } from "@/config/site";
import { normalizeSections, type SectionKey } from "@/lib/sections";
import { getBanners, getCategories, getPosts, getProducts, getProfile, getReviews, getSettings } from "@/lib/data";

export default async function HomePage() {
  const [settings, profile, banners, categories, products, reviews, posts] = await Promise.all([
    getSettings(),
    getProfile(),
    getBanners(),
    getCategories(),
    getProducts(),
    getReviews(),
    getPosts(),
  ]);
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const counts: Record<string, number> = {};
  for (const p of products) if (p.category_slug) counts[p.category_slug] = (counts[p.category_slug] ?? 0) + 1;
  const newIn = products.filter((p) => p.is_new);
  const instagram = profile.social_links.find((s) => s.platform === "instagram")?.url ?? null;

  const blocks: Partial<Record<SectionKey, React.ReactNode>> = {
    trust: <TrustBar freeMin={settings.free_delivery_min} deliveryNote={settings.delivery_note} />,
    categories: <CategoryCircles categories={categories} counts={counts} />,
    featured: products.length ? (
      <section className="section" aria-labelledby="featured">
        <div className="container-x">
          <SectionTitle eyebrow="Our collection" title="Trending *right now*" />
          <FeaturedTabs products={products} categoryNames={categoryNames} />
        </div>
      </section>
    ) : null,
    promo: (
      <PromoBanner
        kicker={settings.promo_kicker}
        title={settings.promo_title}
        text={settings.promo_text}
        button={settings.promo_button}
        link={settings.promo_link}
        image={settings.promo_image_url}
        endsAt={settings.promo_ends_at}
      />
    ),
    new_arrivals: newIn.length ? (
      <section className="section pt-0" aria-labelledby="new-in">
        <div className="container-x">
          <SectionTitle eyebrow="Just landed" title="New *arrivals*" align="left" className="!mb-0" />
          <ProductRail products={newIn} categoryNames={categoryNames} label="New arrivals" />
        </div>
      </section>
    ) : null,
    reviews: <Reviews reviews={reviews} />,
    gallery: <Gallery images={settings.gallery_images} instagram={instagram} />,
    blog: posts.length ? (
      <section className="section" aria-labelledby="blog-home">
        <div className="container-x">
          <SectionTitle eyebrow="From the blog" title="Style tips & *stories*" />
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <StaggerItem key={p.id}>
                <BlogCard post={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    ) : null,
    newsletter: <Newsletter />,
  };
  const order = normalizeSections(settings.sections).filter((s) => s.visible && blocks[s.key]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: settings.website_name,
          description: settings.seo_description,
          url: siteConfig.url,
          email: settings.contact_email,
          ...(settings.public_phone ? { telephone: settings.public_phone } : {}),
          address: { "@type": "PostalAddress", streetAddress: profile.location, addressCountry: "BD" },
          currenciesAccepted: "BDT",
          paymentAccepted: "Cash, bKash, Nagad, Rocket, Bangla QR",
          sameAs: profile.social_links.map((s) => s.url),
        }}
      />
      <HeroSlider banners={banners} />
      {order.map((s) => (
        <Fragment key={s.key}>{blocks[s.key]}</Fragment>
      ))}
    </>
  );
}

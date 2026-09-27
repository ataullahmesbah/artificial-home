import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Gem, HeartHandshake, PackageCheck, Sparkles } from "lucide-react";
import { ClipReveal, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { PageBanner } from "@/components/shop/page-banner";
import { getProducts, getProfile, getReviews, getSettings } from "@/lib/data";
import { isSectionVisible } from "@/lib/sections";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  return { title: "Our Story", description: p.short_intro, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const [settings, profile, products, reviews] = await Promise.all([getSettings(), getProfile(), getProducts(), getReviews()]);
  if (!isSectionVisible(settings.sections, "about")) notFound();
  const paragraphs = profile.bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const sold = products.reduce((n, p) => n + p.review_count, 0);
  const stats = [
    { value: `${products.length}+`, label: "Designs in stock" },
    { value: `${Math.max(sold, 100)}+`, label: "Happy customers" },
    { value: "64", label: "Districts delivered" },
    { value: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0", label: "Average rating" },
  ];
  const values = [
    { Icon: Gem, title: "Handpicked designs", text: "Every piece is chosen for quality, comfort and style." },
    { Icon: PackageCheck, title: "Checked & packed with love", text: "We check each item by hand and pack it in a gift pouch." },
    { Icon: HeartHandshake, title: "Real people, real help", text: "Message us any time on WhatsApp or Messenger." },
    { Icon: Sparkles, title: "Affordable luxury", text: "Look your best without spending a fortune." },
  ];
  return (
    <>
      <PageBanner title="Our Story" text={profile.short_intro} crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <section className="section">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ClipReveal className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-surface">
            {profile.about_image_url && <Image src={profile.about_image_url} alt={`${profile.full_name} in the studio`} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />}
          </ClipReveal>
          <Reveal>
            <p className="eyebrow">Meet the founder</p>
            <h2 className="h-section mt-3">
              Hi, I&rsquo;m <em>{profile.full_name.split(" ")[0]}</em>
            </h2>
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-6 font-heading text-2xl text-accent-ink italic">— {profile.full_name}</p>
            <p className="text-sm text-muted">{profile.professional_title}</p>
            <Link href="/shop" className="btn btn-primary mt-8">
              Shop the Collection <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface/60 py-14">
        <Stagger className="container-x grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <CountUp value={s.value} className="block font-heading text-[clamp(2.2rem,4vw,3rem)] font-bold text-accent-ink" />
              <span className="mt-1 block font-semibold text-heading">{s.label}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal className="mx-auto mb-12 max-w-[600px] text-center">
            <p className="eyebrow">Why girls love us</p>
            <h2 className="h-section mt-3">
              What makes us <em>different</em>
            </h2>
          </Reveal>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="card h-full !rounded-[24px] p-7 text-center transition-transform duration-500 hover:-translate-y-2">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-5 text-xl">{title}</h3>
                  <p className="mt-2 text-[15px]">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

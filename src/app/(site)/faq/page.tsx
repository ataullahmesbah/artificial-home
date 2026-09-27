import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { PageBanner } from "@/components/shop/page-banner";
import { FaqList } from "@/components/shop/faq-list";
import { getFaqs, getSettings } from "@/lib/data";
import { isSectionVisible } from "@/lib/sections";

export const metadata: Metadata = { title: "FAQ", description: "Delivery, payment, exchange and product care questions answered.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const [settings, faqs] = await Promise.all([getSettings(), getFaqs()]);
  if (!isSectionVisible(settings.sections, "faq")) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
        }}
      />
      <PageBanner title="Questions & Answers" text="Everything about ordering, delivery, payment and exchanges." crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      <div className="container-x section">
        <div className="mx-auto max-w-[820px]">
          <FaqList faqs={faqs} />
          <p className="mt-10 text-center">
            Still have a question?{" "}
            <Link href="/contact" className="font-semibold text-accent-ink hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

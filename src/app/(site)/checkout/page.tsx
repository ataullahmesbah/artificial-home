import type { Metadata } from "next";
import { PageBanner } from "@/components/shop/page-banner";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { enabledPayments } from "@/components/shop/payment-badges";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const s = await getSettings();
  return (
    <>
      <PageBanner title="Checkout" crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <div className="container-x section">
        <CheckoutForm
          methods={enabledPayments(s)}
          numbers={{ bkash: s.bkash_number, nagad: s.nagad_number, rocket: s.rocket_number }}
          qr={s.payment_qr_url}
          note={s.payment_note}
          inside={s.delivery_inside}
          outside={s.delivery_outside}
          freeMin={s.free_delivery_min}
        />
      </div>
    </>
  );
}

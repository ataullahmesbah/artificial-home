import type { Metadata } from "next";
import { PageBanner } from "@/components/shop/page-banner";
import { TrackForm } from "@/components/shop/track-form";

export const metadata: Metadata = { title: "Track Your Order", description: "Check the status of your order with your order number and phone number.", alternates: { canonical: "/track" } };

export default function TrackPage() {
  return (
    <>
      <PageBanner title="Track Your Order" text="Enter the order number from your confirmation and the phone number you used." crumbs={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <div className="container-x section">
        <TrackForm />
      </div>
    </>
  );
}

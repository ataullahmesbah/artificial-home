import { BadgeCheck, HandCoins, RefreshCcw, Truck } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatPrice } from "@/lib/utils";

export function TrustBar({ freeMin, deliveryNote }: { freeMin: number; deliveryNote: string }) {
  const items = [
    { Icon: Truck, title: freeMin > 0 ? `Free delivery over ${formatPrice(freeMin)}` : "Fast delivery", text: deliveryNote || "All over Bangladesh" },
    { Icon: HandCoins, title: "Cash on Delivery", text: "Pay when you receive" },
    { Icon: RefreshCcw, title: "Easy exchange", text: "Within 3 days if damaged" },
    { Icon: BadgeCheck, title: "Quality checked", text: "Every piece checked by hand" },
  ];
  return (
    <section aria-label="Why shop with us" className="border-y border-line bg-surface/60">
      <Stagger className="container-x grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4">
        {items.map(({ Icon, title, text }) => (
          <StaggerItem key={title} className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-card text-accent shadow-sm">
              <Icon size={22} aria-hidden />
            </span>
            <span>
              <span className="block text-[15px] leading-snug font-semibold text-heading">{title}</span>
              <span className="block text-[13px] text-muted">{text}</span>
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

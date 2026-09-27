import { cn, formatPrice, priceOf } from "@/lib/utils";

export function Price({ product, className, big = false }: { product: { price: number; sale_price: number | null }; className?: string; big?: boolean }) {
  const { now, was } = priceOf(product);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-bold text-heading", big ? "text-3xl" : "text-[17px]")}>{formatPrice(now)}</span>
      {was !== null && (
        <span className={cn("text-muted line-through", big ? "text-lg" : "text-sm")}>
          <span className="sr-only">Was </span>
          {formatPrice(was)}
        </span>
      )}
    </span>
  );
}

export function Stars({ rating, count, size = 14 }: { rating: number; count?: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${rating} out of 5 stars${count ? `, ${count} reviews` : ""}`}>
      <span className="flex text-[#f5a623]" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < full ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
          </svg>
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </span>
  );
}

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-gradient-to-br from-[#fdeef2] to-[#f7e9ff] px-5 text-center dark:from-[#2a1720] dark:to-[#221a2b]">
      <div>
        <p className="eyebrow justify-center">Page not found</p>
        <h1 className="mt-4 font-heading text-[clamp(5rem,18vw,10rem)] leading-none italic text-accent-ink">404</h1>
        <p className="mt-4 text-lg">Oops! This page slipped away like a lost earring.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-outline">
            <ArrowLeft size={18} /> Home
          </Link>
          <Link href="/shop" className="btn btn-primary">
            <ShoppingBag size={18} /> Shop Now
          </Link>
        </div>
      </div>
    </main>
  );
}

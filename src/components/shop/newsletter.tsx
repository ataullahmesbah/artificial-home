"use client";
import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { subscribe, type SubscribeState } from "@/actions/shop";

export function Newsletter() {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, {});
  return (
    <section className="section" aria-labelledby="news-title">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-[#2b1520] px-6 py-14 text-center text-white sm:px-12 dark:bg-[#2a1520]">
          <div aria-hidden className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div aria-hidden className="absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-accent-2/30 blur-3xl" />
          <p className="eyebrow relative !text-accent-2">Join our club</p>
          <h2 id="news-title" className="relative mt-3 text-[clamp(1.8rem,3.6vw,2.6rem)] !text-white">
            Get <em className="text-accent-2">10% off</em> your first order
          </h2>
          <p className="relative mx-auto mt-3 max-w-[480px] text-white/75">New arrivals, secret sales and styling tips — straight to your inbox. No spam, ever.</p>
          <form action={action} className="relative mx-auto mt-8 flex max-w-[480px] flex-col gap-3 sm:flex-row">
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <input id="nl-email" name="email" type="email" required placeholder="Your email address" className="min-h-[50px] flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-white outline-none placeholder:text-white/60 focus:border-accent-2" />
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Send size={17} aria-hidden />} Subscribe
            </button>
          </form>
          {state.message && (
            <p role="status" className={`relative mt-4 text-sm ${state.ok ? "text-emerald-300" : "text-rose-200"}`}>
              {state.message}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

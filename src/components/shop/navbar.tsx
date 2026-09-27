"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/shop/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cartDrawer, useCart, useWishlist } from "@/lib/shop/store";
import type { NavItem } from "@/lib/sections";
import type { Category } from "@/types/content";
import { cn } from "@/lib/utils";

type Props = { name: string; logo: string | null; categories: Category[]; nav: NavItem[] };

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return <span className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">{n > 99 ? "99+" : n}</span>;
}

export function Navbar({ name, logo, categories, nav }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const wish = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMenu(false);
    setMega(false);
    setSearch(false);
  }, [pathname]);
  useEffect(() => {
    if (search) searchRef.current?.focus();
  }, [search]);
  useEffect(() => {
    if (!menu && !search) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    if (menu) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menu, search]);

  const links = [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "New In", href: "/shop?new=1" }, { label: "Sale", href: "/shop?sale=1" }, ...nav];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("?") && pathname.startsWith(href));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className={cn("sticky top-0 z-50 border-b transition-all duration-300", scrolled ? "border-line bg-[var(--header-bg)] shadow-[0_10px_30px_-20px_rgba(122,31,53,.35)] backdrop-blur-xl" : "border-transparent bg-bg")}>
      <div className="container-x flex h-[76px] items-center gap-4">
        <button type="button" onClick={() => setMenu(true)} className="grid h-10 w-10 place-items-center rounded-full text-heading lg:hidden" aria-label="Open menu" aria-expanded={menu}>
          <Menu size={22} />
        </button>
        <Logo name={name} logo={logo} className="max-lg:mx-auto" />

        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) =>
              l.label === "Shop" ? (
                <li key={l.href} className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
                  <Link
                    href={l.href}
                    className={cn("flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium transition-colors", isActive(l.href) ? "text-accent-ink" : "text-heading hover:text-accent-ink")}
                    aria-expanded={mega}
                    onFocus={() => setMega(true)}
                  >
                    Shop <ChevronDown size={15} className={cn("transition-transform", mega && "rotate-180")} />
                  </Link>
                  <AnimatePresence>
                    {mega && categories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 w-[640px] -translate-x-1/2 pt-3"
                        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setMega(false)}
                      >
                        <div className="grid grid-cols-4 gap-3 rounded-[24px] border border-line bg-card p-5 shadow-[var(--shadow)]">
                          {categories.map((c) => (
                            <Link key={c.id} href={`/shop/${c.slug}`} className="group flex flex-col items-center gap-2 rounded-2xl p-2 text-center hover:bg-surface">
                              <span className="relative h-16 w-16 overflow-hidden rounded-full bg-surface">
                                {c.image_url && <Image src={c.image_url} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-110" />}
                              </span>
                              <span className="text-sm font-semibold text-heading group-hover:text-accent-ink">{c.name}</span>
                            </Link>
                          ))}
                          <Link href="/shop" className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-accent/10 p-2 text-center text-sm font-bold text-accent-ink hover:bg-accent/15">
                            View all →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ) : (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                      l.label === "Sale" ? "text-accent-ink hover:text-accent" : isActive(l.href) ? "text-accent-ink" : "text-heading hover:text-accent-ink"
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => setSearch((s) => !s)} className="grid h-10 w-10 place-items-center rounded-full text-heading hover:bg-surface" aria-label="Search" aria-expanded={search}>
            <Search size={20} />
          </button>
          <ThemeToggle className="!hidden !h-10 !w-10 !border-0 text-heading hover:!bg-surface hover:!text-accent-ink sm:!grid" />
          <Link href="/wishlist" className="relative hidden h-10 w-10 place-items-center rounded-full text-heading hover:bg-surface sm:grid" aria-label={`Wishlist (${wish.length})`}>
            <Heart size={20} />
            <Badge n={wish.length} />
          </Link>
          <button type="button" onClick={cartDrawer.open} className="relative grid h-10 w-10 place-items-center rounded-full text-heading hover:bg-surface" aria-label={`Cart (${count})`}>
            <ShoppingBag size={20} />
            <Badge n={count} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {search && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line bg-bg">
            <form onSubmit={submit} role="search" className="container-x flex items-center gap-3 py-4">
              <Search size={20} className="text-muted" aria-hidden />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                ref={searchRef}
                id="site-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jhumka, bangles, pearl clips…"
                className="min-w-0 flex-1 bg-transparent text-lg text-heading outline-none placeholder:text-muted"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} aria-hidden />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(340px,88vw)] flex-col overflow-y-auto bg-bg px-6 py-6 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between">
                <Logo name={name} logo={logo} />
                <button type="button" onClick={() => setMenu(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label="Close menu" autoFocus>
                  <X size={22} />
                </button>
              </div>
              <ul className="mt-8 flex flex-col">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={cn("block border-b border-line py-3.5 font-heading text-xl", isActive(l.href) ? "text-accent-ink" : "text-heading")}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/wishlist" className="block border-b border-line py-3.5 font-heading text-xl text-heading">
                    Wishlist ({wish.length})
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="block border-b border-line py-3.5 font-heading text-xl text-heading">
                    Track Order
                  </Link>
                </li>
              </ul>
              {categories.length > 0 && (
                <>
                  <p className="mt-8 text-xs font-bold tracking-[0.2em] text-muted uppercase">Categories</p>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {categories.map((c) => (
                      <Link key={c.id} href={`/shop/${c.slug}`} className="flex flex-col items-center gap-1.5 text-center">
                        <span className="relative h-16 w-16 overflow-hidden rounded-full bg-surface">{c.image_url && <Image src={c.image_url} alt="" fill sizes="64px" className="object-cover" />}</span>
                        <span className="text-xs font-semibold text-heading">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-8 flex items-center gap-3">
                <ThemeToggle className="text-heading" />
                <span className="text-sm">Light / dark</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

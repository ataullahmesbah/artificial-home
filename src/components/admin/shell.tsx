"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Gem,
  HelpCircle,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Mail,
  MailPlus,
  Menu,
  MessageSquareQuote,
  Settings,
  ShoppingCart,
  Store,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/actions/admin";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Shop",
    items: [
      { href: "/admin", label: "Overview", Icon: LayoutDashboard },
      { href: "/admin/orders", label: "Orders", Icon: ShoppingCart, badge: "orders" as const },
      { href: "/admin/messages", label: "Messages", Icon: Mail, badge: "messages" as const },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", Icon: Gem },
      { href: "/admin/categories", label: "Categories", Icon: LayoutGrid },
      { href: "/admin/banners", label: "Hero banners", Icon: Images },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/reviews", label: "Reviews", Icon: MessageSquareQuote },
      { href: "/admin/faqs", label: "FAQ", Icon: HelpCircle },
      { href: "/admin/blog", label: "Blog", Icon: BookOpen },
      { href: "/admin/subscribers", label: "Newsletter", Icon: MailPlus },
      { href: "/admin/profile", label: "Our story", Icon: Store },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", Icon: Settings },
      { href: "/admin/account", label: "My account", Icon: UserCog },
      { href: "/admin/support", label: "Support", Icon: LifeBuoy },
    ],
  },
];

type Props = {
  children: React.ReactNode;
  siteName: string;
  logo: string;
  user: { name: string; email: string; avatar: string | null; role: string };
  badges: { messages: number; orders: number };
};

export function AdminShell({ children, siteName, logo, user, badges }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("admin-sidebar") === "collapsed");
    } catch {}
  }, []);
  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem("admin-sidebar", c ? "expanded" : "collapsed");
      } catch {}
      return !c;
    });
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (compact: boolean) => (
    <nav aria-label="Dashboard" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {groups.map((g) => (
        <div key={g.label}>
          {!compact && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">{g.label}</p>}
          <ul className="space-y-1">
            {g.items.map(({ href, label, Icon, ...rest }) => (
              <li key={href}>
                <Link
                  href={href}
                  title={compact ? label : undefined}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    compact && "justify-center",
                    isActive(href) ? "bg-accent/10 text-accent-ink" : "text-text hover:bg-[var(--bg)] hover:text-heading"
                  )}
                >
                  <Icon size={18} aria-hidden className="shrink-0" />
                  {!compact && <span className="flex-1">{label}</span>}
                  {"badge" in rest && rest.badge && badges[rest.badge] > 0 && (
                    <span className={cn("rounded-full bg-accent px-1.5 text-[11px] font-semibold text-on-accent", compact && "absolute ml-6 -mt-5")}>{badges[rest.badge]}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (compact: boolean) => (
    <Link href="/admin" className={cn("flex items-center gap-3 px-5", compact && "justify-center px-0")}>
      <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line">
        <Image src={logo} alt="" fill sizes="36px" className="object-cover object-top" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate font-heading text-sm font-semibold text-heading">{siteName}</span>
          <span className="block text-[11px] text-muted">Dashboard</span>
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-[var(--card-to)] transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-[260px]"
        )}
      >
        <div className="flex h-16 items-center border-b border-line">{brand(collapsed)}</div>
        {nav(collapsed)}
        <div className="space-y-1 border-t border-line p-3">
          <a href="/" target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text hover:bg-[var(--bg)]", collapsed && "justify-center")}>
            <ExternalLink size={18} aria-hidden /> {!collapsed && "View website"}
          </a>
          <button type="button" onClick={toggleCollapsed} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-[var(--bg)]", collapsed && "justify-center")} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />} {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[var(--card-to)] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line pr-3">
                {brand(false)}
                <button type="button" onClick={() => setDrawer(false)} className="rounded-lg p-2 hover:bg-[var(--bg)]" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              {nav(false)}
              <a href="/" target="_blank" rel="noopener noreferrer" className="m-3 flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm font-medium">
                <ExternalLink size={18} /> View website
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]")}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-[var(--header-bg)] px-4 backdrop-blur-md sm:px-6">
          <button type="button" onClick={() => setDrawer(true)} className="rounded-lg p-2 hover:bg-[var(--card-to)] lg:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <p className="hidden truncate text-sm text-muted sm:block">
            <span className="font-medium text-heading">{siteName}</span> · Shop dashboard
          </p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-medium text-heading hover:bg-[var(--card-to)] md:inline-flex">
              <ExternalLink size={15} /> Website
            </a>
            <ThemeToggle className="!h-10 !w-10 !shadow-none" />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 hover:bg-[var(--card-to)]"
              >
                <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-on-accent">
                  {user.avatar ? <Image src={user.avatar} alt="" fill sizes="36px" className="object-cover" /> : user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight text-heading">{user.name}</span>
                  <span className="block text-[11px] capitalize leading-tight text-muted">{user.role}</span>
                </span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-[var(--card-to)] shadow-xl"
                  >
                    <div className="border-b border-line px-4 py-3">
                      <p className="text-sm font-medium text-heading">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <p className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium capitalize text-accent-ink">{user.role}</p>
                    </div>
                    <div className="p-1.5">
                      <Link role="menuitem" href="/admin/account" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-[var(--bg)]">
                        <UserCog size={16} /> Account & password
                      </Link>
                      <Link role="menuitem" href="/admin/settings" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-[var(--bg)]">
                        <Settings size={16} /> Shop settings
                      </Link>
                      <form action={signOut}>
                        <button role="menuitem" type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10">
                          <LogOut size={16} /> Log out
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

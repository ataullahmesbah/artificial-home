# Artificial Home — Online Shop (Website 05)

A modern, feminine **online shop** for artificial jewellery, fashion accessories and beauty care — made for Bangladesh:
prices in Taka (৳), **Cash on Delivery**, **bKash / Nagad / Rocket / Bangla QR** payments, delivery charges inside / outside Dhaka,
order tracking and a full admin dashboard. Light and dark themes, responsive from 320px up, SEO-ready.
Each installation is standalone: one codebase, one Supabase project and one Vercel deployment per client.

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + design tokens (rose + rose-gold), Playfair Display + DM Sans |
| **Motion** | Framer Motion + CSS keyframes (respects `prefers-reduced-motion`) |
| **Data / Auth / Media** | Supabase Postgres + Auth + Storage, protected by Row Level Security |
| **Hosting** | Vercel (+ daily keep-alive cron) |
| **Validation** | Zod on the server, and again inside the database for orders |

---

## 1. Features

### Shop (public website)
- **Top navbar** with a Shop mega-menu (category pictures), search, light/dark switch, wishlist and cart counters; slide-in menu on phones.
- **Announcement bar** (sliding offers), floating **WhatsApp** button and an animated mouse circle (computers only, can be turned off).
- **Home**: hero slider (admin banners), trust bar, round category pictures, product tabs (Best sellers / New in / On sale), offer banner with **live countdown**, new-arrivals slider, customer reviews, Instagram gallery, blog and newsletter — every block can be hidden or reordered in Settings.
- **Shop** (`/shop`, `/shop/[category]`): search, category, price range, on sale / new / in stock filters and sorting — instant, with shareable URLs.
- **Product page**: picture gallery with zoom, colour picker, quantity, Add to cart, **Buy now**, wishlist, **Order on WhatsApp**, delivery & payment info, reviews tab, related products, Product JSON-LD.
- **Quick view** pop-up on every product card, **cart drawer** with a free-delivery progress bar, cart page and **wishlist** (saved in the browser).
- **Checkout**: name, mobile, address, city, delivery area (charge added automatically), note and payment:
  - **Cash on Delivery**
  - **bKash / Nagad / Rocket**: the shop's number with a copy button and step-by-step instructions; the customer enters the number they paid from and the **Transaction ID**
  - **Bangla QR**: the shop's QR picture + Transaction ID
- **Order confirmation** page with the order number and a WhatsApp confirm button; **Track order** page (order number + phone).
- **Our Story**, **Blog**, **FAQ** (FAQPage JSON-LD) and **Contact** (map, contact cards, form) pages.

### Orders are safe
Orders are created only by the database function `place_order()`. It reads the **real prices** from the products table, checks stock,
adds the delivery charge from Settings, reduces the stock and returns the order number. Visitors can never change a price or a total,
cannot read other people's orders, and there are limits against order spam.

### Admin dashboard (`/admin`)
- **Overview**: new orders, orders on the way, sales in the last 30 days, low-stock warnings, latest orders.
- **Orders**: filter by status, search by order number / phone / name, order details (items, customer, payment + Transaction ID),
  change status (Pending → Confirmed → Shipped → Delivered / Cancelled), mark payment Paid, private notes, WhatsApp the customer.
  **Cancelling puts the items back in stock.**
- **Products**: pictures (drag to reorder), price, sale price, stock, colours, category, badge, best seller / new toggles, duplicate.
- **Categories**, **Hero banners**, **Reviews**, **FAQ**, **Blog**, **Newsletter** subscribers (copy all emails), **Our story**, **Messages**.
- **Settings**: shop name, logo, colours, theme, announcement, WhatsApp number, delivery charges and free-delivery amount, order number prefix,
  payment numbers + Bangla QR picture, offer banner + countdown, Instagram gallery, map, page sections, SEO.
- **My account** and a protected **Support** page (see §7).

> **Demo mode:** if the Supabase environment variables are empty, the shop runs on the built-in demo content in `src/data/demo.ts`
> (orders show a demo confirmation and are not saved). The dashboard then shows setup instructions instead.

---

## 2. Local development

Requirements: Node.js 20.9+ (22 recommended).

```bash
npm install
cp .env.example .env.local      # fill in values (or leave Supabase empty for demo mode)
npm run dev                     # http://localhost:3000
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm run seed:generate` | Regenerate `supabase/seed.sql` from `src/data/demo.ts` |
| `npm run schema:sql -- site05` | Build one SQL file that installs this website into its own schema (multi-website setup) |
| `npm run assets:generate` | Regenerate the demo SVG visuals in `public/demo` |

---

## 3. Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | Production URL, e.g. `https://artificialhome.com`. Used for canonical URLs, the sitemap and Open Graph. |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ (for the dashboard) | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ (for the dashboard) | The **anon / publishable** key. It is safe in the browser because RLS protects all data. |
| `NEXT_PUBLIC_SUPABASE_SCHEMA` | optional | Only for the multi-website demo setup (see “One Supabase project, many websites”). Leave empty for client installs. |
| `CRON_SECRET` | recommended | Protects the daily keep-alive cron (`/api/keep-alive`) |
| `SUPPORT_*` | optional | Overrides for the protected support page (see §7) |

**Never** add the Supabase `service_role` key to this project. It is not needed, and it must never reach the browser.

---

## 4. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com), one per client (region: Singapore for Bangladesh).
2. **SQL Editor** → run these files **in order**, one at a time:
   `supabase/migrations/0001_init.sql` → `0002_hardening.sql` → `0003_awards_sections.sql` → `0004_shop.sql`.
   They create all tables, RLS policies, the `portfolio-media` storage bucket, and the shop (products, orders, `place_order()` …).
3. **SQL Editor** → run `supabase/seed.sql` to load the demo products. Running it again replaces the shop content (orders, messages, subscribers and admins are kept).
4. **Authentication → Users → Add user**: create the owner (email + password, auto-confirm).
5. Make that user the dashboard owner:

   ```sql
   insert into public.admins (user_id, display_name)
   select id, 'Shop Owner' from auth.users where email = 'owner@example.com'
   on conflict (user_id) do update set active = true;
   ```

6. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
7. **Authentication → URL Configuration**: Site URL = your domain; Redirect URLs: add `https://YOUR-DOMAIN/admin/auth/callback`.
8. In the dashboard: **Settings** → your WhatsApp number, delivery charges, bKash / Nagad / Rocket numbers and Bangla QR, then replace the demo products.

Recommended (Authentication → Policies / Passwords): minimum password length 10+ and **leaked password protection** on.

---

## One Supabase project, many websites (demo / event setup)

Supabase's free plan allows only 2 active projects. For demos and events you can run **many websites from ONE free project**.
Each website gets its own Postgres *schema* (`site01`, `site02`, …) with its own data, admins and storage bucket.
Normal client installs don't need this: leave `NEXT_PUBLIC_SUPABASE_SCHEMA` empty and follow §4.

1. Pick a unique name for this website, for example `site05`.
2. Generate the ready-made SQL file:
   ```bash
   npm run schema:sql -- site05
   ```
   This creates `supabase/schemas/site05.sql` (all migrations + demo content, installed into schema `site05`, with bucket `site05-media`).
3. Supabase → **SQL Editor** → paste the whole file → **Run**. Run it **only once**. Running it again later replaces all content of this website with the demo content (messages and admins stay).
4. Supabase → **Project Settings → Data API → Exposed schemas** → add `site05` → **Save**. Without this step the website cannot read its data.
5. Make your user the owner of this website (create the user once in Authentication → Users; one user can own several websites):
   ```sql
   insert into site05.admins (user_id, display_name)
   select id, 'Owner Name' from auth.users where email = 'owner@example.com'
   on conflict (user_id) do update set active = true;
   ```
6. Website env (`.env.local` and Vercel): the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for every website, plus
   `NEXT_PUBLIC_SUPABASE_SCHEMA=site05`.
7. Supabase → **Authentication → URL Configuration → Redirect URLs**: add `https://THIS-WEBSITE/admin/auth/callback` for every website.

Repeat with other names (`site05`, `site06`, …) for the other websites. Websites 01, 03, 04 and 05 can all live in the same project.
Notes: all websites share the project's free limits (500 MB database, 1 GB storage), and a free project pauses after 7 days without activity — open the dashboard before an event to make sure it is **Active**.

---

## 5. Deployment (Vercel)

1. Push this repository to GitHub and import it in Vercel. The framework is detected automatically.
2. Add the environment variables from §3 for Production (and Preview).
3. Deploy, then add the custom domain. Vercel provisions HTTPS automatically.
4. Update `NEXT_PUBLIC_SITE_URL` and the Supabase redirect URLs to the final domain, then redeploy.

Uploaded media lives in Supabase Storage, not on Vercel, so it survives every redeploy.
Content edits appear on the public site immediately, because the dashboard revalidates the cached pages when you save.


### Keep a free Supabase project awake (automatic)
Free Supabase projects pause after 7 days without activity. This project includes a daily **Vercel Cron** (`vercel.json` → `/api/keep-alive`) that runs one tiny read query every day, so the database stays active without anyone logging in.
- It starts automatically after you deploy to Vercel (Vercel → Project → **Settings → Cron Jobs** shows it).
- Recommended: add `CRON_SECRET` (any long random text) in Vercel → Settings → Environment Variables, then redeploy. Only Vercel's cron can then call the route.
- Before an important event, still open the Supabase dashboard once and check the project says **Active**. A paused project must be restored from the dashboard.

---

## 6. Admin login & roles

- Dashboard: `https://YOUR-DOMAIN/admin` (it is excluded from search engines and `robots.txt`).
- This build uses a **single Owner role**. Every user in the `admins` table with `active = true` has full content access.
  - To add a second person, create them in Supabase Auth and insert them into `admins`.
  - To remove access, set `active = false` or delete the row. A deactivated user is rejected by the server on their next request.
- Security is enforced in three layers:
  1. `src/proxy.ts` redirects signed-out visitors away from `/admin`.
  2. Every page and server action verifies the session and the admin row on the server (`requireAdmin` / `assertAdmin`).
  3. Postgres **RLS** allows writes only when `public.is_admin()` is true. Hiding a button is never the protection.

---

## 7. Protected support page

`/admin/support` shows your company's contact details: WhatsApp, Messenger, phone, email, and website.
The client **cannot edit or delete** it. There is no table, form, or server action for it.

Set the values before handover, either:
- in `src/config/support.ts`, or
- through the `SUPPORT_COMPANY_NAME`, `SUPPORT_PHONE`, `SUPPORT_WHATSAPP_URL`, `SUPPORT_MESSENGER_URL`, `SUPPORT_EMAIL`, and `SUPPORT_WEBSITE_URL` environment variables in Vercel.

---

## 8. Media handling

- Uploads go from the dashboard straight to the Supabase Storage bucket `portfolio-media`, into folders such as `products/`, `banners/`, `categories/` and `payments/`.
- Allowed files: JPG, PNG, WebP, and AVIF images, plus PDF. The limit is 5 MB, enforced both in the browser and by the bucket itself.
- File names are random UUIDs; the original filename is never used.
- The server only accepts media URLs that point to this project's bucket or to local `/demo/` assets.
- `next/image` serves optimised AVIF/WebP at responsive sizes. The Supabase hostname is whitelisted in `next.config.ts` from `NEXT_PUBLIC_SUPABASE_URL`.

Demo pictures in `public/demo` are purpose-made SVG illustrations of jewellery and cosmetics. Replace them with real product photos before launch (square photos look best).

---

## 9. Project structure

```
src/
  app/
    (site)/            shop: home, shop, shop/[category], product/[slug], cart, checkout, order/success,
                       track, wishlist, about, blog, blog/[slug], faq, contact
    admin/(dashboard)/ overview, orders, orders/[id], subscribers, profile, settings, account, messages, support,
                       [resource] (products, categories, banners, reviews, faqs, blog)
    api/keep-alive/    daily Vercel Cron target
  actions/             server actions: shop.ts (orders, tracking, newsletter), contact.ts, admin.ts
  components/
    shop/              navbar, footer, product card, quick view, cart drawer, checkout, sliders …
    admin/             dashboard UI (shell, generic form/table, orders)
    motion/            reveal, stagger, clip reveal, count-up
  data/demo.ts         demo content (source of seed.sql)
  lib/shop/store.ts    cart + wishlist (browser storage)
  lib/                 supabase clients, auth guards, data layer, admin schema, utils
supabase/
  migrations/0001_init.sql … 0004_shop.sql
  seed.sql
scripts/               demo pictures, seed and multi-site SQL generators
```

---

## 10. Security checklist

- [x] RLS enabled on every table. Visitors can read published content, send messages, subscribe, and place / track orders only through database functions.
- [x] Order totals are calculated in the database from real prices; stock is checked and reserved in the same transaction.
- [x] The service-role key is never used.
- [x] Server-side role check on every mutation, plus Zod validation.
- [x] Login, password reset, and contact form are rate limited. Login errors are generic and never reveal whether an account exists.
- [x] No `dangerouslySetInnerHTML` with user content. Blog content is rendered as plain React text; JSON-LD is escaped.
- [x] Security headers: `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS.
- [x] Contact form spam is also capped inside the database (30 messages per 10 minutes overall, 3 per email per hour), so calling the API directly cannot flood the inbox.
- [x] Storage files can be viewed by URL but not listed publicly. Only safe image types and PDF are accepted (no SVG/HTML uploads).
- [x] Deactivated admins are signed out of the dashboard on their next request.
- [x] Uploaded images are deleted only when no other record still uses them.
- [x] The admin area sends `noindex` and `no-store`.

---

## 11. Handover checklist

- [ ] Replace the demo products, categories, banners and pictures with the shop's own.
- [ ] Settings: WhatsApp number, delivery charges, payment numbers, Bangla QR picture, order prefix.
- [ ] Set the support details (§7) and `NEXT_PUBLIC_SITE_URL`.
- [ ] Create the owner account (§4, steps 4–5) and send the login URL.
- [ ] Turn off public sign-ups in Supabase.
- [ ] Confirm all migrations (`0001` → `0004`) ran, in order.
- [ ] Place a test order (COD and bKash), open it in Admin → Orders, cancel it and check the stock comes back.
- [ ] Test the contact form, newsletter, an image upload and a password reset on production.
# artificial-home

/**
 * DEMO CONTENT
 * Used when Supabase is not configured, and mirrored by supabase/seed.sql.
 * Everything here is placeholder content meant to be replaced by the shop
 * owner from the admin dashboard. Product pictures are generated
 * illustrations (scripts/generate-demo-assets.mjs).
 */
import type { Banner, BlogPost, Category, ColorOption, Faq, Product, Profile, SiteSettings, Testimonial } from "@/types/content";

export const demoSettings: SiteSettings = {
  website_name: "Artificial Home",
  logo_url: null,
  accent_color: "#e0457b",
  accent_color_2: "#c9956b",
  default_theme: "light",
  contact_email: "hello@artificialhome.demo",
  public_phone: "+880 1712-345678",
  seo_title: "Artificial Home — Artificial Jewellery & Accessories in Bangladesh",
  seo_description:
    "Shop trendy artificial jewellery, bangles, earrings, necklaces, hair clips and beauty care. Cash on Delivery and bKash, Nagad, Rocket all over Bangladesh.",
  footer_text: "Trendy artificial jewellery, hair accessories and beauty care — made for every girl, delivered all over Bangladesh.",
  hire_label: "Shop Now",
  sections: [],
  announcement: "Free delivery on orders over ৳2,000 · Cash on Delivery all over Bangladesh",
  whatsapp_number: "8801712345678",
  delivery_inside: 60,
  delivery_outside: 120,
  free_delivery_min: 2000,
  delivery_note: "Inside Dhaka: 1–2 days · Outside Dhaka: 2–4 days",
  order_prefix: "AH",
  cod_enabled: true,
  bkash_number: "01712-345678",
  nagad_number: "01812-345678",
  rocket_number: "01912-3456789",
  payment_qr_url: "/demo/payment-qr.svg",
  payment_note: "Use Send Money for the total amount, then enter the number you paid from and the Transaction ID.",
  promo_kicker: "Limited time offer",
  promo_title: "Festive Sale — Up to 40% Off",
  promo_text: "Bridal sets, jhumkas, bangles and more. New designs added every week.",
  promo_button: "Shop the Sale",
  promo_link: "/shop?sale=1",
  promo_image_url: "/demo/promo.svg",
  promo_ends_at: "2026-12-31T17:59:00.000Z",
  gallery_images: [
    "/demo/products/gold-jhumka-earrings-1.svg",
    "/demo/products/pearl-hair-clip-set-1.svg",
    "/demo/products/bridal-choker-necklace-1.svg",
    "/demo/products/golden-kundan-churi-set-1.svg",
    "/demo/products/rose-glow-face-cream-1.svg",
    "/demo/products/rose-gold-charm-bracelet-1.svg",
  ],
  map_embed_url:
    "https://www.openstreetmap.org/export/embed.html?bbox=90.3866%2C23.7837%2C90.4266%2C23.8037&layer=mapnik&marker=23.7937%2C90.4066",
  cursor_enabled: true,
};

export const demoProfile: Profile = {
  full_name: "Sumaiya Rahman",
  professional_title: "Founder, Artificial Home",
  short_intro: "From a small Facebook page to thousands of happy customers all over Bangladesh.",
  bio: "Artificial Home started in 2021 as a tiny Facebook page run from my bedroom in Dhaka. I loved jewellery but good designs were either too expensive or hard to find, so I started sourcing pieces I would wear myself.\n\nToday we pack hundreds of orders every week — bangles, jhumkas, bridal sets, hair clips and gentle beauty care. Every piece is checked by hand before it leaves our studio, and we still read every message ourselves.\n\nThank you for being part of our story. We hope you find something that makes you smile.",
  email: "hello@artificialhome.demo",
  phone: "+880 1712-345678",
  location: "Road 11, Banani, Dhaka",
  profile_image_url: "/demo/avatar-owner.svg",
  about_image_url: "/demo/about-studio.svg",
  social_links: [
    { platform: "facebook", url: "https://facebook.com/" },
    { platform: "instagram", url: "https://instagram.com/" },
    { platform: "tiktok", url: "https://tiktok.com/" },
    { platform: "youtube", url: "https://youtube.com/" },
    { platform: "whatsapp", url: "https://wa.me/8801712345678" },
  ],
};

export const demoCategories: Category[] = [
  { id: "c1", name: "Bangles", slug: "bangles", description: "Churi and kada for every outfit and occasion.", image_url: "/demo/cat-bangles.svg", active: true, sort_order: 1 },
  { id: "c2", name: "Earrings", slug: "earrings", description: "Jhumka, chandbali, studs and pearl drops.", image_url: "/demo/cat-earrings.svg", active: true, sort_order: 2 },
  { id: "c3", name: "Necklaces", slug: "necklaces", description: "Chokers, pendants and layered pearls.", image_url: "/demo/cat-necklaces.svg", active: true, sort_order: 3 },
  { id: "c4", name: "Jewellery Sets", slug: "jewellery-sets", description: "Matching goina sets for weddings and parties.", image_url: "/demo/cat-jewellery-sets.svg", active: true, sort_order: 4 },
  { id: "c5", name: "Bracelets", slug: "bracelets", description: "Charm, pearl and crystal bracelets.", image_url: "/demo/cat-bracelets.svg", active: true, sort_order: 5 },
  { id: "c6", name: "Hair Accessories", slug: "hair-accessories", description: "Clips, claw clips, tikli and scrunchies.", image_url: "/demo/cat-hair-accessories.svg", active: true, sort_order: 6 },
  { id: "c7", name: "Beauty Care", slug: "beauty-care", description: "Gentle creams, lipsticks and skin care.", image_url: "/demo/cat-beauty-care.svg", active: true, sort_order: 7 },
];

const C: Record<string, ColorOption> = {
  gold: { name: "Gold", hex: "#d4a24c" },
  rose: { name: "Rose Gold", hex: "#d9a08b" },
  silver: { name: "Silver", hex: "#c0c4cc" },
  pearl: { name: "Pearl White", hex: "#f4efe6" },
  maroon: { name: "Maroon", hex: "#7a1f35" },
  red: { name: "Red", hex: "#c8203d" },
  green: { name: "Emerald", hex: "#1f7a5a" },
  pink: { name: "Pink", hex: "#f28ab2" },
  black: { name: "Black", hex: "#222222" },
  lilac: { name: "Lilac", hex: "#b99ad8" },
  nude: { name: "Nude", hex: "#c98f7a" },
};

const long = (intro: string) =>
  `${intro}\n\nEvery piece is checked by hand before it is packed. The plating is skin-friendly and lightweight, so it is comfortable to wear for long events.\n\n## Care tips\n- Keep away from water, perfume and lotion\n- Wipe gently with a soft, dry cloth after wearing\n- Store in the zip pouch that comes with your order`;

type Seed = [name: string, slug: string, cat: string, price: number, sale: number | null, stock: number, badge: string | null, featured: boolean, isNew: boolean, colors: ColorOption[], short: string, rating: number, reviews: number];

const seeds: Seed[] = [
  ["Golden Kundan Churi Set", "golden-kundan-churi-set", "bangles", 1450, 1150, 24, "Bestseller", true, false, [C.gold, C.rose], "Set of 4 kundan bangles with ruby and emerald stones.", 4.9, 128],
  ["Pearl Glass Churi", "pearl-glass-churi", "bangles", 650, null, 40, null, false, true, [C.pearl, C.pink], "Shiny glass churi with a soft pearl finish, set of 12.", 4.7, 54],
  ["Maroon Velvet Churi", "maroon-velvet-churi", "bangles", 890, 750, 18, "Sale", false, false, [C.maroon, C.red], "Velvet-wrapped bangles with golden stone work.", 4.8, 61],
  ["Oxidised Silver Kada", "oxidised-silver-kada", "bangles", 780, null, 15, null, false, false, [C.silver], "Boho oxidised kada with a floral pattern.", 4.6, 33],
  ["Gold Jhumka Earrings", "gold-jhumka-earrings", "earrings", 850, 690, 36, "Bestseller", true, false, [C.gold, C.rose], "Classic bell jhumka with pearl drops.", 4.9, 212],
  ["Pearl Drop Earrings", "pearl-drop-earrings", "earrings", 590, null, 30, "New", false, true, [C.pearl, C.gold], "Elegant single pearl drops for office and parties.", 4.8, 47],
  ["Chandbali Earrings", "chandbali-earrings", "earrings", 1150, 950, 12, "Sale", true, false, [C.gold, C.green], "Half-moon chandbali with emerald stones.", 4.8, 88],
  ["Tiny Stud Earring Set", "tiny-stud-earring-set", "earrings", 450, null, 50, null, false, false, [C.silver, C.gold], "Six pairs of tiny studs for everyday wear.", 4.7, 76],
  ["Bridal Choker Necklace", "bridal-choker-necklace", "necklaces", 2850, 2350, 9, "Bestseller", true, false, [C.gold, C.red], "Kundan bridal choker with matching earrings.", 5.0, 64],
  ["Layered Pearl Necklace", "layered-pearl-necklace", "necklaces", 1350, null, 20, "New", false, true, [C.pearl], "Three layers of soft pearls on a golden chain.", 4.8, 39],
  ["Minimal Heart Pendant", "minimal-heart-pendant", "necklaces", 690, 590, 45, null, false, false, [C.rose, C.gold, C.silver], "Dainty heart pendant on a fine chain.", 4.7, 102],
  ["Temple Coin Necklace", "temple-coin-necklace", "necklaces", 1950, null, 8, null, false, false, [C.gold], "Traditional coin necklace with antique finish.", 4.8, 29],
  ["Bridal Goina Set", "bridal-goina-set", "jewellery-sets", 4950, 3990, 6, "Bestseller", true, false, [C.gold, C.maroon], "Necklace, jhumka and tikli — the full bridal look.", 5.0, 41],
  ["Party Wear Necklace Set", "party-wear-necklace-set", "jewellery-sets", 2450, 1990, 14, "New", true, true, [C.silver, C.lilac], "Crystal necklace with matching studs.", 4.8, 36],
  ["Everyday Pearl Set", "everyday-pearl-set", "jewellery-sets", 1690, null, 22, null, false, false, [C.pearl, C.rose], "Light pearl necklace and earrings for daily wear.", 4.7, 45],
  ["Rose Gold Charm Bracelet", "rose-gold-charm-bracelet", "bracelets", 950, 790, 28, "Sale", true, false, [C.rose, C.gold], "Charm bracelet with heart, star and moon.", 4.8, 73],
  ["Pearl Beaded Bracelet", "pearl-beaded-bracelet", "bracelets", 550, null, 35, "New", false, true, [C.pearl, C.pink], "Stretchable pearl bracelet, one size fits all.", 4.7, 38],
  ["Crystal Tennis Bracelet", "crystal-tennis-bracelet", "bracelets", 1250, 990, 16, null, false, false, [C.silver, C.rose], "Sparkling crystal line bracelet for evenings.", 4.8, 52],
  ["Pearl Hair Clip Set", "pearl-hair-clip-set", "hair-accessories", 390, 320, 60, "Bestseller", true, true, [C.pearl, C.gold], "Set of 6 pearl hair clips in different sizes.", 4.9, 184],
  ["Butterfly Claw Clips", "butterfly-claw-clips", "hair-accessories", 350, null, 55, "New", false, true, [C.pink, C.lilac, C.black], "Pack of 3 matte butterfly claw clips.", 4.7, 97],
  ["Floral Bridal Tikli", "floral-bridal-tikli", "hair-accessories", 750, 650, 20, null, false, false, [C.gold, C.red], "Maang tikka with a floral kundan centre.", 4.8, 44],
  ["Satin Scrunchie Pack", "satin-scrunchie-pack", "hair-accessories", 290, null, 80, null, false, false, [C.pink, C.maroon, C.black], "Pack of 5 soft satin scrunchies.", 4.6, 58],
  ["Rose Glow Face Cream", "rose-glow-face-cream", "beauty-care", 650, 550, 40, "Bestseller", true, false, [], "Light day cream with rose water and vitamin E.", 4.8, 156],
  ["Velvet Matte Lipstick", "velvet-matte-lipstick", "beauty-care", 450, null, 70, "New", false, true, [C.red, C.nude, C.pink, C.maroon], "Long-lasting matte lipstick, soft on the lips.", 4.7, 91],
  ["Aloe Vera Night Gel", "aloe-vera-night-gel", "beauty-care", 390, null, 45, null, false, false, [], "Soothing aloe night gel for all skin types.", 4.6, 67],
];

export const demoProducts: Product[] = seeds.map(([name, slug, cat, price, sale, stock, badge, featured, isNew, colors, short, rating, reviews], i) => ({
  id: `p${i + 1}`,
  name,
  slug,
  category_slug: cat,
  short_description: short,
  description: long(short),
  price,
  sale_price: sale,
  images: [`/demo/products/${slug}-1.svg`, `/demo/products/${slug}-2.svg`],
  colors,
  stock,
  sku: `AH-${String(i + 1).padStart(3, "0")}`,
  badge,
  featured,
  is_new: isNew,
  rating,
  review_count: reviews,
  status: "published",
  sort_order: i + 1,
}));

export const demoBanners: Banner[] = [
  { id: "b1", kicker: "New Bridal Collection", title: "Shine Brighter on Your Special Day", subtitle: "Handpicked kundan sets, jhumkas and tikli — made to make every moment golden.", button_label: "Shop Bridal", button_link: "/shop/jewellery-sets", image_url: "/demo/banner-bridal.svg", active: true, sort_order: 1 },
  { id: "b2", kicker: "Festive Sale · Up to 40% Off", title: "Jhumkas & Bangles You'll Love", subtitle: "Trending designs for Eid, weddings and every party this season.", button_label: "Shop the Sale", button_link: "/shop?sale=1", image_url: "/demo/banner-sale.svg", active: true, sort_order: 2 },
  { id: "b3", kicker: "Everyday Pearls", title: "Little Details, Big Smiles", subtitle: "Pearl clips, dainty chains and studs for college, office and brunch.", button_label: "Explore New In", button_link: "/shop?new=1", image_url: "/demo/banner-pearls.svg", active: true, sort_order: 3 },
];

export const demoReviews: Testimonial[] = [
  { id: "t1", name: "Nusrat Jahan", role: "Dhaka", company: null, project_title: "Bridal Goina Set", quote: "I wore the bridal set on my holud and everyone asked where I got it! It looks exactly like the pictures and the packaging was so pretty.", avatar_url: "/demo/avatar-1.svg", rating: 5, active: true, sort_order: 1 },
  { id: "t2", name: "Tasnim Akter", role: "Chattogram", company: null, project_title: "Gold Jhumka Earrings", quote: "Delivery to Chattogram took just 2 days. The jhumkas are light and don't hurt my ears even after a full day.", avatar_url: "/demo/avatar-2.svg", rating: 5, active: true, sort_order: 2 },
  { id: "t3", name: "Sadia Islam", role: "Sylhet", company: null, project_title: "Pearl Hair Clip Set", quote: "Ordered with bKash and they confirmed on WhatsApp within minutes. The pearl clips are my new favourite for college.", avatar_url: "/demo/avatar-3.svg", rating: 5, active: true, sort_order: 3 },
  { id: "t4", name: "Farzana Rahman", role: "Rajshahi", company: null, project_title: "Rose Glow Face Cream", quote: "The rose cream is so light and smells lovely. My skin feels soft all day. Already ordered my second jar!", avatar_url: "/demo/avatar-4.svg", rating: 4, active: true, sort_order: 4 },
];

export const demoFaqs: Faq[] = [
  { id: "f1", question: "How do I place an order?", answer: "Add products to your cart, go to Checkout, fill in your name, phone and address, choose a payment method and press Place Order. You can also order on WhatsApp.", active: true, sort_order: 1 },
  { id: "f2", question: "What are the delivery charges?", answer: "Inside Dhaka ৳60 and outside Dhaka ৳120. Orders over ৳2,000 get free delivery.", active: true, sort_order: 2 },
  { id: "f3", question: "How long does delivery take?", answer: "Inside Dhaka 1–2 working days, outside Dhaka 2–4 working days. We call you before sending the parcel.", active: true, sort_order: 3 },
  { id: "f4", question: "Which payment methods do you accept?", answer: "Cash on Delivery all over Bangladesh, plus bKash, Nagad, Rocket and Bangla QR. For mobile payments, send the total and enter your Transaction ID at checkout.", active: true, sort_order: 4 },
  { id: "f5", question: "Can I return or exchange a product?", answer: "Yes. If a product arrives damaged or different from the picture, tell us within 3 days with a photo and we will exchange it for free.", active: true, sort_order: 5 },
  { id: "f6", question: "Is the jewellery safe for sensitive skin?", answer: "Our pieces use skin-friendly, nickel-free plating. Keep them away from water and perfume to keep the shine for longer.", active: true, sort_order: 6 },
];

export const demoPosts: BlogPost[] = [
  {
    id: "bp1",
    title: "How to Keep Your Artificial Jewellery Shining for Years",
    slug: "care-for-artificial-jewellery",
    excerpt: "Five simple habits that keep your favourite pieces looking brand new.",
    content:
      "Artificial jewellery can last for years with a little care. These habits make the biggest difference.\n\n## 1. Put it on last\nWear your jewellery after perfume, lotion and hairspray, not before.\n\n## 2. Keep it dry\nTake it off before a shower, a swim or washing your hands.\n\n## 3. Wipe after wearing\nA soft, dry cloth removes sweat and oil that make plating dull.\n\n## 4. Store pieces separately\nUse the zip pouch or a soft box so pieces don't scratch each other.\n\n## 5. Add silica gel\nA small silica packet in your jewellery box keeps moisture away.",
    cover_image_url: "/demo/blog-care.svg",
    category: "Jewellery Care",
    read_time: "3 min read",
    published_at: "2026-09-20",
    status: "published",
  },
  {
    id: "bp2",
    title: "5 Jewellery Trends Every Girl Will Love This Season",
    slug: "jewellery-trends-this-season",
    excerpt: "From oversized jhumkas to pearl hair clips — here is what everyone is wearing.",
    content:
      "This season is all about mixing traditional and modern.\n\n## Oversized jhumkas\nBig bells with pearl drops look amazing with both saree and kurti.\n\n## Pearl everything\nPearl clips, pearl bracelets and layered pearl necklaces are everywhere.\n\n## Stacked bangles\nMix velvet, glass and metal churi in two or three colours.\n\n## Dainty pendants\nA tiny heart or initial pendant is perfect for college and office.\n\n## Claw clips\nMatte butterfly claw clips are the easiest way to look put-together in seconds.",
    cover_image_url: "/demo/blog-trends.svg",
    category: "Style Guide",
    read_time: "4 min read",
    published_at: "2026-09-05",
    status: "published",
  },
  {
    id: "bp3",
    title: "Choosing Earrings for Your Face Shape",
    slug: "earrings-for-your-face-shape",
    excerpt: "A quick guide to finding earrings that flatter you the most.",
    content:
      "The right earrings can brighten your whole look. Here is a simple guide.\n\n## Round face\nLong drops and chandbalis add length.\n\n## Oval face\nLucky you — almost everything works, from studs to big jhumkas.\n\n## Square face\nRound hoops and soft pearl drops soften strong angles.\n\n## Heart face\nEarrings that are wider at the bottom, like jhumkas, balance a narrow chin.",
    cover_image_url: "/demo/blog-earrings.svg",
    category: "Style Guide",
    read_time: "3 min read",
    published_at: "2026-08-18",
    status: "published",
  },
];

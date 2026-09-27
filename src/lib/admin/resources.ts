export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "image"
  | "gallery"
  | "file"
  | "list"
  | "slug"
  | "color"
  | "date"
  | "url"
  | "email"
  | "links"
  | "tools"
  | "info"
  | "embed"
  | "heading"
  | "datetime"
  | "colors"
  | "sections";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Storage folder for uploads */
  folder?: string;
  min?: number;
  max?: number;
  rows?: number;
  maxLength?: number;
  /** Take the full row in the two-column form grid */
  full?: boolean;
  /** For slug fields: the field it is generated from */
  from?: string;
  /** Number fields: allow one decimal place (e.g. rating 4.8) */
  decimal?: boolean;
  /** Number fields: empty means "no value" (null) instead of 0 */
  nullable?: boolean;
  /** Select fields whose options come from another table (e.g. product → category) */
  optionsFrom?: { table: string; value: string; label: string };
};

export type Column = {
  name: string;
  label: string;
  kind?: "image" | "badge" | "boolean" | "date" | "text" | "price";
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  fields: Field[];
  columns: Column[];
  /** Fields that can be toggled from the list view */
  toggles?: { name: string; label: string; on: unknown; off: unknown }[];
  orderBy: { column: string; ascending: boolean };
  sortable?: boolean;
  /** Public path to revalidate / preview (use {slug}) */
  publicPath?: string;
  emptyText: string;
};

const sortOrder: Field = { name: "sort_order", label: "Sort order", type: "number", min: 0, max: 9999, help: "Lower numbers appear first." };
const active: Field = { name: "active", label: "Visible on website", type: "boolean" };
const activeToggle = { name: "active", label: "Visible", on: true, off: false };

export const resources: Record<string, Resource> = {
  products: {
    key: "products",
    table: "products",
    label: "Products",
    singular: "Product",
    description: "Everything you sell. Pictures, price, discount, stock and colours.",
    orderBy: { column: "sort_order", ascending: true },
    sortable: true,
    publicPath: "/product/{slug}",
    emptyText: "No products yet. Add your first product to open the shop.",
    columns: [
      { name: "images", label: "", kind: "image" },
      { name: "name", label: "Product" },
      { name: "category_slug", label: "Category", kind: "badge" },
      { name: "price", label: "Price", kind: "price" },
      { name: "sale_price", label: "Sale price", kind: "price" },
      { name: "stock", label: "Stock" },
    ],
    toggles: [
      { name: "status", label: "Published", on: "published", off: "draft" },
      { name: "featured", label: "Best seller", on: true, off: false },
      { name: "is_new", label: "New", on: true, off: false },
    ],
    fields: [
      { name: "h-basic", label: "Product", type: "heading" },
      { name: "name", label: "Product name", type: "text", required: true, maxLength: 120 },
      { name: "slug", label: "URL slug", type: "slug", from: "name", required: true, help: "Used in the page address: /product/your-slug" },
      { name: "category_slug", label: "Category", type: "select", optionsFrom: { table: "categories", value: "slug", label: "name" } },
      { name: "badge", label: "Badge (optional)", type: "text", maxLength: 20, placeholder: "e.g. Bestseller, Limited" },
      { name: "short_description", label: "Short description", type: "textarea", required: true, rows: 2, maxLength: 200, full: true, help: "One or two lines shown near the price." },
      {
        name: "description",
        label: "Full description",
        type: "textarea",
        rows: 8,
        maxLength: 5000,
        full: true,
        help: "Leave a blank line between paragraphs. Start a line with “## ” for a heading and “- ” for a bullet point.",
      },
      { name: "h-price", label: "Price & stock", type: "heading", help: "Prices are in Taka (৳), whole numbers." },
      { name: "price", label: "Regular price (৳)", type: "number", required: true, min: 0, max: 10000000 },
      { name: "sale_price", label: "Sale price (৳, optional)", type: "number", nullable: true, min: 0, max: 10000000, help: "Leave empty when there is no discount. Must be lower than the regular price." },
      { name: "stock", label: "Stock (pieces)", type: "number", required: true, min: 0, max: 1000000, help: "Goes down automatically with every order. 0 = sold out." },
      { name: "sku", label: "SKU / code (optional)", type: "text", maxLength: 40 },
      { name: "h-media", label: "Pictures & colours", type: "heading" },
      { name: "images", label: "Pictures", type: "gallery", folder: "products", full: true, help: "The first picture is the main one; the second shows on hover. Square pictures look best. Max 12." },
      { name: "colors", label: "Colour options", type: "colors", full: true, help: "Optional. Name + colour code, e.g. Gold / #d4a24c. Customers pick one before adding to cart." },
      { name: "h-more", label: "Rating & visibility", type: "heading" },
      { name: "rating", label: "Rating (0–5)", type: "number", decimal: true, min: 0, max: 5 },
      { name: "review_count", label: "Number of reviews", type: "number", min: 0, max: 1000000 },
      { name: "featured", label: "Best seller (home page)", type: "boolean" },
      { name: "is_new", label: "New arrival", type: "boolean" },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft (hidden)" },
        ],
      },
      sortOrder,
    ],
  },

  categories: {
    key: "categories",
    table: "categories",
    label: "Categories",
    singular: "Category",
    description: "Groups like Bangles, Earrings, Necklaces. Shown as round pictures and in the Shop menu.",
    orderBy: { column: "sort_order", ascending: true },
    sortable: true,
    publicPath: "/shop/{slug}",
    emptyText: "No categories yet.",
    columns: [
      { name: "image_url", label: "", kind: "image" },
      { name: "name", label: "Category" },
      { name: "slug", label: "Slug", kind: "badge" },
    ],
    toggles: [activeToggle],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 40 },
      { name: "slug", label: "URL slug", type: "slug", from: "name", required: true, help: "/shop/your-slug — changing it updates all products in this category." },
      { name: "description", label: "Short description", type: "textarea", rows: 2, maxLength: 200, full: true },
      { name: "image_url", label: "Picture", type: "image", folder: "categories", full: true, help: "Square picture. It is shown inside a circle." },
      active,
      sortOrder,
    ],
  },

  banners: {
    key: "banners",
    table: "banners",
    label: "Hero banners",
    singular: "Banner",
    description: "The big slides at the top of the home page. 2–3 slides look best.",
    orderBy: { column: "sort_order", ascending: true },
    sortable: true,
    emptyText: "No banners yet. Add at least one for the home page.",
    columns: [
      { name: "image_url", label: "", kind: "image" },
      { name: "title", label: "Title" },
      { name: "kicker", label: "Small text", kind: "badge" },
    ],
    toggles: [activeToggle],
    fields: [
      { name: "kicker", label: "Small text above the title", type: "text", maxLength: 50, placeholder: "e.g. New Bridal Collection" },
      { name: "title", label: "Title", type: "text", required: true, maxLength: 70, full: true },
      { name: "subtitle", label: "Text", type: "textarea", rows: 2, maxLength: 200, full: true },
      { name: "button_label", label: "Button label", type: "text", required: true, maxLength: 24 },
      { name: "button_link", label: "Button link", type: "text", required: true, maxLength: 200, placeholder: "/shop/jewellery-sets" , help: "A page on your website, e.g. /shop, /shop/earrings, /shop?sale=1" },
      { name: "image_url", label: "Picture", type: "image", required: true, folder: "banners", full: true, help: "Wide picture (about 1600 × 820). Keep the left side calm — the text sits there." },
      active,
      sortOrder,
    ],
  },

  reviews: {
    key: "reviews",
    table: "testimonials",
    label: "Reviews",
    singular: "Review",
    description: "Customer reviews on the home page and product pages.",
    orderBy: { column: "sort_order", ascending: true },
    sortable: true,
    emptyText: "No reviews yet.",
    columns: [
      { name: "avatar_url", label: "", kind: "image" },
      { name: "name", label: "Customer" },
      { name: "project_title", label: "Product" },
      { name: "rating", label: "Rating" },
    ],
    toggles: [activeToggle],
    fields: [
      { name: "name", label: "Customer name", type: "text", required: true, maxLength: 80 },
      { name: "role", label: "City", type: "text", maxLength: 60, placeholder: "e.g. Dhaka" },
      { name: "project_title", label: "Product bought", type: "text", maxLength: 120, help: "Use the exact product name to also show it on that product's page." },
      { name: "rating", label: "Rating (1–5)", type: "number", required: true, min: 1, max: 5 },
      { name: "quote", label: "Review", type: "textarea", required: true, rows: 4, maxLength: 800, full: true },
      { name: "avatar_url", label: "Photo (optional)", type: "image", folder: "testimonials" },
      active,
      sortOrder,
    ],
  },

  faqs: {
    key: "faqs",
    table: "faqs",
    label: "FAQ",
    singular: "Question",
    description: "Questions and answers on the /faq page.",
    orderBy: { column: "sort_order", ascending: true },
    sortable: true,
    emptyText: "No questions yet.",
    columns: [{ name: "question", label: "Question" }],
    toggles: [activeToggle],
    fields: [
      { name: "question", label: "Question", type: "text", required: true, maxLength: 160, full: true },
      { name: "answer", label: "Answer", type: "textarea", required: true, rows: 4, maxLength: 1500, full: true },
      active,
      sortOrder,
    ],
  },

  blog: {
    key: "blog",
    table: "blog_posts",
    label: "Blog",
    singular: "Blog post",
    description: "Articles on the home page and /blog.",
    orderBy: { column: "published_at", ascending: false },
    publicPath: "/blog/{slug}",
    emptyText: "No blog posts yet.",
    columns: [
      { name: "cover_image_url", label: "", kind: "image" },
      { name: "title", label: "Title" },
      { name: "category", label: "Category", kind: "badge" },
      { name: "published_at", label: "Date", kind: "date" },
    ],
    toggles: [{ name: "status", label: "Published", on: "published", off: "draft" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 160, full: true },
      { name: "slug", label: "URL slug", type: "slug", from: "title", required: true, help: "/blog/your-slug" },
      { name: "category", label: "Category", type: "text", required: true, maxLength: 40 },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true, rows: 3, maxLength: 300, full: true },
      {
        name: "content",
        label: "Content",
        type: "textarea",
        required: true,
        rows: 16,
        maxLength: 30000,
        full: true,
        help: "Leave a blank line between paragraphs. Start a line with “## ” for a heading and “- ” for a bullet point.",
      },
      { name: "cover_image_url", label: "Cover image", type: "image", required: true, folder: "blog", full: true },
      { name: "read_time", label: "Read time", type: "text", maxLength: 20, placeholder: "4 min read" },
      { name: "published_at", label: "Publish date", type: "date", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft (hidden)" },
        ],
      },
    ],
  },
};

export const profileFields: Field[] = [
  { name: "full_name", label: "Owner name", type: "text", required: true, maxLength: 80, help: "Shown on the Our Story page." },
  { name: "professional_title", label: "Owner title", type: "text", required: true, maxLength: 100, placeholder: "Founder, Artificial Home" },
  { name: "short_intro", label: "Short intro", type: "textarea", required: true, rows: 2, maxLength: 300, full: true, help: "Shown under the “Our Story” title." },
  { name: "bio", label: "Your story", type: "textarea", rows: 8, maxLength: 3000, full: true, help: "Leave a blank line between paragraphs." },
  { name: "about_image_url", label: "Story photo", type: "image", folder: "profile", help: "You, your team or your studio. 4:3 looks best." },
  { name: "profile_image_url", label: "Small square photo", type: "image", required: true, folder: "profile", help: "Used for SEO / sharing." },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "text", maxLength: 30 },
  { name: "location", label: "Shop address", type: "text", maxLength: 120, full: true, help: "Shown in the footer and on the Contact page." },
  { name: "social_links", label: "Social links", type: "links", full: true, help: "Facebook, Instagram, TikTok … The Instagram link is also used by the photo gallery." },
];

export const settingsFields: Field[] = [
  { name: "h-shop", label: "Shop", type: "heading" },
  { name: "website_name", label: "Shop name", type: "text", required: true, maxLength: 60 },
  { name: "logo_url", label: "Logo (optional — the shop name is used otherwise)", type: "image", folder: "settings" },
  { name: "announcement", label: "Announcement bar", type: "text", maxLength: 200, full: true, help: "Sliding text above the menu. Separate messages with ·  (leave empty to hide)." },
  { name: "whatsapp_number", label: "WhatsApp number", type: "text", maxLength: 20, placeholder: "8801712345678", help: "With country code, digits only. Used for the WhatsApp button and “Order on WhatsApp”." },
  { name: "contact_email", label: "Public email", type: "email", required: true },
  { name: "public_phone", label: "Public phone", type: "text", maxLength: 30 },
  { name: "footer_text", label: "Footer text", type: "textarea", rows: 2, maxLength: 240, full: true },

  { name: "h-look", label: "Look & feel", type: "heading" },
  { name: "accent_color", label: "Main colour", type: "color", required: true, help: "Buttons, prices and highlights." },
  { name: "accent_color_2", label: "Second colour", type: "color", required: true, help: "Small details (rose gold)." },
  {
    name: "default_theme",
    label: "Default theme",
    type: "select",
    required: true,
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "Follow visitor's system" },
    ],
  },
  { name: "cursor_enabled", label: "Animated mouse circle", type: "boolean" },

  { name: "h-delivery", label: "Delivery", type: "heading", help: "Charges are in Taka and are added to every order automatically." },
  { name: "delivery_inside", label: "Inside Dhaka (৳)", type: "number", required: true, min: 0, max: 100000 },
  { name: "delivery_outside", label: "Outside Dhaka (৳)", type: "number", required: true, min: 0, max: 100000 },
  { name: "free_delivery_min", label: "Free delivery from (৳)", type: "number", min: 0, max: 10000000, help: "0 = never free." },
  { name: "delivery_note", label: "Delivery time", type: "text", maxLength: 120, placeholder: "Inside Dhaka: 1–2 days · Outside Dhaka: 2–4 days" },
  { name: "order_prefix", label: "Order number prefix", type: "text", required: true, maxLength: 4, placeholder: "AH", help: "1–4 capital letters, e.g. AH → AH260927-7A1B2" },

  { name: "h-pay", label: "Payment methods", type: "heading", help: "A method is shown at checkout when it is switched on / its number is filled in. Customers send money and enter their Transaction ID." },
  { name: "cod_enabled", label: "Cash on Delivery", type: "boolean" },
  { name: "bkash_number", label: "bKash number", type: "text", maxLength: 20, placeholder: "01XXXXXXXXX" },
  { name: "nagad_number", label: "Nagad number", type: "text", maxLength: 20, placeholder: "01XXXXXXXXX" },
  { name: "rocket_number", label: "Rocket number", type: "text", maxLength: 20, placeholder: "01XXXXXXXXXX" },
  { name: "payment_qr_url", label: "Bangla QR picture", type: "image", folder: "payments", help: "Upload your merchant QR code. Leave empty to hide Bangla QR." },
  { name: "payment_note", label: "Payment note", type: "textarea", rows: 2, maxLength: 300, full: true, placeholder: "Use Send Money for the total amount …" },

  { name: "h-promo", label: "Offer banner (home page)", type: "heading", help: "Leave the title empty to hide it." },
  { name: "promo_kicker", label: "Small text", type: "text", maxLength: 40 },
  { name: "promo_title", label: "Title", type: "text", maxLength: 80 },
  { name: "promo_text", label: "Text", type: "textarea", rows: 2, maxLength: 200, full: true },
  { name: "promo_button", label: "Button label", type: "text", maxLength: 24 },
  { name: "promo_link", label: "Button link", type: "text", maxLength: 200, placeholder: "/shop?sale=1" },
  { name: "promo_ends_at", label: "Countdown ends (Bangladesh time)", type: "datetime", help: "Leave empty for no countdown." },
  { name: "promo_image_url", label: "Offer picture", type: "image", folder: "banners", full: true },

  { name: "h-extra", label: "Gallery, map & sections", type: "heading" },
  { name: "gallery_images", label: "Instagram gallery pictures", type: "gallery", folder: "gallery", full: true, help: "6 or 12 square pictures." },
  {
    name: "map_embed_url",
    label: "Contact map (embed link)",
    type: "embed",
    full: true,
    help: "Google Maps → Share → Embed a map → copy only the link inside src=\"...\". Leave empty to hide the map.",
  },
  {
    name: "sections",
    label: "Home page sections & pages",
    type: "sections",
    full: true,
    help: "Turn sections on or off and change their order on the home page. Turning off About, Blog, FAQ or Contact also removes that page from the menu.",
  },

  { name: "h-seo", label: "Google (SEO)", type: "heading" },
  { name: "seo_title", label: "SEO title", type: "text", required: true, maxLength: 70, full: true, help: "Shown in Google results and browser tabs. ~60 characters." },
  { name: "seo_description", label: "SEO description", type: "textarea", required: true, rows: 3, maxLength: 170, full: true, help: "~155 characters." },
];

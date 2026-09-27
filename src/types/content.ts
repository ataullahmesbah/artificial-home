import type { SectionSetting } from "@/lib/sections";

export type SocialLink = { platform: string; url: string };
export type ColorOption = { name: string; hex: string };

/** The shop owner (About page) and public contact details. */
export type Profile = {
  id?: string;
  full_name: string;
  professional_title: string;
  short_intro: string;
  bio: string;
  email: string;
  phone: string | null;
  location: string;
  profile_image_url: string;
  about_image_url: string | null;
  social_links: SocialLink[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_slug: string | null;
  short_description: string;
  description: string;
  /** Prices are whole Taka. */
  price: number;
  sale_price: number | null;
  images: string[];
  colors: ColorOption[];
  stock: number;
  sku: string | null;
  badge: string | null;
  featured: boolean;
  is_new: boolean;
  rating: number;
  review_count: number;
  status: "published" | "draft";
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Banner = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  button_label: string;
  button_link: string;
  image_url: string;
  active: boolean;
  sort_order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
};

/** Customer reviews (stored in the testimonials table). */
export type Testimonial = {
  id: string;
  name: string;
  /** City, e.g. "Dhaka" */
  role: string | null;
  company: string | null;
  /** Product the customer bought */
  project_title: string | null;
  quote: string;
  avatar_url: string | null;
  rating: number;
  active: boolean;
  sort_order: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  read_time: string;
  published_at: string;
  status: "published" | "draft";
  updated_at?: string;
};

export type PaymentMethod = "cod" | "bkash" | "nagad" | "rocket" | "qr";

export type SiteSettings = {
  id?: string;
  website_name: string;
  logo_url: string | null;
  accent_color: string;
  accent_color_2: string;
  default_theme: "dark" | "light" | "system";
  contact_email: string;
  public_phone: string | null;
  seo_title: string;
  seo_description: string;
  footer_text: string;
  hire_label: string;
  sections: SectionSetting[];
  announcement: string;
  whatsapp_number: string | null;
  delivery_inside: number;
  delivery_outside: number;
  free_delivery_min: number;
  delivery_note: string;
  order_prefix: string;
  cod_enabled: boolean;
  bkash_number: string | null;
  nagad_number: string | null;
  rocket_number: string | null;
  payment_qr_url: string | null;
  payment_note: string;
  promo_kicker: string;
  promo_title: string;
  promo_text: string;
  promo_button: string;
  promo_link: string;
  promo_image_url: string | null;
  promo_ends_at: string | null;
  gallery_images: string[];
  map_embed_url: string | null;
  cursor_enabled: boolean;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type OrderItem = {
  product_id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  qty: number;
  color: string | null;
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  area: "inside" | "outside";
  note: string;
  items: OrderItem[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: PaymentMethod;
  payment_sender: string | null;
  payment_trx: string | null;
  payment_status: "unpaid" | "paid" | "refunded";
  status: OrderStatus;
  admin_note: string;
  created_at: string;
  updated_at: string;
};

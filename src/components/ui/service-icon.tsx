import {
  Camera,
  Code2,
  Compass,
  Film,
  Layers,
  LineChart,
  Megaphone,
  Monitor,
  Palette,
  PenTool,
  Rocket,
  Smartphone,
  Sparkles,
  Wand2,
  ShoppingCart,
  ShieldCheck,
  Search,
  Headphones,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  compass: Compass,
  monitor: Monitor,
  pen: PenTool,
  sparkles: Sparkles,
  code: Code2,
  wand: Wand2,
  mobile: Smartphone,
  palette: Palette,
  camera: Camera,
  megaphone: Megaphone,
  layers: Layers,
  rocket: Rocket,
  chart: LineChart,
  film: Film,
  cart: ShoppingCart,
  shield: ShieldCheck,
  search: Search,
  support: Headphones,
};

export const serviceIconKeys = Object.keys(map);

export function ServiceIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = map[name ?? ""] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}

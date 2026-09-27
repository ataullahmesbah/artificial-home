// Generates the illustrated demo pictures in public/demo (SVG, no external assets):
// products, hero banners, category pictures, offer banner, avatars, blog covers and a demo QR.
// Run: npm run assets:generate
// Replace them from the admin dashboard with real product photos before going live.
import { mkdirSync, writeFileSync } from "node:fs";

const out = new URL("../public/demo/", import.meta.url);
mkdirSync(new URL("products/", out), { recursive: true });
const save = (name, svg) => writeFileSync(new URL(name, out), svg.trim() + "\n");

const FONT = "Georgia, 'Times New Roman', serif";
const svg = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
const lin = (id, a, b, x2 = 1, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const rad = (id, a, b, cx = 0.35, cy = 0.35, r = 0.75) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;

// ---------- Shared paint (metal, gems, pearls) ----------
const METALS = {
  gold: ["#fbe7a6", "#e2b04e", "#9c6a1c"],
  rose: ["#fbd9cc", "#dca08a", "#9e5f4c"],
  silver: ["#ffffff", "#c9ced6", "#7d8591"],
};
const paint = () =>
  Object.entries(METALS)
    .map(([k, [a, b, c]]) => `<linearGradient id="m-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`)
    .join("") +
  rad("pearl", "#ffffff", "#e6ddd0", 0.35, 0.3, 0.8) +
  rad("ruby", "#ff8aa0", "#9b0f2a") +
  rad("emerald", "#8ff0c8", "#0d5a3f") +
  rad("sapph", "#b6c8ff", "#3a3fa0") +
  rad("crystal", "#ffffff", "#b9d4f0") +
  `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>` +
  `<filter id="drop" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#6b3b4a" flood-opacity=".22"/></filter>`;

const gem = (x, y, r, kind = "ruby") => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${kind})"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff" opacity=".75"/>`;
const pearl = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#pearl)"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.25}" fill="#fff" opacity=".9"/>`;
const sparkle = (x, y, s = 1, c = "#fff") => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-18C2-6 6-2 18 0C6 2 2 6 0 18C-2 6-6 2-18 0C-6-2-2-6 0-18Z" fill="${c}"/>`;

// ---------- Jewellery drawings (drawn around 0,0, roughly 600 px wide) ----------
const ART = {
  bangles: ({ metal = "gold", gems = "ruby" }) =>
    [0, 1, 2, 3].map((i) => {
      const y = -120 + i * 70;
      return `<ellipse cx="0" cy="${y}" rx="230" ry="78" fill="none" stroke="url(#m-${metal})" stroke-width="${i % 2 ? 22 : 30}"/>` +
        (i % 2 ? "" : Array.from({ length: 9 }, (_, k) => { const a = Math.PI * (0.08 + k * 0.105); return gem(Math.cos(a) * 230, y + Math.sin(a) * 78, 9, k % 3 === 1 ? "emerald" : gems); }).join(""));
    }).join(""),
  glass: ({ metal = "gold" }) =>
    Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="${-150 + i * 40}" rx="225" ry="70" fill="none" stroke="${i % 3 === 0 ? `url(#m-${metal})` : i % 2 ? "#f7c6d6" : "#fff7f2"}" stroke-width="${i % 3 === 0 ? 12 : 16}" opacity=".95"/>`).join(""),
  velvet: ({ metal = "gold" }) =>
    [0, 1, 2].map((i) => `<ellipse cx="0" cy="${-90 + i * 90}" rx="230" ry="80" fill="none" stroke="#7a1f35" stroke-width="44"/><ellipse cx="0" cy="${-90 + i * 90}" rx="230" ry="80" fill="none" stroke="url(#m-${metal})" stroke-width="8" stroke-dasharray="4 18"/>`).join(""),
  kada: () =>
    `<ellipse cx="0" cy="0" rx="240" ry="95" fill="none" stroke="url(#m-silver)" stroke-width="70"/><ellipse cx="0" cy="0" rx="240" ry="95" fill="none" stroke="#6a717c" stroke-width="3" stroke-dasharray="14 10" opacity=".7"/>` +
    Array.from({ length: 7 }, (_, k) => { const a = Math.PI * (0.12 + k * 0.13); return `<circle cx="${Math.cos(a) * 240}" cy="${Math.sin(a) * 95}" r="16" fill="none" stroke="#5f6570" stroke-width="4"/>`; }).join(""),
  jhumka: ({ metal = "gold", gems = "ruby" }) =>
    [-150, 150].map((x) => `<g transform="translate(${x} -60)">
      <path d="M0-190C-30-190-30-150 0-150" fill="none" stroke="url(#m-${metal})" stroke-width="8"/>
      <circle cx="0" cy="-120" r="34" fill="url(#m-${metal})"/>${gem(0, -120, 14, gems)}
      <path d="M-95 60C-95-40-50-80 0-80C50-80 95-40 95 60Z" fill="url(#m-${metal})"/>
      <path d="M-95 60H95" stroke="#8a5a14" stroke-width="6"/>
      ${Array.from({ length: 7 }, (_, k) => `<path d="M${-80 + k * 26.6} 60v28" stroke="url(#m-${metal})" stroke-width="3"/>${pearl(-80 + k * 26.6, 100, 12)}`).join("")}
      ${gem(-40, 10, 10, gems)}${gem(0, -10, 12, gems)}${gem(40, 10, 10, gems)}</g>`).join(""),
  drops: ({ metal = "gold" }) =>
    [-120, 120].map((x) => `<g transform="translate(${x} -40)"><path d="M0-170C-26-170-26-135 0-135" fill="none" stroke="url(#m-${metal})" stroke-width="7"/><circle cx="0" cy="-110" r="20" fill="url(#m-${metal})"/><path d="M0-90V10" stroke="url(#m-${metal})" stroke-width="5"/>${pearl(0, 70, 62)}</g>`).join(""),
  chandbali: ({ metal = "gold", gems = "emerald" }) =>
    [-150, 150].map((x) => `<g transform="translate(${x} -30)">
      <path d="M0-180C-26-180-26-146 0-146" fill="none" stroke="url(#m-${metal})" stroke-width="7"/>
      <path d="M-120-60C-120 70 120 70 120-60C80 10-80 10-120-60Z" fill="url(#m-${metal})"/>
      ${Array.from({ length: 5 }, (_, k) => gem(-72 + k * 36, 8 + Math.abs(k - 2) * -6, 11, k % 2 ? "ruby" : gems)).join("")}
      <circle cx="0" cy="-110" r="30" fill="url(#m-${metal})"/>${gem(0, -110, 13, gems)}
      ${Array.from({ length: 9 }, (_, k) => pearl(-100 + k * 25, 58 + Math.sin((k / 8) * Math.PI) * 26, 9)).join("")}</g>`).join(""),
  studs: ({ metal = "silver" }) =>
    Array.from({ length: 6 }, (_, i) => { const x = -200 + (i % 3) * 200, y = -90 + Math.floor(i / 3) * 190;
      const t = i % 3 === 0 ? gem(0, 0, 26, "crystal") : i % 3 === 1 ? `<path d="M0-30L8-8L30 0L8 8L0 30L-8 8L-30 0L-8-8Z" fill="url(#m-${metal})"/>` : `<path d="M0 26C-40 0-28-30 0-14C28-30 40 0 0 26Z" fill="url(#m-${metal === "silver" ? "rose" : metal})"/>`;
      return `<g transform="translate(${x - 34} ${y})">${t}</g><g transform="translate(${x + 34} ${y})">${t}</g>`; }).join(""),
  choker: ({ metal = "gold", gems = "ruby" }) =>
    `<path d="M-280-120C-240 120 240 120 280-120" fill="none" stroke="url(#m-${metal})" stroke-width="54" stroke-linecap="round"/>` +
    Array.from({ length: 13 }, (_, k) => { const t = k / 12, x = -260 + t * 520, y = -90 + Math.sin(t * Math.PI) * 160;
      return gem(x, y, 13, k % 4 === 2 ? "emerald" : gems) + `<path d="M${x} ${y + 24}v${26 + Math.sin(t * Math.PI) * 30}" stroke="url(#m-${metal})" stroke-width="4"/>` + pearl(x, y + 58 + Math.sin(t * Math.PI) * 30, 10); }).join("") +
    `<path d="M-60 90L0 170L60 90Z" fill="url(#m-${metal})"/>${gem(0, 118, 22, gems)}`,
  layered: ({ metal = "gold" }) =>
    [0, 1, 2].map((l) => `<path d="M-250-150C-220 ${40 + l * 60} 220 ${40 + l * 60} 250-150" fill="none" stroke="url(#m-${metal})" stroke-width="3"/>` +
      Array.from({ length: 17 + l * 2 }, (_, k) => { const t = k / (16 + l * 2); const x = -250 + t * 500; const y = -150 + (1 - (2 * t - 1) ** 2) * (150 + 40 + l * 60) * 0.75; return pearl(x, y, 11 + l * 2); }).join("")).join(""),
  pendant: ({ metal = "rose" }) =>
    `<path d="M-230-200C-180 60 180 60 230-200" fill="none" stroke="url(#m-${metal})" stroke-width="5"/>` +
    `<g transform="translate(0 45)" filter="url(#drop)"><path d="M0 90C-110 10-80-80 0-30C80-80 110 10 0 90Z" fill="url(#m-${metal})"/><path d="M-40-35C-20-50 0-30 0-30" stroke="#fff" stroke-width="6" opacity=".6" fill="none"/></g>`,
  coins: () =>
    `<path d="M-270-140C-230 110 230 110 270-140" fill="none" stroke="url(#m-gold)" stroke-width="10"/>` +
    Array.from({ length: 11 }, (_, k) => { const t = k / 10, x = -250 + t * 500, y = -110 + Math.sin(t * Math.PI) * 190;
      return `<circle cx="${x}" cy="${y + 34}" r="30" fill="url(#m-gold)" stroke="#9c6a1c" stroke-width="3"/><circle cx="${x}" cy="${y + 34}" r="17" fill="none" stroke="#9c6a1c" stroke-width="2"/>`; }).join(""),
  bridalset: ({ metal = "gold", gems = "ruby" }) =>
    `<g transform="translate(0 40) scale(.85)">${ART.choker({ metal, gems })}</g>` +
    [-300, 300].map((x) => `<g transform="translate(${x} 40) scale(.55)">${ART.jhumka({ metal, gems }).split("</g>")[0]}</g></g>`).join("") +
    `<g transform="translate(0 -250)"><path d="M0-60V20" stroke="url(#m-${metal})" stroke-width="5"/><circle cx="0" cy="40" r="34" fill="url(#m-${metal})"/>${gem(0, 40, 16, gems)}${pearl(0, 92, 12)}</g>`,
  partyset: ({ metal = "silver" }) =>
    `<path d="M-250-160C-210 90 210 90 250-160" fill="none" stroke="url(#m-${metal})" stroke-width="6"/>` +
    Array.from({ length: 15 }, (_, k) => { const t = k / 14, x = -240 + t * 480, y = -130 + Math.sin(t * Math.PI) * 180; return gem(x, y, 14 + Math.sin(t * Math.PI) * 8, "crystal"); }).join("") +
    `<g transform="translate(0 110)">${gem(0, 0, 38, "sapph")}</g>` + [-300, 300].map((x) => `<g transform="translate(${x} 150)">${gem(0, 0, 26, "crystal")}</g>`).join(""),
  pearlset: () => `<g transform="translate(0 -30) scale(.9)">${ART.layered({ metal: "gold" }).split("</path>").slice(0, 1).join("</path>")}</path>${Array.from({ length: 21 }, (_, k) => { const t = k / 20; return pearl(-250 * 0.9 + t * 450, -150 * 0.9 + (1 - (2 * t - 1) ** 2) * 142, 13); }).join("")}</g>` +
    [-290, 290].map((x) => `<g transform="translate(${x} 130) scale(.6)">${ART.drops({ metal: "gold" }).split("</g>")[0]}</g></g>`).join(""),
  charm: ({ metal = "rose" }) =>
    `<ellipse cx="0" cy="-20" rx="220" ry="150" fill="none" stroke="url(#m-${metal})" stroke-width="10" stroke-dasharray="22 8"/>` +
    `<g transform="translate(-110 130)"><path d="M0 40C-50 5-36-36 0-14C36-36 50 5 0 40Z" fill="url(#m-${metal})"/></g>` +
    `<g transform="translate(20 150)"><path d="M0-34L10-10L34-8L16 8L22 34L0 20L-22 34L-16 8L-34-8L-10-10Z" fill="url(#m-gold)"/></g>` +
    `<g transform="translate(140 110)"><path d="M10-30A34 34 0 1 0 10 30A26 26 0 1 1 10-30Z" fill="url(#m-silver)"/></g>` + pearl(-190, 60, 16),
  pearlband: () => Array.from({ length: 26 }, (_, k) => { const a = (k / 26) * Math.PI * 2; return pearl(Math.cos(a) * 220, Math.sin(a) * 140, 24); }).join(""),
  tennis: ({ metal = "silver" }) => `<ellipse cx="0" cy="0" rx="230" ry="140" fill="none" stroke="url(#m-${metal})" stroke-width="30"/>` + Array.from({ length: 30 }, (_, k) => { const a = (k / 30) * Math.PI * 2; return gem(Math.cos(a) * 230, Math.sin(a) * 140, 11, "crystal"); }).join(""),
  clips: ({ metal = "gold" }) =>
    Array.from({ length: 6 }, (_, i) => { const len = 180 + (i % 3) * 60, y = -200 + i * 80, x = -40 + (i % 2) * 60;
      return `<g transform="translate(${x} ${y}) rotate(${-8 + (i % 3) * 6})"><rect x="${-len / 2}" y="-10" width="${len}" height="20" rx="10" fill="url(#m-${metal})"/>${Array.from({ length: Math.floor(len / 40) }, (_, k) => pearl(-len / 2 + 22 + k * 40, -2, 15)).join("")}</g>`; }).join(""),
  claw: ({ colors = ["#f28ab2", "#b99ad8", "#333"] }) =>
    colors.map((c, i) => `<g transform="translate(${-200 + i * 200} ${i % 2 ? 40 : -40}) rotate(${-10 + i * 10})">
      <path d="M0-20C-60-120-150-70-120 0C-150 70-60 120 0 20C60 120 150 70 120 0C150-70 60-120 0-20Z" fill="${c}" opacity=".92"/>
      <path d="M-14-70V70M14-70V70" stroke="#fff" stroke-width="6" opacity=".35"/><rect x="-22" y="-30" width="44" height="60" rx="12" fill="${c}"/></g>`).join(""),
  tikli: ({ metal = "gold", gems = "ruby" }) =>
    `<path d="M-200-230C-100-120 100-120 200-230" fill="none" stroke="url(#m-${metal})" stroke-width="5"/><path d="M0-145V20" stroke="url(#m-${metal})" stroke-width="6"/>` +
    `<g transform="translate(0 90)">${Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return `<ellipse cx="${Math.cos(a) * 52}" cy="${Math.sin(a) * 52}" rx="34" ry="20" transform="rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 52} ${Math.sin(a) * 52})" fill="url(#m-${metal})"/>`; }).join("")}${gem(0, 0, 36, gems)}${Array.from({ length: 5 }, (_, k) => pearl(-48 + k * 24, 110, 11)).join("")}</g>`,
  scrunchie: ({ colors = ["#f28ab2", "#7a1f35", "#222"] }) =>
    [...colors, "#f7d1dc", "#c9a0d8"].slice(0, 5).map((c, i) => { const x = [-190, 0, 190, -95, 95][i], y = [-90, -120, -90, 110, 110][i];
      return `<g transform="translate(${x} ${y})">${Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return `<circle cx="${Math.cos(a) * 64}" cy="${Math.sin(a) * 64}" r="34" fill="${c}"/>`; }).join("")}<circle r="40" fill="#fff" opacity=".0"/><circle r="30" fill="#00000010"/></g>`; }).join(""),
  cream: ({ label = "ROSE GLOW" }) =>
    `<g filter="url(#drop)"><rect x="-200" y="-60" width="400" height="230" rx="40" fill="#fff5f7"/><rect x="-200" y="-60" width="400" height="230" rx="40" fill="url(#jarShade)"/>
    <rect x="-215" y="-150" width="430" height="100" rx="30" fill="url(#m-rose)"/><rect x="-215" y="-80" width="430" height="10" fill="#9e5f4c" opacity=".3"/>
    <text x="0" y="60" text-anchor="middle" font-family="${FONT}" font-size="44" letter-spacing="6" fill="#b44a6b">${label}</text>
    <text x="0" y="110" text-anchor="middle" font-family="Arial" font-size="22" letter-spacing="5" fill="#c98f7a">DAY CREAM · 50g</text></g>
    <g transform="translate(260 120)"><path d="M0 0C-40-60 10-110 40-60C70-110 120-60 80 0" fill="#f7b8c8"/><circle cx="40" cy="-20" r="14" fill="#e0457b"/></g>`,
  lipstick: ({ colors = ["#c8203d", "#c98f7a", "#f28ab2", "#7a1f35"] }) =>
    colors.map((c, i) => `<g transform="translate(${-210 + i * 140} ${i % 2 ? 30 : 0})" filter="url(#drop)"><rect x="-40" y="40" width="80" height="170" rx="10" fill="url(#m-gold)"/><rect x="-32" y="-40" width="64" height="90" fill="url(#m-silver)"/><path d="M-26-40V-120C-26-150 26-170 26-140V-40Z" fill="${c}"/></g>`).join(""),
  gel: () =>
    `<g filter="url(#drop)" transform="rotate(-12)"><path d="M-110-230H110L90 170H-90Z" fill="#eaf7ee"/><rect x="-60" y="170" width="120" height="70" rx="12" fill="#6cbf8a"/>
    <text x="0" y="-60" text-anchor="middle" font-family="${FONT}" font-size="40" fill="#2f7a4c">ALOE</text><text x="0" y="-10" text-anchor="middle" font-family="Arial" font-size="20" letter-spacing="4" fill="#5a9c72">NIGHT GEL</text>
    <path d="M-10 70C-50 20-20-20 0 30C20-20 50 20 10 70Z" fill="#6cbf8a"/></g><g transform="translate(220 150) rotate(20)"><path d="M0 0C-20-120 20-200 30-220C40-160 30-60 0 0Z" fill="#7fcf98"/></g>`,
};
ART.pearlset = () =>
  `<path d="M-230-170C-200 60 200 60 230-170" fill="none" stroke="url(#m-gold)" stroke-width="3"/>` +
  Array.from({ length: 21 }, (_, k) => { const t = k / 20; const x = -225 + t * 450; const y = -165 + (1 - (2 * t - 1) ** 2) * 170; return pearl(x, y, 14); }).join("") +
  [-300, 300].map((x) => `<g transform="translate(${x} 120) scale(.6)"><path d="M0-170C-26-170-26-135 0-135" fill="none" stroke="url(#m-gold)" stroke-width="7"/><circle cx="0" cy="-110" r="20" fill="url(#m-gold)"/><path d="M0-90V10" stroke="url(#m-gold)" stroke-width="5"/>${pearl(0, 70, 62)}</g>`).join("");

const BG = {
  blush: ["#fff1f4", "#f9d3de"],
  peach: ["#fff4ec", "#f8d9c4"],
  lilac: ["#f6f1ff", "#ddd0f5"],
  mint: ["#effaf5", "#cdeee0"],
  cream: ["#fffaf2", "#f1e2c8"],
  sky: ["#f1f6ff", "#d3e2f7"],
  rose: ["#fdeef2", "#efc0cf"],
};
const defsAll = (bgA, bgB) => paint() + lin("bg", bgA, bgB, 0.4, 1) + lin("jarShade", "#ffffff00", "#e8b9c6", 0, 1);

// slug → drawing, options, background
const PRODUCTS = {
  "golden-kundan-churi-set": ["bangles", { metal: "gold", gems: "ruby" }, "cream"],
  "pearl-glass-churi": ["glass", { metal: "gold" }, "blush"],
  "maroon-velvet-churi": ["velvet", { metal: "gold" }, "rose"],
  "oxidised-silver-kada": ["kada", {}, "sky"],
  "gold-jhumka-earrings": ["jhumka", { metal: "gold", gems: "ruby" }, "blush"],
  "pearl-drop-earrings": ["drops", { metal: "gold" }, "lilac"],
  "chandbali-earrings": ["chandbali", { metal: "gold", gems: "emerald" }, "mint"],
  "tiny-stud-earring-set": ["studs", { metal: "silver" }, "sky"],
  "bridal-choker-necklace": ["choker", { metal: "gold", gems: "ruby" }, "rose"],
  "layered-pearl-necklace": ["layered", { metal: "gold" }, "peach"],
  "minimal-heart-pendant": ["pendant", { metal: "rose" }, "blush"],
  "temple-coin-necklace": ["coins", {}, "cream"],
  "bridal-goina-set": ["bridalset", { metal: "gold", gems: "ruby" }, "rose"],
  "party-wear-necklace-set": ["partyset", { metal: "silver" }, "lilac"],
  "everyday-pearl-set": ["pearlset", {}, "peach"],
  "rose-gold-charm-bracelet": ["charm", { metal: "rose" }, "blush"],
  "pearl-beaded-bracelet": ["pearlband", {}, "lilac"],
  "crystal-tennis-bracelet": ["tennis", { metal: "silver" }, "sky"],
  "pearl-hair-clip-set": ["clips", { metal: "gold" }, "peach"],
  "butterfly-claw-clips": ["claw", { colors: ["#f28ab2", "#b99ad8", "#2d2d33"] }, "blush"],
  "floral-bridal-tikli": ["tikli", { metal: "gold", gems: "ruby" }, "cream"],
  "satin-scrunchie-pack": ["scrunchie", { colors: ["#f28ab2", "#7a1f35", "#2d2d33"] }, "lilac"],
  "rose-glow-face-cream": ["cream", {}, "rose"],
  "velvet-matte-lipstick": ["lipstick", {}, "peach"],
  "aloe-vera-night-gel": ["gel", {}, "mint"],
};

const petals = (w, h, seed, n = 10, colors = ["#f7b8c8", "#ffffff", "#f3d3a8"]) => {
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, (_, i) => {
    const x = rnd() * w, y = rnd() * h, s = 0.5 + rnd() * 1.1, a = rnd() * 360;
    return i % 3 === 2 ? sparkle(x, y, s, "#ffffff") : `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(22 * s).toFixed(0)}" ry="${(12 * s).toFixed(0)}" transform="rotate(${a.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${colors[i % colors.length]}" opacity=".7"/>`;
  }).join("");
};

function productImage(slug, variant) {
  const [kind, opts, bgKey] = PRODUCTS[slug];
  const [a, b] = BG[bgKey];
  const S = 1000;
  const scene =
    variant === 1
      ? `<rect width="${S}" height="${S}" fill="url(#bg)"/><circle cx="500" cy="470" r="340" fill="#ffffff" opacity=".55"/>
         <ellipse cx="500" cy="820" rx="300" ry="36" fill="#6b3b4a" opacity=".08" filter="url(#soft)"/>
         ${petals(S, S, slug.length * 7, 8)}
         <g transform="translate(500 480) scale(1.18)" filter="url(#drop)">${ART[kind](opts)}</g>`
      : `<rect width="${S}" height="${S}" fill="url(#bg)"/>
         <path d="M180 1000V430C180 250 330 130 500 130C670 130 820 250 820 430V1000Z" fill="#ffffff" opacity=".6"/>
         <rect x="0" y="780" width="${S}" height="220" fill="${b}" opacity=".7"/>
         <ellipse cx="500" cy="800" rx="330" ry="40" fill="#ffffff" opacity=".9"/>
         ${petals(S, 700, slug.length * 13, 10)}
         <g transform="translate(500 560) scale(.98) rotate(-6)" filter="url(#drop)">${ART[kind](opts)}</g>`;
  save(`products/${slug}-${variant}.svg`, svg(S, S, scene, defsAll(a, b)));
}
for (const slug of Object.keys(PRODUCTS)) {
  productImage(slug, 1);
  productImage(slug, 2);
}

// ---------- Category pictures (square, shown in circles) ----------
const CATS = {
  bangles: ["bangles", { metal: "gold", gems: "ruby" }, "cream", 0.6],
  earrings: ["jhumka", { metal: "gold", gems: "ruby" }, "blush", 0.62],
  necklaces: ["choker", { metal: "gold", gems: "ruby" }, "rose", 0.6],
  "jewellery-sets": ["bridalset", { metal: "gold", gems: "ruby" }, "peach", 0.5],
  bracelets: ["charm", { metal: "rose" }, "lilac", 0.62],
  "hair-accessories": ["clips", { metal: "gold" }, "sky", 0.6],
  "beauty-care": ["cream", {}, "mint", 0.6],
};
for (const [slug, [kind, opts, bgKey, sc]] of Object.entries(CATS)) {
  const [a, b] = BG[bgKey];
  save(`cat-${slug}.svg`, svg(500, 500, `<rect width="500" height="500" fill="url(#bg)"/>${petals(500, 500, slug.length * 11, 6)}<g transform="translate(250 260) scale(${sc})" filter="url(#drop)">${ART[kind](opts)}</g>`, defsAll(a, b)));
}

// ---------- People (for reviews, the founder and banners) ----------
function woman({ skin = "#f1c3a0", shade = "#dba27d", hair = "#2a1a16", top = "#e0457b", earring = "gold", bun = false, lips = "#c2415f" } = {}) {
  return `
  ${bun ? `<circle cx="200" cy="58" r="34" fill="${hair}"/>` : `<path d="M112 150C100 260 110 350 128 400L272 400C290 350 300 260 288 150Z" fill="${hair}"/>`}
  <rect x="172" y="196" width="56" height="74" rx="22" fill="${shade}"/>
  <path d="M40 470C50 340 110 280 200 272C290 280 350 340 360 470Z" fill="${top}"/>
  <path d="M150 282C170 320 230 320 250 282" fill="none" stroke="url(#m-gold)" stroke-width="5"/>${pearl(200, 322, 9)}
  <ellipse cx="200" cy="152" rx="62" ry="74" fill="${skin}"/>
  <ellipse cx="168" cy="182" rx="12" ry="7" fill="#f28b82" opacity=".3"/><ellipse cx="232" cy="182" rx="12" ry="7" fill="#f28b82" opacity=".3"/>
  <path d="M134 162C126 88 168 66 204 66C246 66 280 92 268 162C262 118 240 100 204 100C170 100 144 118 134 162Z" fill="${hair}"/>
  <path d="M204 70C184 100 160 120 136 132" stroke="${hair}" stroke-width="14" fill="none"/>
  <circle cx="138" cy="176" r="7" fill="url(#m-${earring})"/><path d="M138 183v14" stroke="url(#m-${earring})" stroke-width="3"/><circle cx="138" cy="204" r="9" fill="url(#m-${earring})"/>
  <circle cx="262" cy="176" r="7" fill="url(#m-${earring})"/><path d="M262 183v14" stroke="url(#m-${earring})" stroke-width="3"/><circle cx="262" cy="204" r="9" fill="url(#m-${earring})"/>
  <path d="M168 150q10-6 20 0M212 150q10-6 20 0" stroke="#2a1d17" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M164 136q14-8 28 0M208 136q14-8 28 0" stroke="${hair}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M198 160q-6 12 4 14" stroke="${shade}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M186 190q14 10 28 0" stroke="${lips}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
}
const girls = [
  ["avatar-owner.svg", { top: "#e0457b", earring: "gold" }, "blush"],
  ["avatar-1.svg", { top: "#7a1f35", earring: "gold", skin: "#f3c8a8" }, "cream"],
  ["avatar-2.svg", { top: "#1f7a5a", earring: "rose", skin: "#d9a07a", shade: "#c0855f", bun: true }, "mint"],
  ["avatar-3.svg", { top: "#b99ad8", earring: "silver", hair: "#4a2c1d" }, "lilac"],
  ["avatar-4.svg", { top: "#f28ab2", earring: "gold", skin: "#b9805a", shade: "#9e6a48", hair: "#1a1110" }, "peach"],
];
for (const [file, opts, bgKey] of girls) {
  const [a, b] = BG[bgKey];
  save(file, svg(400, 400, `<rect width="400" height="400" fill="url(#bg)"/><g transform="translate(40 60) scale(.8)">${woman(opts)}</g>`, defsAll(a, b)));
}

// ---------- Hero banners (1600 × 820): text goes on the left, picture on the right ----------
function banner(file, bgKey, content, accent = "#e0457b") {
  const [a, b] = BG[bgKey];
  const body = `<rect width="1600" height="820" fill="url(#bg)"/>
    <circle cx="1180" cy="400" r="360" fill="#ffffff" opacity=".5"/>
    <circle cx="1180" cy="400" r="300" fill="none" stroke="${accent}" stroke-opacity=".18" stroke-width="2"/>
    <path d="M880 820V470C880 300 1010 190 1180 190C1350 190 1480 300 1480 470V820Z" fill="#ffffff" opacity=".45"/>
    ${petals(1600, 820, file.length * 17, 16)}
    ${content}`;
  save(file, svg(1600, 820, body, defsAll(a, b)));
}
banner("banner-bridal.svg", "rose", `<g transform="translate(1180 360) scale(.9)" filter="url(#drop)">${ART.bridalset({ metal: "gold", gems: "ruby" })}</g>`);
banner("banner-sale.svg", "peach",
  `<g transform="translate(1040 300) scale(.75) rotate(-8)" filter="url(#drop)">${ART.jhumka({ metal: "gold", gems: "ruby" })}</g>` +
  `<g transform="translate(1300 560) scale(.6) rotate(10)" filter="url(#drop)">${ART.bangles({ metal: "gold", gems: "emerald" })}</g>` +
  `<g transform="translate(1390 170)"><circle r="92" fill="#e0457b"/><text y="-8" text-anchor="middle" font-family="Arial" font-weight="700" font-size="46" fill="#fff">40%</text><text y="34" text-anchor="middle" font-family="Arial" font-weight="700" font-size="26" letter-spacing="4" fill="#fff">OFF</text></g>`);
banner("banner-pearls.svg", "lilac",
  `<g transform="translate(1120 330) scale(.8)" filter="url(#drop)">${ART.layered({ metal: "gold" })}</g>` +
  `<g transform="translate(1330 610) scale(.45) rotate(-12)" filter="url(#drop)">${ART.clips({ metal: "gold" })}</g>`);

// ---------- Offer banner, founder studio, blog covers ----------
save("promo.svg", svg(1200, 900,
  `<rect width="1200" height="900" fill="url(#bg)"/>${petals(1200, 900, 99, 14)}
   <g transform="translate(420 330) scale(.7) rotate(-10)" filter="url(#drop)">${ART.choker({ metal: "gold", gems: "ruby" })}</g>
   <g transform="translate(860 300) scale(.55) rotate(8)" filter="url(#drop)">${ART.chandbali({ metal: "gold", gems: "emerald" })}</g>
   <g transform="translate(600 680) scale(.55)" filter="url(#drop)">${ART.bangles({ metal: "gold", gems: "ruby" })}</g>`, defsAll(...BG.cream)));

save("about-studio.svg", svg(1200, 900,
  `<rect width="1200" height="900" fill="url(#bg)"/>
   <rect x="80" y="140" width="330" height="18" rx="6" fill="#d9b8a6"/><rect x="80" y="330" width="330" height="18" rx="6" fill="#d9b8a6"/>
   ${[0, 1, 2].map((i) => `<rect x="${100 + i * 105}" y="${60 + (i % 2) * 10}" width="80" height="80" rx="8" fill="${["#f7c6d6", "#fff", "#f3d3a8"][i]}"/><rect x="${100 + i * 105}" y="${250}" width="80" height="80" rx="8" fill="${["#fff", "#e0457b", "#f7c6d6"][i]}"/>`).join("")}
   <g transform="translate(380 190) scale(1.6)">${woman({ top: "#e0457b", earring: "gold" })}</g>
   <rect x="0" y="690" width="1200" height="210" fill="#e9c3b0"/><rect x="0" y="680" width="1200" height="20" fill="#d7a992"/>
   <g transform="translate(260 640)"><rect x="-90" y="-40" width="180" height="90" rx="10" fill="#fff"/><path d="M-90-10H90" stroke="#e0457b" stroke-width="6"/><path d="M0-40V50" stroke="#e0457b" stroke-width="6"/></g>
   <g transform="translate(960 610) scale(.35)" filter="url(#drop)">${ART.jhumka({ metal: "gold", gems: "ruby" })}</g>
   ${petals(1200, 600, 7, 10)}`, defsAll(...BG.blush)));

const blogs = [
  ["blog-care.svg", "mint", `<g transform="translate(600 400) scale(.8)" filter="url(#drop)">${ART.pearlset()}</g>`],
  ["blog-trends.svg", "blush", `<g transform="translate(420 380) scale(.6)" filter="url(#drop)">${ART.jhumka({ metal: "gold", gems: "ruby" })}</g><g transform="translate(830 430) scale(.5) rotate(-10)" filter="url(#drop)">${ART.claw({ colors: ["#f28ab2", "#b99ad8", "#2d2d33"] })}</g>`],
  ["blog-earrings.svg", "lilac", `<g transform="translate(600 420) scale(.8)" filter="url(#drop)">${ART.chandbali({ metal: "gold", gems: "emerald" })}</g>`],
];
for (const [file, bgKey, content] of blogs) save(file, svg(1200, 800, `<rect width="1200" height="800" fill="url(#bg)"/>${petals(1200, 800, file.length * 5, 12)}${content}`, defsAll(...BG[bgKey])));

// ---------- Demo payment QR (not a real payment code) ----------
{
  let r = 42;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const cells = [];
  for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) {
    const finder = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
    if (!finder && rnd() > 0.52) cells.push(`<rect x="${20 + x * 12}" y="${20 + y * 12}" width="12" height="12"/>`);
  }
  const fp = (x, y) => `<rect x="${x}" y="${y}" width="84" height="84" fill="#111"/><rect x="${x + 12}" y="${y + 12}" width="60" height="60" fill="#fff"/><rect x="${x + 24}" y="${y + 24}" width="36" height="36" fill="#111"/>`;
  save("payment-qr.svg", svg(388, 440, `<rect width="388" height="440" rx="18" fill="#fff"/><g fill="#111">${cells.join("")}</g>${fp(20, 20)}${fp(284, 20)}${fp(20, 284)}
    <rect x="144" y="154" width="100" height="44" rx="8" fill="#fff"/><text x="194" y="184" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20" fill="#e0457b">DEMO</text>
    <text x="194" y="412" text-anchor="middle" font-family="Arial" font-size="17" fill="#555">Demo QR · replace in Admin → Settings</text>`));
}

console.log("demo assets written to public/demo");

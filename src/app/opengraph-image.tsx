import { ImageResponse } from "next/og";
import { getProfile, getSettings } from "@/lib/data";
import { safeHex } from "@/lib/utils";

export const alt = "Website preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const [s, p] = await Promise.all([getSettings(), getProfile()]);
  const accent = safeHex(s.accent_color, "#e0457b");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#2b1520",
          color: "#f3dbe4",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -160, right: -120, width: 520, height: 520, borderRadius: 9999, background: accent, opacity: 0.25, display: "flex" }} />
        <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: accent, display: "flex" }}>ARTIFICIAL JEWELLERY · BEAUTY</div>
        <div style={{ fontSize: 88, fontWeight: 800, color: "#ffffff", marginTop: 20, display: "flex" }}>{s.website_name}</div>
        <div style={{ fontSize: 44, marginTop: 16, display: "flex" }}>Cash on Delivery · bKash · Nagad · Rocket</div>
        <div style={{ width: 160, height: 8, borderRadius: 8, marginTop: 36, background: accent, display: "flex" }} />
        <div style={{ fontSize: 26, marginTop: 32, color: "#d6b3c1", display: "flex" }}>{p.location}</div>
      </div>
    ),
    size
  );
}

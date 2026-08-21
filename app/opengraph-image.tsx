import { ImageResponse } from "next/og";

import { getStaticSite } from "@/content/static";

/**
 * Composed social card.
 *
 * A raw photograph cropped to 1200x630 loses its subject and carries no
 * branding, so the card is composed instead: studio mark, wordmark, tagline.
 */
export const runtime = "nodejs";
export const alt = "ARCHITAK — interiors studio in Kochi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { studio } = getStaticSite();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f5f2eb",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Triangle mark drawn inline so the card needs no network asset. */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "26px solid transparent",
              borderRight: "26px solid transparent",
              borderBottom: "44px solid #c4a574",
            }}
          />
          <div style={{ fontSize: 40, letterSpacing: "0.24em" }}>ARCHITAK</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: 92, lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            {studio.tagline}
          </div>
          <div style={{ fontSize: 30, color: "#a5a09a" }}>
            Interior design studio · {studio.location}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#a5a09a",
            borderTop: "1px solid #2a2a2a",
            paddingTop: "24px",
          }}
        >
          <span>architak.in</span>
          <span>{studio.phone}</span>
        </div>
      </div>
    ),
    size,
  );
}

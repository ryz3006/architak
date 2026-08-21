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
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              background: "#c4a574",
              marginRight: 24,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 40,
              letterSpacing: "0.24em",
            }}
          >
            ARCHITAK
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 92,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            {studio.tagline}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#a5a09a",
            }}
          >
            {`Interior design studio · ${studio.location}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#a5a09a",
            borderTop: "1px solid #2a2a2a",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex" }}>architak.in</div>
          <div style={{ display: "flex" }}>{studio.phone}</div>
        </div>
      </div>
    ),
    size,
  );
}

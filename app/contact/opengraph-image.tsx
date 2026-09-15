import { ImageResponse } from "next/og";

import { getStaticSite } from "@/content/static";

/**
 * Contact page social card.
 *
 * Composed with studio mark, wordmark, and contact invitation.
 */
export const runtime = "nodejs";
export const alt = "ARCHITAK Contact — Begin here";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ContactOpengraphImage() {
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
            BEGIN HERE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#a5a09a",
            }}
          >
            Contact · Every space starts with a conversation
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

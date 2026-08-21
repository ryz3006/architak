import { buildLlmsText, isLlmsFullEnabled } from "@/features/discovery";

/**
 * Longer-form variant, off by default.
 *
 * Gated by DISCOVERY_LLMS_FULL_ENABLED so the studio can decide how much
 * narrative to expose to model crawlers without a code change.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  if (!isLlmsFullEnabled()) {
    return new Response("Not found\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  return new Response(buildLlmsText({ full: true }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "index, follow",
    },
  });
}

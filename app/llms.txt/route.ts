import { buildLlmsText } from "@/features/discovery";

/**
 * Studio and work index for LLM crawlers.
 *
 * Published content only, served as plain text so no client JavaScript is
 * required to read it.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return new Response(buildLlmsText({ full: false }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "index, follow",
    },
  });
}

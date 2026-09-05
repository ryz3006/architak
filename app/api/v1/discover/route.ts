import type { NextRequest } from "next/server";

import {
  absoluteUrl,
  getPublishedProjects,
  getSiteUrl,
  getStaticRoutes,
  isDiscoverApiEnabled,
} from "@/features/discovery";
import { getStaticServices, getStaticSite } from "@/content/static";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest } from "@/lib/security/client-ip";

/**
 * Published-only JSON index for agents that prefer structured data over HTML.
 *
 * Read-only, rate limited, and gated by DISCOVERY_PUBLIC_API_ENABLED. It must
 * never expose drafts, enquiries, media keys, or configuration.
 */
export const dynamic = "force-dynamic";

function clientKey(request: NextRequest): string {
  return `discover:${getClientIpFromRequest(request)}`;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      ...init.headers,
    },
  });
}

export function GET(request: NextRequest): Response {
  if (!isDiscoverApiEnabled()) {
    return jsonResponse(
      { error: "not_found" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  const max = Number(process.env.RATE_LIMIT_MAX ?? 20);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const limit = checkRateLimit(clientKey(request), max, windowMs);

  if (!limit.ok) {
    return jsonResponse(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      },
    );
  }

  const site = getStaticSite();

  return jsonResponse({
    version: "1",
    generatedAt: new Date().toISOString(),
    studio: {
      name: site.studio.name,
      tagline: site.studio.tagline,
      statement: site.studio.statement,
      location: site.studio.location,
      address: site.studio.address,
      phone: site.studio.phone,
      email: site.studio.email,
      url: getSiteUrl(),
    },
    pages: getStaticRoutes().map((route) => ({
      url: absoluteUrl(route.path),
      title: route.title,
      description: route.description,
    })),
    services: getStaticServices().map((service) => ({
      slug: service.slug,
      title: service.title,
      description: service.description,
    })),
    projects: getPublishedProjects().map((project) => ({
      slug: project.slug,
      url: absoluteUrl(project.path),
      title: project.title,
      category: project.category,
      location: project.location,
      summary: project.summary,
      image: absoluteUrl(project.coverImage),
    })),
  });
}

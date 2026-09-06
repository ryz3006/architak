/**
 * Lightweight UA / device parsing for traffic analytics.
 * Intentionally coarse — we store browser family + device class only.
 */

export type ParsedClient = {
  browser: string;
  device: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
};

const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitoring|wget|curl|python-requests|scrapy/i;

export function parseUserAgent(ua: string | null | undefined): ParsedClient {
  if (!ua) return { browser: "Unknown", device: "unknown" };
  if (BOT_RE.test(ua)) return { browser: "Bot", device: "bot" };

  const device: ParsedClient["device"] = /ipad|tablet|kindle|playbook/i.test(ua)
    ? "tablet"
    : /mobi|iphone|android.*mobile|windows phone/i.test(ua)
      ? "mobile"
      : "desktop";

  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = "Safari";
  else if (/msie|trident/i.test(ua)) browser = "IE";

  return { browser, device };
}

export function isBotUserAgent(ua: string | null | undefined): boolean {
  return parseUserAgent(ua).device === "bot";
}

/** Prefer platform geo headers (Vercel / Cloudflare). Never required. */
export function readGeoFromHeaders(headers: Headers): {
  country: string | null;
  region: string | null;
  city: string | null;
} {
  const country =
    headers.get("x-vercel-ip-country")?.trim() ||
    headers.get("cf-ipcountry")?.trim() ||
    null;
  const region =
    headers.get("x-vercel-ip-country-region")?.trim() ||
    headers.get("cf-region")?.trim() ||
    null;
  const city = headers.get("x-vercel-ip-city")?.trim() || null;

  return {
    country: country && country !== "XX" ? country.slice(0, 8) : null,
    region: region ? decodeURIComponent(region).slice(0, 80) : null,
    city: city ? decodeURIComponent(city).slice(0, 80) : null,
  };
}

export function referrerHost(referrer: string | null | undefined, siteHost: string): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.host === siteHost) return null;
    return url.host.slice(0, 200);
  } catch {
    return null;
  }
}

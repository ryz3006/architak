import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://architak.in";
  const adminPath = process.env.ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [adminPath, `${adminPath}/`, "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

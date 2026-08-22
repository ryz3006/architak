import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Temporary allowlist until nonce-based CSP lands with the motion bundle verified.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // media.architak.in is production; workers.dev is the testing CDN until DNS moves to Cloudflare.
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.r2.cloudflarestorage.com https://media.architak.in https://architak-media.architak.workers.dev",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.architak.in",
      },
      {
        protocol: "https",
        hostname: "architak-media.architak.workers.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/dev/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    // WordPress cutover stubs — expand from the live URL inventory before DNS cutover.
    return [
      {
        source: "/index.php",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/studio",
        permanent: true,
      },
      {
        source: "/project/:slug*",
        destination: "/work/:slug*",
        permanent: true,
      },
      {
        source: "/work",
        destination: "/studio#work",
        permanent: false,
      },
      {
        source: "/about",
        destination: "/studio",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/studio",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import {
  buildLocalBusinessJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";
import { getMetadataBase } from "@/features/discovery/metadata";

import { SiteEffects } from "@/components/layout/site-effects";

import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-architak-display",
  weight: ["400", "500", "600"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-architak-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ARCHITAK",
    template: "%s · ARCHITAK",
  },
  description: "CREATED TO CREATE — interior design studio in Vyttila, Kochi.",
  metadataBase: getMetadataBase(),
  icons: {
    icon: [{ url: "/brand/logo.png", type: "image/png" }],
    apple: [{ url: "/brand/logo.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ARCHITAK",
  },
  twitter: {
    card: "summary_large_image",
  },
};

/**
 * viewport-fit=cover is required for env(safe-area-inset-*) to report real
 * values, which is how fixed chrome avoids notches and the home indicator.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const splashCursorEnabled = process.env.FEATURE_SPLASH_CURSOR !== "false";

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(buildLocalBusinessJsonLd())}
        />
        <SiteEffects splashCursorEnabled={splashCursorEnabled} />
        {children}
      </body>
    </html>
  );
}

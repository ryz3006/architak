import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

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
  description: "CREATED TO CREATE — interiors studio based in Kochi.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ARCHITAK",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "ARCHITAK",
  description: "Interior design studio in Vyttila, Kochi.",
  url: "https://architak.in",
  telephone: "+918891991999",
  email: "architak336@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ARCK Tower, Neelamuri Line, Ponnurunni, Vyttila",
    addressLocality: "Kochi",
    addressRegion: "Kerala",
    postalCode: "682019",
    addressCountry: "IN",
  },
  image: "/brand/logo.png",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

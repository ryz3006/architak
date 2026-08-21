import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Root admin layout.
 *
 * Auth and the CMS shell live in `(dashboard)/layout.tsx` so `/admin/login`
 * remains reachable without a session.
 */
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
}

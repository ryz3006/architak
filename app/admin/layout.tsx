import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border px-6 py-4">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">ARCHITAK Admin</p>
      </div>
      {children}
    </div>
  );
}

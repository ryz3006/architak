"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminShortcuts } from "@/components/admin/shortcuts";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/enquiries", label: "Leads" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/ops", label: "Operations" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <AdminShortcuts />
      <aside className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <p className="text-fluid-xs tracking-[0.3em] text-muted uppercase">ARCHITAK Admin</p>
          <p className="mt-2 text-fluid-sm text-muted">Signed in as {username}</p>
        </div>
        <nav aria-label="Admin" className="px-3 pb-6">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block border border-transparent px-3 py-2 text-fluid-sm tracking-widest uppercase",
                      active
                        ? "border-border bg-surface text-foreground"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <form action={logoutAction} className="mt-8 px-3">
            <button
              type="submit"
              className="text-fluid-xs tracking-widest text-muted uppercase hover:text-foreground"
            >
              Sign out
            </button>
          </form>
          <p className="mt-6 px-3 text-fluid-xs text-muted">
            Press <kbd>?</kbd> for keyboard shortcuts.
          </p>
        </nav>
      </aside>
      <div className="min-w-0">
        <div className="page-frame py-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}

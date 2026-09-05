"use client";

import { ChevronRight, Command as CommandIcon, LogOut, Menu, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";

import { AdminShortcuts } from "@/components/admin/shortcuts";
import { CommandMenu } from "@/components/admin/command-menu";
import { IdleLogout } from "@/components/admin/idle-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/admin/ui/sheet";
import { Toaster } from "@/components/admin/ui/toaster";
import { logoutAction } from "@/features/auth/actions";
import { ADMIN_NAV, getBreadcrumbs, getPageTitle } from "@/lib/admin/nav";
import { cn } from "@/lib/cn";

function isActive(href: string, pathname: string, exact?: boolean): boolean {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      {ADMIN_NAV.map((group) => (
        <div key={group.id}>
          <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href, pathname, item.exact);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-10 items-center gap-2.5 rounded-[var(--admin-radius-sm)] px-3 py-2 text-fluid-sm transition-colors",
                      active
                        ? "bg-[var(--admin-surface-raised)] font-medium text-foreground"
                        : "text-muted hover:bg-[var(--admin-surface)] hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn("size-4 shrink-0", active ? "text-accent" : "text-muted")}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex min-w-0 flex-col gap-0.5">
      <span className="text-fluid-sm font-semibold tracking-[0.2em] uppercase text-foreground">
        ARCHITAK
      </span>
      <span className="text-fluid-xs text-muted">Content platform</span>
    </Link>
  );
}

function UserMenu({ username }: { username: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex max-w-full items-center gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] px-2.5 py-1.5 text-fluid-sm text-foreground transition-colors hover:border-[var(--admin-border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--admin-surface-raised)]">
            <User className="size-3.5 text-muted" aria-hidden="true" />
          </span>
          <span className="hidden max-w-32 truncate sm:inline">{username}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>Signed in as {username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/security">
            <User />
            Security &amp; sessions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full cursor-pointer select-none items-center gap-2 rounded-[var(--admin-radius-sm)] px-2.5 py-2 text-fluid-sm text-foreground outline-none hover:bg-[var(--admin-surface)] [&_svg]:size-4 [&_svg]:text-muted"
          >
            <LogOut />
            Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = getBreadcrumbs(pathname);
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-fluid-xs text-muted">
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.href}>
          {index > 0 ? <ChevronRight className="size-3 shrink-0" aria-hidden="true" /> : null}
          {crumb.current ? (
            <span aria-current="page" className="truncate text-foreground">
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className="truncate transition-colors hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export function AdminShell({
  children,
  username,
  idleTimeoutMinutes = 30,
}: {
  children: React.ReactNode;
  username: string;
  idleTimeoutMinutes?: number;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const title = getPageTitle(pathname);

  return (
    <div className="admin-shell min-h-dvh bg-background text-foreground">
      {/* Overlays must stay outside the layout grid — fixed nodes still occupy grid cells. */}
      <AdminShortcuts />
      <IdleLogout timeoutMinutes={idleTimeoutMinutes} />
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      <Toaster />

      <div className="admin-shell__layout">
        <aside className="admin-shell__sidebar hidden lg:flex">
          <div className="shrink-0 border-b border-[var(--admin-border)] px-5 py-4">
            <Brand />
          </div>
          <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
            <NavLinks pathname={pathname} />
          </nav>
          <div className="shrink-0 border-t border-[var(--admin-border)] px-3 py-3">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex w-full items-center gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] px-3 py-2 text-fluid-xs text-muted transition-colors hover:text-foreground"
            >
              <Search className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Search</span>
              <kbd className="ml-auto flex shrink-0 items-center gap-0.5 text-[0.65rem]">
                <CommandIcon className="size-3" aria-hidden="true" />K
              </kbd>
            </button>
          </div>
        </aside>

        <div className="admin-shell__main">
          <header className="admin-shell__header sticky top-0 z-[var(--z-header)] flex items-center gap-3 border-b border-[var(--admin-border)] bg-background/90 px-4 py-3 backdrop-blur md:px-6">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] p-2 text-foreground lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="border-b border-[var(--admin-border)] px-5 py-4 pr-12">
                  <Brand />
                </div>
                <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
                  <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
                </nav>
                <div className="border-t border-[var(--admin-border)] px-3 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setCommandOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] px-3 py-2 text-fluid-xs text-muted"
                  >
                    <Search className="size-3.5" aria-hidden="true" />
                    Search
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <Breadcrumbs pathname={pathname} />
              <h1 className="truncate text-fluid-base font-semibold text-foreground">{title}</h1>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] p-2 text-muted transition-colors hover:text-foreground lg:hidden"
                aria-label="Search"
              >
                <Search className="size-4" />
              </button>
              <UserMenu username={username} />
            </div>
          </header>

          <div className="admin-shell__content min-w-0 flex-1">
            <div className="admin-shell__content-inner mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

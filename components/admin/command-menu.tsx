"use client";

import { LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/admin/ui/command";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { logoutAction } from "@/features/auth/actions";

/**
 * Global command palette. Opens with Cmd/Ctrl+K (or the header button).
 * Provides jump-to navigation across every admin section plus quick actions.
 */
export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search sections and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem
            value="new project create add"
            onSelect={() => go("/admin/projects/new")}
          >
            <Plus />
            New project
          </CommandItem>
          <CommandItem
            value="sign out logout"
            onSelect={() => {
              onOpenChange(false);
              void logoutAction();
            }}
          >
            <LogOut />
            Sign out
          </CommandItem>
        </CommandGroup>

        {ADMIN_NAV.map((group) => (
          <CommandGroup key={group.id} heading={group.label}>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.description ?? ""} ${(item.keywords ?? []).join(" ")}`}
                  onSelect={() => go(item.href)}
                >
                  <Icon />
                  <span className="flex flex-col">
                    <span>{item.label}</span>
                    {item.description ? (
                      <span className="text-fluid-xs text-muted">{item.description}</span>
                    ) : null}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

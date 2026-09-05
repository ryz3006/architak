"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

type Side = "left" | "right";

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: Side }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-[var(--z-modal)] bg-background/70 backdrop-blur-sm",
          "data-[state=open]:animate-[adminFadeIn_150ms_var(--ease-entrance)]",
          "data-[state=closed]:animate-[adminFadeOut_120ms_var(--ease-exit)]",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-[var(--z-modal)] flex w-[min(20rem,88vw)] flex-col border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] shadow-[var(--admin-shadow)]",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          "data-[state=open]:animate-[adminSlideInRight_240ms_var(--ease-entrance)]",
          "data-[state=closed]:animate-[adminSlideOutLeft_200ms_var(--ease-exit)]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-[var(--admin-radius-sm)] p-1 text-muted transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

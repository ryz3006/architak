"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-[var(--z-modal)] max-w-xs rounded-[var(--admin-radius-sm)] border border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] px-2.5 py-1.5 text-fluid-xs text-foreground shadow-[var(--admin-shadow)]",
          "data-[state=delayed-open]:animate-[adminFadeIn_120ms_var(--ease-entrance)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

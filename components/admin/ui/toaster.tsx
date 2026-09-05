"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Global toast host for the admin. Themed via `styles/admin.css`
 * (`[data-sonner-toaster]`). Import `toast` from `sonner` directly in
 * client components to trigger notifications.
 */
export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: "text-fluid-sm",
        },
      }}
    />
  );
}

export { toast } from "sonner";

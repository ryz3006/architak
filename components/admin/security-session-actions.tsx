"use client";

import { Button } from "@/components/admin/ui/button";
import { signOutAction, signOutEverywhereAction } from "@/features/auth/security-actions";

export function SessionActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={signOutAction}>
        <Button variant="outline" size="sm" type="submit">
          Sign out
        </Button>
      </form>
      <form
        action={signOutEverywhereAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              "Sign out of every device and browser? You will need to sign in again everywhere.",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <Button variant="destructive" size="sm" type="submit">
          Sign out everywhere
        </Button>
      </form>
    </div>
  );
}

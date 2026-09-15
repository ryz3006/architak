"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useAdminLoading } from "@/components/admin/loading";
import { Button } from "@/components/admin/ui/button";
import type { JournalActionState } from "@/features/journal/actions";

export function EmptyTrashButton({ action }: { action: () => Promise<JournalActionState> }) {
  const router = useRouter();
  const { withLoading } = useAdminLoading();
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  async function handleEmptyTrash() {
    if (!window.confirm("Permanently delete all trashed posts? This cannot be undone.")) {
      return;
    }

    setPending(true);
    const result = await withLoading(action, "empty-trash");
    setPending(false);

    if (result.ok) {
      toast.success(result.message);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Button variant="destructive" size="sm" disabled={pending} onClick={handleEmptyTrash}>
      Empty Trash
    </Button>
  );
}

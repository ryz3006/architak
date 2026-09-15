"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [pending, setPending] = useState(false);

  async function handleShare() {
    setPending(true);

    const url = `${window.location.origin}/journal/${slug}`;

    // Track share event
    try {
      await fetch("/api/analytics/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectType: "journal_post",
          subjectSlug: slug,
          method: "copy", // Will be updated below if native share is used
        }),
      });
    } catch {
      // Fail silently
    }

    // Try Web Share API first (mobile/tablet)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        
        // Update analytics to reflect native share
        await fetch("/api/analytics/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectType: "journal_post",
            subjectSlug: slug,
            method: "native",
          }),
        });

        setPending(false);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Fall through to copy
        } else {
          setPending(false);
          return;
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      // Show URL as fallback
      toast.info(url, {
        duration: 10000,
        description: "Copy this link to share",
      });
    }

    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={pending}
      className="inline-flex items-center gap-2 text-fluid-sm text-accent hover:underline disabled:opacity-50"
    >
      Share
    </button>
  );
}

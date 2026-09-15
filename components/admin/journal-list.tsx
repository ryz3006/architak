"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useAdminLoading } from "@/components/admin/loading";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import {
  deleteJournalPostAction,
  trashJournalPostAction,
  restoreJournalPostAction,
} from "@/features/journal/actions";
import type { AdminJournalListItem } from "@/features/journal/admin";

const STATUS_VARIANT = {
  published: "success" as const,
  draft: "warning" as const,
  archived: "neutral" as const,
  trashed: "danger" as const,
};

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function JournalList({
  posts,
  showTrashed = false,
}: {
  posts: AdminJournalListItem[];
  showTrashed?: boolean;
}) {
  const router = useRouter();
  const { withLoading } = useAdminLoading();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onTrash(post: AdminJournalListItem) {
    if (!window.confirm(`Move "${post.title}" to trash?`)) {
      return;
    }

    setPendingSlug(post.slug);
    const result = await withLoading(() => trashJournalPostAction(post.slug), "trash-post");
    setPendingSlug(null);

    if (result.ok) {
      toast.success(result.message);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.message);
    }
  }

  async function onRestore(post: AdminJournalListItem) {
    setPendingSlug(post.slug);
    const result = await withLoading(() => restoreJournalPostAction(post.slug), "restore-post");
    setPendingSlug(null);

    if (result.ok) {
      toast.success(result.message);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.message);
    }
  }

  async function onDeletePermanently(post: AdminJournalListItem) {
    if (
      !window.confirm(
        `Permanently delete "${post.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setPendingSlug(post.slug);
    const result = await withLoading(() => deleteJournalPostAction(post.slug), "delete-post");
    setPendingSlug(null);

    if (result.ok) {
      toast.success(result.message);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.message);
    }
  }

  const filteredPosts = showTrashed
    ? posts.filter((p) => p.status === "trashed")
    : posts.filter((p) => p.status !== "trashed");

  return (
    <>
      <div className="mt-8 hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => {
              const variant =
                STATUS_VARIANT[post.status as keyof typeof STATUS_VARIANT] ?? "neutral";
              const isExpired = post.expires_at && new Date(post.expires_at) <= new Date();
              return (
                <TableRow key={post.slug}>
                  <TableCell className="font-medium text-foreground">
                    {post.title}
                    {isExpired && <span className="ml-2 text-fluid-xs text-muted">(expired)</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant} className="capitalize">
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{formatDate(post.published_at)}</TableCell>
                  <TableCell className="text-muted">{formatDate(post.expires_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {showTrashed ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pendingSlug === post.slug}
                            onClick={() => void onRestore(post)}
                          >
                            Restore
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={pendingSlug === post.slug}
                            onClick={() => void onDeletePermanently(post)}
                          >
                            Delete Forever
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="primary" size="sm">
                            <Link href={`/admin/journal/${post.slug}`}>Edit</Link>
                          </Button>
                          {post.status === "published" && !isExpired && (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/journal/${post.slug}`} target="_blank" rel="noreferrer">
                                Preview
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={pendingSlug === post.slug}
                            onClick={() => void onTrash(post)}
                          >
                            Trash
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="mt-8 flex flex-col gap-3 md:hidden">
        {filteredPosts.map((post) => {
          const variant =
            STATUS_VARIANT[post.status as keyof typeof STATUS_VARIANT] ?? "neutral";
          const isExpired = post.expires_at && new Date(post.expires_at) <= new Date();
          return (
            <li
              key={post.slug}
              className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {post.title}
                    {isExpired && <span className="ml-2 text-fluid-xs text-muted">(expired)</span>}
                  </p>
                  <p className="mt-1 text-fluid-sm text-muted">
                    Published: {formatDate(post.published_at)}
                  </p>
                  {post.expires_at && (
                    <p className="text-fluid-sm text-muted">
                      Expires: {formatDate(post.expires_at)}
                    </p>
                  )}
                </div>
                <Badge variant={variant} className="shrink-0 capitalize">
                  {post.status}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {showTrashed ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingSlug === post.slug}
                      onClick={() => void onRestore(post)}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pendingSlug === post.slug}
                      onClick={() => void onDeletePermanently(post)}
                    >
                      Delete Forever
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="primary" size="sm">
                      <Link href={`/admin/journal/${post.slug}`}>Edit</Link>
                    </Button>
                    {post.status === "published" && !isExpired && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/journal/${post.slug}`} target="_blank" rel="noreferrer">
                          Preview
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pendingSlug === post.slug}
                      onClick={() => void onTrash(post)}
                    >
                      Trash
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

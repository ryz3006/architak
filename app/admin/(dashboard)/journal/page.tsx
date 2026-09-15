import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { JournalList } from "@/components/admin/journal-list";
import { Button } from "@/components/admin/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { requireAdminSession } from "@/features/auth/session";
import { listAdminJournalPosts, getJournalSpaceUsage } from "@/features/journal/admin";
import { emptyTrashAction } from "@/features/journal/actions";
import { EmptyTrashButton } from "./_components/empty-trash-button";

export default async function AdminJournalPage() {
  await requireAdminSession();
  const [posts, usage] = await Promise.all([
    listAdminJournalPosts(),
    getJournalSpaceUsage(),
  ]);

  const activePosts = posts.filter((p) => p.status !== "trashed");
  const trashedPosts = posts.filter((p) => p.status === "trashed");

  return (
    <main id="main-content">
      <PageHeader
        title="Journal"
        description="Publish insights, case studies, and announcements with optional expiry."
        actions={
          <Button asChild>
            <Link href="/admin/journal/new">New post</Link>
          </Button>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          title="No journal posts yet"
          description="Create the first journal post to share insights and updates."
          action={
            <Button asChild>
              <Link href="/admin/journal/new">New post</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
              <p className="text-fluid-xs text-muted uppercase tracking-widest">Drafts</p>
              <p className="mt-1 text-display-sm font-bold">{usage.draftCount}</p>
            </div>
            <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
              <p className="text-fluid-xs text-muted uppercase tracking-widest">Published</p>
              <p className="mt-1 text-display-sm font-bold">{usage.publishedCount}</p>
            </div>
            <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
              <p className="text-fluid-xs text-muted uppercase tracking-widest">Trashed</p>
              <p className="mt-1 text-display-sm font-bold">{usage.trashedCount}</p>
            </div>
            <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
              <p className="text-fluid-xs text-muted uppercase tracking-widest">Est. Storage</p>
              <p className="mt-1 text-display-sm font-bold">
                {(usage.estimatedBytes / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-8">
            <TabsList>
              <TabsTrigger value="all">All Posts ({activePosts.length})</TabsTrigger>
              <TabsTrigger value="trash">Trash ({trashedPosts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <JournalList posts={posts} showTrashed={false} />
            </TabsContent>

            <TabsContent value="trash">
              {trashedPosts.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-fluid-sm text-muted">
                    {usage.trashPendingPurge > 0 && (
                      <>{usage.trashPendingPurge} post(s) will be auto-deleted after 7 days. </>
                    )}
                  </p>
                  <EmptyTrashButton action={emptyTrashAction} />
                </div>
              )}
              {trashedPosts.length === 0 ? (
                <EmptyState
                  title="Trash is empty"
                  description="Trashed posts appear here before permanent deletion."
                />
              ) : (
                <JournalList posts={posts} showTrashed={true} />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}

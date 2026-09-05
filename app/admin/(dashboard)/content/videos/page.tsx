import { VideosEditor } from "@/components/admin/content/videos-editor";
import { PageHeader } from "@/components/admin/page-header";
import { getVideosInput } from "@/features/content/admin";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminContentVideosPage() {
  await requireAdminSession();
  const videos = await getVideosInput();

  return (
    <main id="main-content">
      <PageHeader
        title="Videos"
        description="Manage the featured video reels shown on Home and Studio. Order controls playback sequence."
      />
      <VideosEditor initial={videos} />
    </main>
  );
}

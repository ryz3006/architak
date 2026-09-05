import { WebsiteManagementForm } from "@/components/admin/website-management-form";
import { resolvePublishedProjects } from "@/features/content/resolver";
import { getFeaturedWorkVideos } from "@/features/content/site-content";
import { getWebsiteSectionConfig } from "@/features/website/admin";
import { requireAdminSession } from "@/features/auth/session";

export default async function WebsiteManagementPage() {
  await requireAdminSession();
  const [config, projects, videoList] = await Promise.all([
    getWebsiteSectionConfig(),
    resolvePublishedProjects(),
    getFeaturedWorkVideos(),
  ]);
  const videos = videoList.map((v) => ({ id: v.id, title: v.title }));

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Website management</h1>
      <p className="measure mt-2 text-muted">
        Control which projects and videos appear on Home and Studio. Publish intentionally after
        reviewing selections.
      </p>
      <WebsiteManagementForm
        initialConfig={config}
        projectOptions={projects.map((p) => ({ slug: p.slug, title: p.title }))}
        videoOptions={videos}
      />
    </main>
  );
}

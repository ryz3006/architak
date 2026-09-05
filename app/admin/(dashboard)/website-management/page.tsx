import { WebsiteManagementForm } from "@/components/admin/website-management-form";
import { getFeaturedWorkVideos } from "@/content/static";
import { resolvePublishedProjects } from "@/features/content/resolver";
import { getWebsiteSectionConfig } from "@/features/website/admin";
import { requireAdminSession } from "@/features/auth/session";

export default async function WebsiteManagementPage() {
  await requireAdminSession();
  const [config, projects] = await Promise.all([
    getWebsiteSectionConfig(),
    resolvePublishedProjects(),
  ]);
  const videos = getFeaturedWorkVideos().map((v) => ({ id: v.id, title: v.title }));

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

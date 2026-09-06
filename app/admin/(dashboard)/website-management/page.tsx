import { PageHeader } from "@/components/admin/page-header";
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
      <PageHeader
        title="Placement"
        description="Choose which projects and videos appear on Home and Studio. Add from the dropdowns, then reorder or remove."
      />
      <WebsiteManagementForm
        initialConfig={config}
        projectOptions={projects.map((p) => ({ slug: p.slug, title: p.title }))}
        videoOptions={videos}
      />
    </main>
  );
}

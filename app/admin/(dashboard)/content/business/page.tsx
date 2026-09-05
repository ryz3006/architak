import { BusinessEditor } from "@/components/admin/content/business-editor";
import { PageHeader } from "@/components/admin/page-header";
import { getSocialsInput, getStudioInfoInput } from "@/features/content/admin";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminBusinessDetailsPage() {
  await requireAdminSession();
  const [studioInfo, socials] = await Promise.all([getStudioInfoInput(), getSocialsInput()]);

  return (
    <main id="main-content">
      <PageHeader
        title="Business details"
        description="Studio contact information and social profile links."
      />
      <BusinessEditor studioInfo={studioInfo} socials={socials} />
    </main>
  );
}

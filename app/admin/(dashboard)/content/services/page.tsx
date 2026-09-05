import { ServicesEditor } from "@/components/admin/content/services-editor";
import { PageHeader } from "@/components/admin/page-header";
import { getServicesListInput } from "@/features/content/admin";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminServicesListPage() {
  await requireAdminSession();
  const services = await getServicesListInput();

  return (
    <main id="main-content">
      <PageHeader
        title="Services list"
        description="The discipline cards shown on the Services and Home pages."
      />
      <ServicesEditor initial={services} />
    </main>
  );
}

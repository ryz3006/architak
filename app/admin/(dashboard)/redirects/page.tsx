import { ArrowLeftRight } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminRedirectsPage() {
  await requireAdminSession();

  return (
    <main id="main-content">
      <PageHeader title="Redirects" description="Forward old or vanity URLs to their new destinations." />
      <EmptyState
        icon={ArrowLeftRight}
        title="Redirect management is being set up"
        description="This section will let you create and manage URL redirects. It is enabled in the content phase of the redesign."
      />
    </main>
  );
}

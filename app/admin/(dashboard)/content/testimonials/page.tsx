import { TestimonialsEditor } from "@/components/admin/content/testimonials-editor";
import { PageHeader } from "@/components/admin/page-header";
import { getTestimonialsInput } from "@/features/content/admin";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminContentTestimonialsPage() {
  await requireAdminSession();
  const testimonials = await getTestimonialsInput();

  return (
    <main id="main-content">
      <PageHeader
        title="Testimonials"
        description="Client voices shown on the Studio page. These are used when a project has no specific testimonial."
      />
      <TestimonialsEditor initial={testimonials} />
    </main>
  );
}

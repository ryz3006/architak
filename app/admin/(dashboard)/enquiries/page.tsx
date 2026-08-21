import { requireAdminSession } from "@/features/auth/session";
import { listAdminEnquiries } from "@/features/enquiries/admin";

export default async function AdminEnquiriesPage() {
  await requireAdminSession();
  const enquiries = await listAdminEnquiries();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Leads</h1>
      <p className="mt-2 text-muted">Enquiries from the public contact form.</p>

      {enquiries.length === 0 ? (
        <div className="mt-12 border border-border p-8">
          <h2 className="display text-fluid-xl">Inbox is empty</h2>
          <p className="measure mt-3 text-muted">
            When someone submits the contact form, the lead appears here with status history.
          </p>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="border border-border p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="display text-fluid-xl">{enquiry.name}</h2>
                <span className="text-fluid-xs tracking-widest text-muted uppercase">
                  {enquiry.status}
                </span>
              </div>
              <p className="mt-2 text-fluid-sm text-muted">
                {[enquiry.email, enquiry.phone].filter(Boolean).join(" · ")}
              </p>
              <p className="measure mt-4 text-fluid-sm">{enquiry.message}</p>
              <p className="mt-3 text-fluid-xs text-muted">
                {new Date(enquiry.created_at).toLocaleString("en-IN")}
                {enquiry.source_page ? ` · ${enquiry.source_page}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

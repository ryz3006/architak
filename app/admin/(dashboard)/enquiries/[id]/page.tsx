import Link from "next/link";
import { notFound } from "next/navigation";

import { EnquiryDetailActions } from "@/components/admin/enquiry-detail-actions";
import { getAdminEnquiry, projectSlugFromSource } from "@/features/enquiries/admin";
import { requireAdminSession } from "@/features/auth/session";

type Props = { params: Promise<{ id: string }> };

export default async function EnquiryDetailPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;
  const { enquiry, events } = await getAdminEnquiry(id);
  if (!enquiry) notFound();

  const projectSlug = projectSlugFromSource(enquiry.source_page);
  const received = new Date(enquiry.created_at);

  return (
    <main id="main-content">
      <Link href="/admin/enquiries" className="text-fluid-sm text-accent">
        ← Enquiries
      </Link>
      <h1 className="display mt-4 text-display-md">{enquiry.name}</h1>
      <p className="mt-2 text-fluid-xs tracking-widest text-muted uppercase">
        {enquiry.status.replace("_", " ")}
      </p>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-fluid-xs tracking-widest text-muted uppercase">Customer</h2>
          <dl className="mt-4 space-y-4 text-fluid-sm">
            {enquiry.email ? (
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="mt-1 flex flex-wrap gap-3">
                  <a href={`mailto:${enquiry.email}`} className="text-accent">
                    {enquiry.email}
                  </a>
                  <button
                    type="button"
                    className="text-muted underline"
                    // copy handled via native selection on mobile; keep mailto primary
                  >
                    {/* placeholder for SSR-safe link */}
                  </button>
                </dd>
              </div>
            ) : null}
            {enquiry.phone ? (
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="mt-1">
                  <a href={`tel:${enquiry.phone.replace(/\s/g, "")}`} className="text-accent">
                    {enquiry.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted">Received</dt>
              <dd className="mt-1">{received.toLocaleString("en-IN")}</dd>
            </div>
            <div>
              <dt className="text-muted">Source</dt>
              <dd className="mt-1">{enquiry.source_page || "Not specified"}</dd>
            </div>
            {projectSlug ? (
              <div>
                <dt className="text-muted">Project</dt>
                <dd className="mt-1">
                  <Link href={`/work/${projectSlug}`} className="text-accent" target="_blank">
                    {projectSlug}
                  </Link>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {enquiry.phone ? (
              <a
                href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
                className="min-h-11 border border-border px-4 py-2 text-fluid-xs tracking-widest uppercase"
              >
                Call
              </a>
            ) : null}
            {enquiry.email ? (
              <a
                href={`mailto:${enquiry.email}`}
                className="min-h-11 border border-border px-4 py-2 text-fluid-xs tracking-widest uppercase"
              >
                Email
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-fluid-xs tracking-widest text-muted uppercase">Message</h2>
          <p className="measure mt-4 whitespace-pre-wrap text-fluid-sm">{enquiry.message}</p>
        </div>
      </section>

      <EnquiryDetailActions id={enquiry.id} status={enquiry.status} />

      <section className="mt-12">
        <h2 className="display text-fluid-xl">Timeline</h2>
        {events.length === 0 ? (
          <p className="mt-4 text-fluid-sm text-muted">No events yet.</p>
        ) : (
          <ol className="mt-6 space-y-4 border-l border-border pl-6">
            {events.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[1.55rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-fluid-xs text-muted">
                  {new Date(event.created_at).toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-fluid-sm">
                  {event.event_type === "status_changed"
                    ? `${event.from_status} → ${event.to_status}`
                    : event.event_type === "note_added"
                      ? event.note
                      : event.event_type.replace(/_/g, " ")}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

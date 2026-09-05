import Link from "next/link";

import { listAdminEnquiries } from "@/features/enquiries/admin";
import { requireAdminSession } from "@/features/auth/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const search = param(params.q);
  const status = (param(params.status) as "all" | undefined) ?? "all";
  const page = Number(param(params.page) ?? "1") || 1;

  const { items, total, pageSize } = await listAdminEnquiries({
    search,
    status: status === "all" ? "all" : (status as never),
    page,
    pageSize: 25,
    sort: "newest",
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main id="main-content">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-display-md">Enquiries</h1>
          <p className="mt-2 text-muted">Customer leads from the public contact form.</p>
        </div>
        <a
          href={`/api/admin/enquiries/export?${(() => {
            const params = new URLSearchParams();
            if (search) params.set("q", search);
            if (status !== "all") params.set("status", status);
            return params.toString();
          })()}`}
          className="min-h-11 border border-foreground px-5 py-2 text-fluid-sm tracking-widest uppercase"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" method="get">
        <input
          name="q"
          defaultValue={search ?? ""}
          placeholder="Search name, email, phone, message"
          className="min-h-11 flex-1 border border-border bg-surface px-4 py-2"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-11 border border-border bg-surface px-4 py-2"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in_discussion">In discussion</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
          <option value="spam">Spam</option>
        </select>
        <button
          type="submit"
          className="min-h-11 border border-border px-5 py-2 text-fluid-xs tracking-widest uppercase"
        >
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <div className="mt-12 border border-border p-8">
          <h2 className="display text-fluid-xl">Inbox is empty</h2>
          <p className="measure mt-3 text-muted">
            When someone submits the contact form, the lead appears here with status history.
          </p>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {items.map((enquiry) => (
            <li key={enquiry.id} className="border border-border p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/admin/enquiries/${enquiry.id}`}
                  className="display text-fluid-xl hover:text-accent"
                >
                  {enquiry.name}
                </Link>
                <span className="text-fluid-xs tracking-widest text-muted uppercase">
                  {enquiry.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-fluid-sm text-muted">
                {[enquiry.email, enquiry.phone].filter(Boolean).join(" · ")}
              </p>
              <p className="measure mt-4 line-clamp-3 text-fluid-sm">{enquiry.message}</p>
              <p className="mt-3 text-fluid-xs text-muted">
                {new Date(enquiry.created_at).toLocaleString("en-IN")}
                {enquiry.source_page ? ` · ${enquiry.source_page}` : ""}
              </p>
              <Link
                href={`/admin/enquiries/${enquiry.id}`}
                className="mt-4 inline-block text-fluid-sm text-accent"
              >
                View lead →
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="mt-8 flex gap-3" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={`/admin/enquiries?page=${page - 1}${search ? `&q=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
              className="min-h-11 border border-border px-4 py-2 text-fluid-xs uppercase"
            >
              Previous
            </Link>
          ) : null}
          <span className="py-2 text-fluid-sm text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/enquiries?page=${page + 1}${search ? `&q=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
              className="min-h-11 border border-border px-4 py-2 text-fluid-xs uppercase"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

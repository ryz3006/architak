import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { listAdminEnquiries } from "@/features/enquiries/admin";
import { applySecurityHeaders } from "@/lib/security/headers";
import type { EnquiryStatus } from "@/lib/supabase/database.types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const status = (searchParams.get("status") as EnquiryStatus | "all" | null) ?? "all";
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const { items } = await listAdminEnquiries({
    search,
    status,
    from,
    to,
    page: 1,
    pageSize: 50,
    sort: "newest",
  });

  // Paginate through remaining pages for export
  const all = [...items];
  let page = 2;
  while (all.length % 50 === 0 && items.length > 0) {
    const next = await listAdminEnquiries({
      search,
      status,
      from,
      to,
      page,
      pageSize: 50,
      sort: "newest",
    });
    if (next.items.length === 0) break;
    all.push(...next.items);
    page += 1;
    if (page > 100) break;
  }

  const header = [
    "Lead ID",
    "Name",
    "Email",
    "Phone",
    "Message",
    "Source",
    "Status",
    "Created Date",
    "Created Time",
  ];

  const rows = all.map((row) => {
    const created = new Date(row.created_at);
    return [
      row.id,
      row.name,
      row.email ?? "",
      row.phone ?? "",
      row.message,
      row.source_page ?? "",
      row.status,
      created.toLocaleDateString("en-IN"),
      created.toLocaleTimeString("en-IN"),
    ].map((cell) => csvEscape(String(cell)));
  });

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return applySecurityHeaders(
    new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="architak-enquiries.csv"`,
      },
    }),
  );
}

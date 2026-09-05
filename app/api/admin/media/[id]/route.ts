import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { deleteMediaAsset, getMediaUsages } from "@/features/media/admin";
import { applySecurityHeaders } from "@/lib/security/headers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const { id } = await params;
  const usages = await getMediaUsages(id);
  return applySecurityHeaders(NextResponse.json({ ok: true, usages }));
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const { id } = await params;
  let force = false;
  try {
    const body = (await request.json()) as { force?: boolean };
    force = Boolean(body.force);
  } catch {
    force = false;
  }

  const result = await deleteMediaAsset(id, { force });
  return applySecurityHeaders(NextResponse.json(result, { status: result.ok ? 200 : 400 }));
}

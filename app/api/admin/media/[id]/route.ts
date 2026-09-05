import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { deleteMediaAsset, getMediaUsages } from "@/features/media/admin";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest } from "@/lib/security/client-ip";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: Params) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return applySecurityHeaders(
      NextResponse.json({ ok: false, message: "Invalid media id." }, { status: 400 }),
    );
  }

  const usages = await getMediaUsages(id);
  return applySecurityHeaders(NextResponse.json({ ok: true, usages }));
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const ip = getClientIpFromRequest(request);
  const limit = checkRateLimit(`admin-media-delete:${auth.username}:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return applySecurityHeaders(
      NextResponse.json(
        { ok: false, message: "Too many delete requests. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
        },
      ),
    );
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return applySecurityHeaders(
      NextResponse.json({ ok: false, message: "Invalid media id." }, { status: 400 }),
    );
  }

  let force = false;
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      force = Boolean((body as { force?: unknown }).force);
    }
  } catch {
    force = false;
  }

  const result = await deleteMediaAsset(id, { force });
  return applySecurityHeaders(NextResponse.json(result, { status: result.ok ? 200 : 400 }));
}

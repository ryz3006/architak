import { NextResponse } from "next/server";

import { applySecurityHeaders } from "@/lib/security/headers";

export function GET() {
  const response = NextResponse.json({
    ok: true,
    service: "architak",
    timestamp: new Date().toISOString(),
  });
  return applySecurityHeaders(response);
}

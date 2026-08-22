interface R2HttpMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

interface R2Object {
  etag: string;
  httpEtag: string;
  size: number;
  uploaded: Date;
  httpMetadata?: R2HttpMetadata;
  writeHttpMetadata(headers: Headers): void;
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream<Uint8Array>;
}

interface R2GetOptions {
  range?: {
    offset: number;
    length?: number;
  };
}

interface R2Bucket {
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
  head(key: string): Promise<R2Object | null>;
}

interface Env {
  MEDIA_BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
}

const PUBLIC_PREFIX = "public/";
const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

function responseHeaders(request: Request, env: Env): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, HEAD",
    "Access-Control-Expose-Headers":
      "Content-Length, Content-Type, ETag, Last-Modified, Content-Range, Accept-Ranges",
    "Cache-Control": CACHE_CONTROL,
    "Cross-Origin-Resource-Policy": "cross-origin",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });

  const origin = request.headers.get("Origin");
  if (origin) {
    headers.set("Vary", "Origin");
    const allowedOrigins = new Set(
      env.ALLOWED_ORIGINS.split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );
    if (allowedOrigins.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

function rawPathname(url: string): string | null {
  const schemeEnd = url.indexOf("://");
  if (schemeEnd === -1) return null;
  const pathStart = url.indexOf("/", schemeEnd + 3);
  if (pathStart === -1) return "/";
  const suffixStart = url.slice(pathStart).search(/[?#]/);
  return suffixStart === -1 ? url.slice(pathStart) : url.slice(pathStart, pathStart + suffixStart);
}

function publicKey(request: Request): string | null {
  const rawPath = rawPathname(request.url);
  if (!rawPath || rawPath.includes("\\") || /%(?:2f|5c|00)/i.test(rawPath)) return null;

  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return null;
  }

  if (!decodedPath.startsWith(`/${PUBLIC_PREFIX}`)) return null;
  if (/[\u0000-\u001f\u007f]/.test(decodedPath)) return null;

  const segments = decodedPath.slice(1).split("/");
  if (
    segments.length < 3 ||
    segments.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        /%[0-9a-f]{2}/i.test(segment),
    )
  ) {
    return null;
  }

  const key = segments.join("/");
  return key.startsWith(PUBLIC_PREFIX) ? key : null;
}

function errorResponse(request: Request, env: Env, status: number, message: string): Response {
  const headers = responseHeaders(request, env);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(message, { status, headers });
}

function applyObjectHeaders(headers: Headers, object: R2Object, contentLength?: number): void {
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", CACHE_CONTROL);
  headers.set("Content-Length", String(contentLength ?? object.size));
  headers.set("ETag", object.httpEtag);
  headers.set("Last-Modified", object.uploaded.toUTCString());
  headers.set("Accept-Ranges", "bytes");
}

function parseRangeHeader(rangeHeader: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;

  const startRaw = match[1];
  const endRaw = match[2];

  if (startRaw === "" && endRaw === "") return null;

  let start = startRaw === "" ? Math.max(0, size - Number(endRaw)) : Number(startRaw);
  let end = endRaw === "" ? size - 1 : Number(endRaw);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0 || end < start || start >= size) return null;

  end = Math.min(end, size - 1);
  return { start, end };
}

async function serveObject(
  request: Request,
  env: Env,
  key: string,
  method: "GET" | "HEAD",
): Promise<Response> {
  const head = await env.MEDIA_BUCKET.head(key);
  if (!head) return errorResponse(request, env, 404, "Not Found");

  const rangeHeader = request.headers.get("Range");
  const parsedRange = rangeHeader ? parseRangeHeader(rangeHeader, head.size) : null;

  if (rangeHeader && !parsedRange) {
    const headers = responseHeaders(request, env);
    headers.set("Content-Range", `bytes */${head.size}`);
    return new Response("Range Not Satisfiable", { status: 416, headers });
  }

  if (method === "HEAD") {
    const headers = responseHeaders(request, env);
    if (parsedRange) {
      const length = parsedRange.end - parsedRange.start + 1;
      applyObjectHeaders(headers, head, length);
      headers.set("Content-Range", `bytes ${parsedRange.start}-${parsedRange.end}/${head.size}`);
      return new Response(null, { status: 206, headers });
    }
    applyObjectHeaders(headers, head);
    return new Response(null, { status: 200, headers });
  }

  if (parsedRange) {
    const length = parsedRange.end - parsedRange.start + 1;
    const object = await env.MEDIA_BUCKET.get(key, {
      range: { offset: parsedRange.start, length },
    });
    if (!object) return errorResponse(request, env, 404, "Not Found");

    const headers = responseHeaders(request, env);
    applyObjectHeaders(headers, object, length);
    headers.set("Content-Range", `bytes ${parsedRange.start}-${parsedRange.end}/${head.size}`);
    return new Response(object.body, { status: 206, headers });
  }

  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) return errorResponse(request, env, 404, "Not Found");

  const headers = responseHeaders(request, env);
  applyObjectHeaders(headers, object);
  return new Response(object.body, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      const response = errorResponse(request, env, 405, "Method Not Allowed");
      response.headers.set("Allow", "GET, HEAD");
      return response;
    }

    const key = publicKey(request);
    if (!key) return errorResponse(request, env, 404, "Not Found");

    return serveObject(request, env, key, request.method);
  },
};

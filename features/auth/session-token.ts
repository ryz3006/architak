export type SessionPayload = {
  /** Username. */
  u: string;
  /** Issued-at (unix seconds). Anchors the absolute-expiry window. */
  iat: number;
  /** Absolute expiry (unix seconds). */
  exp: number;
  /** Idle expiry (unix seconds). Refreshed on activity for sliding sessions. */
  idle: number;
  /** Session epoch/version for "sign out everywhere" revocation. */
  v: number;
};

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short");
  }
  return secret;
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function base64UrlToBytes(value: string): Uint8Array {
  const binary = fromBase64Url(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return toBase64Url(binary);
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

async function hmacSign(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(signature);
}

export async function encodeSession(
  payload: SessionPayload,
  secret = getSessionSecret(),
): Promise<string> {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = await hmacSign(body, secret);
  return `${body}.${signature}`;
}

export async function decodeSession(
  token: string | undefined,
  secret = getSessionSecret(),
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = await hmacSign(body, secret);
  const a = base64UrlToBytes(signature);
  const b = base64UrlToBytes(expected);
  if (!timingSafeEqualBytes(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(body)) as Partial<SessionPayload>;
    if (typeof parsed.u !== "string" || typeof parsed.exp !== "number") {
      return null;
    }
    const now = Date.now();
    // Absolute expiry.
    if (parsed.exp * 1000 < now) {
      return null;
    }
    // Idle expiry (sliding). Tokens without an idle claim are rejected so a
    // deploy that introduces the field forces a clean re-login.
    if (typeof parsed.idle !== "number" || parsed.idle * 1000 < now) {
      return null;
    }
    return {
      u: parsed.u,
      iat: typeof parsed.iat === "number" ? parsed.iat : Math.floor(now / 1000),
      exp: parsed.exp,
      idle: parsed.idle,
      v: typeof parsed.v === "number" ? parsed.v : 0,
    };
  } catch {
    return null;
  }
}

export function idleTimeoutSeconds(): number {
  const minutes = Number(process.env.SESSION_IDLE_TIMEOUT_MINUTES) || 30;
  return minutes * 60;
}

export function absoluteTimeoutSeconds(): number {
  const hours = Number(process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS) || 12;
  return hours * 60 * 60;
}

/**
 * Re-issue a token with a refreshed idle window (sliding session), never
 * extending past the absolute expiry. Isomorphic so the edge proxy can call it.
 */
export async function refreshSession(
  payload: SessionPayload,
  secret = getSessionSecret(),
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const nextIdle = Math.min(now + idleTimeoutSeconds(), payload.exp);
  return encodeSession({ ...payload, idle: nextIdle }, secret);
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) {
    return false;
  }
  return timingSafeEqualBytes(aBytes, bBytes);
}

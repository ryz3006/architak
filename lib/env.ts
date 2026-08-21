import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  ADMIN_BASE_PATH: z.string().default("/admin"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),

  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_SESSION_SECRET: z.string().min(32),

  CLOUDFLARE_ACCOUNT_ID: z.string().default(""),
  R2_ACCESS_KEY_ID: z.string().default(""),
  R2_SECRET_ACCESS_KEY: z.string().default(""),
  R2_BUCKET_NAME: z.string().default("architak-media"),
  R2_ENDPOINT: z.union([z.string().url(), z.literal("")]).default(""),
  R2_PUBLIC_BASE_URL: z.union([z.string().url(), z.literal("")]).default(""),

  CONTACT_PHONE: z.string().default("+918891991999"),
  CONTACT_EMAIL: z.string().email().default("architak336@gmail.com"),
  CONTACT_WHATSAPP: z.string().default("+918891991999"),

  DISCOVERY_AI_CRAWLERS_ALLOW: z.string().default(
    "Googlebot,Google-Extended,Bingbot,GPTBot,ChatGPT-User,OAI-SearchBot,ClaudeBot,PerplexityBot,Applebot",
  ),
  DISCOVERY_AI_CRAWLERS_DENY: z.string().default(""),
  DISCOVERY_LLMS_FULL_ENABLED: booleanFromString,
  DISCOVERY_PUBLIC_API_ENABLED: booleanFromString,

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  FEATURE_JOURNAL_NAV: booleanFromString,
  FEATURE_THREE_D: booleanFromString,
});

export type ServerEnv = z.infer<typeof serverSchema>;

export type PublicEnv = {
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
};

let cached: ServerEnv | null = null;

function readRawEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    ADMIN_BASE_PATH: process.env.ADMIN_BASE_PATH,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
    CONTACT_PHONE: process.env.CONTACT_PHONE,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    CONTACT_WHATSAPP: process.env.CONTACT_WHATSAPP,
    DISCOVERY_AI_CRAWLERS_ALLOW: process.env.DISCOVERY_AI_CRAWLERS_ALLOW,
    DISCOVERY_AI_CRAWLERS_DENY: process.env.DISCOVERY_AI_CRAWLERS_DENY,
    DISCOVERY_LLMS_FULL_ENABLED: process.env.DISCOVERY_LLMS_FULL_ENABLED,
    DISCOVERY_PUBLIC_API_ENABLED: process.env.DISCOVERY_PUBLIC_API_ENABLED,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    FEATURE_JOURNAL_NAV: process.env.FEATURE_JOURNAL_NAV,
    FEATURE_THREE_D: process.env.FEATURE_THREE_D,
  };
}

/**
 * Fail-closed server env. Call only from server code.
 * Missing required values throw — never silently continue with empty secrets.
 */
export function getServerEnv(): ServerEnv {
  if (cached) {
    return cached;
  }

  const parsed = serverSchema.safeParse(readRawEnv());
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  cached = parsed.data;
  return cached;
}

/** Browser-safe public values only. */
export function getPublicEnv(): PublicEnv {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!siteUrl || !supabaseUrl || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  };
}

export function getAdminBasePath(): string {
  return process.env.ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
}

export function isR2Configured(): boolean {
  const env = getServerEnv();
  return Boolean(
    env.CLOUDFLARE_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_ENDPOINT,
  );
}

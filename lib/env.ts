import { z } from "zod";

const CANONICAL_APP_ORIGIN = "https://world-break.vercel.app";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

export const env = parsedEnv.success ? parsedEnv.data : null;

export const isSupabaseConfigured = Boolean(
  env?.NEXT_PUBLIC_SUPABASE_URL && env?.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function isLocalHost(host: string) {
  const normalizedHost = host.toLowerCase();
  return (
    normalizedHost === "localhost" ||
    normalizedHost.startsWith("localhost:") ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost.startsWith("127.0.0.1:") ||
    normalizedHost === "[::1]" ||
    normalizedHost.startsWith("[::1]:")
  );
}

export function requireEnv() {
  if (!parsedEnv.success) {
    throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
  }

  return parsedEnv.data;
}

export function getSafeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function getAuthCallbackOrigin(headers: Pick<Headers, "get">) {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");

  if (!host) {
    return process.env.NODE_ENV === "development" ? null : CANONICAL_APP_ORIGIN;
  }

  if (!isLocalHost(host)) {
    return CANONICAL_APP_ORIGIN;
  }

  const proto = headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

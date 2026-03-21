import { createHash } from "crypto";

export const GUEST_COOKIE = "wb_guest_token";
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type GuestUserRow = {
  id: string;
};

export function createGuestToken() {
  return crypto.randomUUID();
}

/** SHA-256 hash of the raw cookie token — stored in DB, never the raw value */
export function hashGuestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getGuestCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  };
}

import { prisma } from "@/lib/prisma";

export async function findGuestUserByToken(token: string) {
  return prisma.user.findUnique({
    where: { guestTokenHash: hashGuestToken(token) },
    select: { id: true },
  });
}

export async function ensureGuestUserByToken(token: string): Promise<GuestUserRow> {
  const hashed = hashGuestToken(token);
  // upsert: atomic — pgbouncer(Transaction Pooler) 환경에서 create+retry 경쟁 조건 방지
  return prisma.user.upsert({
    where: { guestTokenHash: hashed },
    update: {},
    create: {
      id: crypto.randomUUID(),
      guestTokenHash: hashed,
    },
    select: {
      id: true,
    },
  });
}

export const GUEST_COOKIE = "wb_guest_token";
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type GuestUserRow = {
  id: string;
  email: string;
  name: string | null;
  isGuest: boolean;
  guestToken: string | null;
};

export function createGuestToken() {
  return crypto.randomUUID();
}

export function buildGuestEmail(token: string) {
  return `guest_${token.replace(/-/g, "")}@local.guest`;
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
    where: {
      guestToken: token,
    },
    select: {
      id: true,
      email: true,
      name: true,
      isGuest: true,
      guestToken: true,
    },
  });
}

export async function ensureGuestUserByToken(token: string): Promise<GuestUserRow> {
  const existing = await findGuestUserByToken(token);

  if (existing) {
    return existing;
  }

  try {
    return await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: buildGuestEmail(token),
        name: "게스트",
        isGuest: true,
        guestToken: token,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isGuest: true,
        guestToken: true,
      },
    });
  } catch (error) {
    const isUniqueViolation =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002";

    if (!isUniqueViolation) {
      throw error;
    }

    const retry = await findGuestUserByToken(token);

    if (retry) {
      return retry;
    }

    throw error;
  }
}

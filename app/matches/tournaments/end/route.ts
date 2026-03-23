import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { encodeJsonBase64Url } from "@/lib/base64url";
import { isSupabaseConfigured } from "@/lib/env";
import { GUEST_COOKIE, findGuestUserByToken } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { tournamentSessionIdSchema } from "@/lib/validation/match";

export const runtime = "nodejs";

async function resolveUserId(): Promise<string | null> {
  // 1. Supabase auth
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return user.id;
      }
    } catch {
      // Supabase auth 오류 — 게스트 폴백
    }
  }

  // 2. Guest cookie
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_COOKIE)?.value ?? null;

  if (guestToken) {
    const guest = await findGuestUserByToken(guestToken);
    if (guest) {
      return guest.id;
    }
  }

  return null;
}

export async function POST(request: Request) {
  const userId = await resolveUserId();

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const tournamentSessionId = String(formData.get("tournamentSessionId") || "");

  if (!tournamentSessionIdSchema.safeParse(tournamentSessionId).success) {
    return NextResponse.redirect(new URL("/matches?error=tournament_not_found", request.url), 303);
  }

  const result = await prisma.tournamentSession.updateMany({
    where: {
      id: tournamentSessionId,
      userId,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  });

  if (result.count === 0) {
    return NextResponse.redirect(new URL("/matches?error=tournament_not_found", request.url), 303);
  }

  // Fetch tournament stats for GA4 event params
  const stats = await prisma.matchResult.aggregate({
    where: { tournamentSessionId, userId },
    _count: { id: true },
    _sum: { wins: true, losses: true },
  });

  const ep = encodeJsonBase64Url({
    total_rounds: String(stats._count.id),
    wins: String(stats._sum.wins ?? 0),
    losses: String(stats._sum.losses ?? 0),
  });

  revalidatePath("/matches");
  revalidatePath("/matches/new");

  const redirectUrl = new URL("/matches", request.url);
  redirectUrl.searchParams.set("message", "tournament_ended");
  redirectUrl.searchParams.set("ep", ep);

  return NextResponse.redirect(redirectUrl, 303);
}

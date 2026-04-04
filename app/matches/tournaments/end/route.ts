import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

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

  revalidatePath("/matches");
  revalidatePath("/matches/new");

  return NextResponse.redirect(
    new URL(`/matches/tournaments/${tournamentSessionId}/result`, request.url),
    303,
  );
}

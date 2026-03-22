import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { tournamentSessionIdSchema } from "@/lib/validation/match";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const tournamentSessionId = String(formData.get("tournamentSessionId") || "");

  if (!tournamentSessionIdSchema.safeParse(tournamentSessionId).success) {
    return NextResponse.redirect(new URL("/matches?error=tournament_not_found", request.url));
  }

  const result = await prisma.tournamentSession.updateMany({
    where: {
      id: tournamentSessionId,
      userId: user.id,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  });

  if (result.count === 0) {
    return NextResponse.redirect(new URL("/matches?error=tournament_not_found", request.url));
  }

  // Fetch tournament stats for GA4 event params
  const stats = await prisma.matchResult.aggregate({
    where: { tournamentSessionId, userId: user.id },
    _count: { id: true },
    _sum: { wins: true, losses: true },
  });

  const ep = btoa(JSON.stringify({
    total_rounds: String(stats._count.id),
    wins: String(stats._sum.wins ?? 0),
    losses: String(stats._sum.losses ?? 0),
  }));

  revalidatePath("/matches");
  revalidatePath("/matches/new");

  const redirectUrl = new URL("/matches", request.url);
  redirectUrl.searchParams.set("message", "tournament_ended");
  redirectUrl.searchParams.set("ep", ep);

  return NextResponse.redirect(redirectUrl);
}

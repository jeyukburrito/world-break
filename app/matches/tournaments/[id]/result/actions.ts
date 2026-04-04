"use server";

import { revalidatePath } from "next/cache";

import { isSupabaseConfigured } from "@/lib/env";
import { renderTournamentScorecard } from "@/lib/og/render-scorecard";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAuthenticatedUserId() {
  if (!isSupabaseConfigured) {
    throw new Error("로그인이 필요합니다");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("로그인이 필요합니다");
  }

  return user.id;
}

export async function saveTournamentScorecard(
  sessionId: string,
): Promise<{ scorecardUrl: string }> {
  const userId = await requireAuthenticatedUserId();
  const session = await prisma.tournamentSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      myDeck: {
        include: {
          game: true,
        },
      },
      matches: {
        orderBy: {
          playedAt: "asc",
        },
      },
    },
  });

  if (!session) {
    throw new Error("대회를 찾을 수 없습니다");
  }

  try {
    const pngBuffer = await renderTournamentScorecard({
      name: session.name,
      playedOn: session.playedOn,
      myDeck: {
        name: session.myDeck.name,
        game: {
          name: session.myDeck.game.name,
        },
      },
      matches: session.matches.map((match) => ({
        opponentDeckName: match.opponentDeckName,
        wins: match.wins,
        losses: match.losses,
        isMatchWin: match.isMatchWin,
      })),
    });

    const supabase = createAdminClient();
    const filePath = `${userId}/${sessionId}.png`;
    const storage = supabase.storage.from("tournament-scorecards");
    const { error: uploadError } = await storage.upload(filePath, pngBuffer, {
      contentType: "image/png",
      upsert: true,
    });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = storage.getPublicUrl(filePath);

    const updateResult = await prisma.tournamentSession.updateMany({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        scorecardUrl: publicUrl,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("대회를 찾을 수 없습니다");
    }

    revalidatePath(`/matches/tournaments/${sessionId}/result`);
    revalidatePath("/matches");

    return { scorecardUrl: publicUrl };
  } catch (error) {
    console.error("[saveTournamentScorecard] failed:", error);
    throw new Error("성적표 저장에 실패했습니다");
  }
}

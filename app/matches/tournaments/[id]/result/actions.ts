"use server";

import { revalidatePath } from "next/cache";

import { isSupabaseConfigured } from "@/lib/env";
import { renderTournamentScorecard } from "@/lib/og/render-scorecard";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAuthenticatedUserId() {
  if (!isSupabaseConfigured) {
    throw new Error("로그인이 필요합니다.");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("로그인이 필요합니다.");
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
    throw new Error("대회 기록을 찾을 수 없습니다.");
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

    const supabase = (() => {
      try {
        return createAdminClient();
      } catch (error) {
        console.error("[saveTournamentScorecard] admin client failed:", error);
        throw new Error(
          "성적표 저장 기능을 사용하려면 Supabase에 SUPABASE_SERVICE_ROLE_KEY를 설정해야 합니다.",
        );
      }
    })();
    const storage = supabase.storage.from("tournament-scorecards");

    const filePath = `${userId}/${sessionId}.png`;
    const { error: uploadError } = await storage.upload(filePath, pngBuffer, {
      contentType: "image/png",
      upsert: true,
    });

    if (uploadError) {
      console.error("[saveTournamentScorecard] storage upload failed:", uploadError);
      const message = uploadError.message.toLowerCase();
      if (message.includes("bucket") || message.includes("not found")) {
        throw new Error(
          "tournament-scorecards 저장소 버킷이 없습니다. Supabase Storage에서 버킷을 생성하세요.",
        );
      }

      throw new Error("성적표 저장에 실패했습니다.");
    }

    const updateResult = await prisma.tournamentSession.updateMany({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        scorecardUrl: filePath, // Store the relative path instead of public URL
      },
    });

    if (updateResult.count === 0) {
      throw new Error("대회 기록을 찾을 수 없습니다.");
    }

    revalidatePath(`/matches/tournaments/${sessionId}/result`);
    revalidatePath("/matches");

    return { scorecardUrl: filePath };
  } catch (error) {
    console.error("[saveTournamentScorecard] failed:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("성적표 저장에 실패했습니다.");
  }
}

export async function getScorecardSignedUrl(
  path: string,
): Promise<{ signedUrl: string }> {
  const userId = await requireAuthenticatedUserId();

  // Ensure user owns the path
  if (!path.startsWith(`${userId}/`)) {
    throw new Error("접근 권한이 없습니다.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("tournament-scorecards")
    .createSignedUrl(path, 3600); // 1 hour

  if (error || !data?.signedUrl) {
    console.error("[getScorecardSignedUrl] failed:", error);
    throw new Error("이미지 주소 생성에 실패했습니다.");
  }

  return { signedUrl: data.signedUrl };
}

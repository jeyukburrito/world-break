"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { revalidateDashboard } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { matchResultSchema } from "@/lib/validation/match";

function matchesRedirect(type: "error" | "message", value: string) {
  return `/matches?${type}=${encodeURIComponent(value)}`;
}

function newMatchRedirect(type: "error" | "message", value: string) {
  return `/matches/new?${type}=${encodeURIComponent(value)}`;
}

function editRedirect(matchId: string, type: "error" | "message", value: string) {
  return `/matches/${matchId}/edit?${type}=${encodeURIComponent(value)}`;
}

function dateRangeForDay(value: string) {
  const start = new Date(`${value}T00:00:00`);
  const end = new Date(`${value}T00:00:00`);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

async function resolveGameAndDeck(userId: string, gameName: string, deckName: string) {
  const game = await prisma.game.upsert({
    where: { userId_name: { userId, name: gameName } },
    update: {},
    create: { userId, name: gameName },
    select: { id: true },
  });

  const deck = await prisma.deck.upsert({
    where: { userId_gameId_name: { userId, gameId: game.id, name: deckName } },
    update: {},
    create: { userId, gameId: game.id, name: deckName },
    select: { id: true },
  });

  return { gameId: game.id, deckId: deck.id };
}

async function ensureOwnedTags(userId: string, tagIds: string[]) {
  if (tagIds.length === 0) {
    return [];
  }

  return prisma.tag.findMany({
    where: {
      userId,
      id: {
        in: tagIds,
      },
    },
    select: {
      id: true,
    },
  });
}

function deriveScore(matchFormat: "bo1" | "bo3", result: "win" | "lose") {
  if (matchFormat === "bo1") {
    return result === "win" ? { wins: 1, losses: 0 } : { wins: 0, losses: 1 };
  }

  return result === "win" ? { wins: 2, losses: 1 } : { wins: 1, losses: 2 };
}

function parseMatchForm(formData: FormData) {
  const tagIds = Array.from(
    new Set(
      formData.getAll("tagIds").flatMap((value) => (typeof value === "string" && value ? [value] : [])),
    ),
  );

  return matchResultSchema.safeParse({
    playedAt: formData.get("playedAt"),
    gameName: formData.get("gameName"),
    myDeckName: formData.get("myDeckName"),
    tournamentSessionId: formData.get("tournamentSessionId") || undefined,
    opponentDeckName: formData.get("opponentDeckName"),
    eventCategory: formData.get("eventCategory"),
    tournamentPhase: formData.get("tournamentPhase") || undefined,
    playOrder: formData.get("playOrder"),
    didChoosePlayOrder: formData.get("didChoosePlayOrder"),
    matchFormat: formData.get("matchFormat"),
    result: formData.get("result"),
    tournamentDetail: formData.get("tournamentDetail") || undefined,
    memo: formData.get("memo"),
    tagIds,
  });
}

async function resolveTournamentSession(params: {
  userId: string;
  myDeckId: string;
  playedAt: string;
  eventCategory: "shop" | "cs";
  tournamentSessionId?: string;
  name?: string;
}) {
  const { userId, myDeckId, playedAt, eventCategory, tournamentSessionId, name } = params;
  const { start } = dateRangeForDay(playedAt);

  if (tournamentSessionId) {
    const existing = await prisma.tournamentSession.findFirst({
      where: {
        id: tournamentSessionId,
        userId,
        myDeckId,
        eventCategory,
      },
      select: {
        id: true,
        endedAt: true,
      },
    });

    if (!existing) {
      return { ok: false as const, error: "이어지는 대회 세션을 찾을 수 없습니다." as const };
    }

    if (existing.endedAt) {
      return {
        ok: false as const,
        error: "종료된 대회입니다. 기존 기록은 수정할 수 있지만 새 라운드는 추가할 수 없습니다." as const,
      };
    }

    return { ok: true as const, sessionId: existing.id };
  }

  const created = await prisma.tournamentSession.create({
    data: {
      userId,
      myDeckId,
      eventCategory,
      name: name || null,
      playedOn: start,
    },
    select: {
      id: true,
    },
  });

  return { ok: true as const, sessionId: created.id };
}

async function buildNextTournamentRedirect(params: {
  sessionId: string;
  userId: string;
  eventCategory: "shop";
  playedAt: string;
  gameName: string;
  deckName: string;
  tournamentPhase: "swiss" | "elimination";
}) {
  const { sessionId, userId, eventCategory, playedAt, gameName, deckName, tournamentPhase } = params;
  const phaseCount = await prisma.matchResult.count({
    where: {
      userId,
      tournamentSessionId: sessionId,
      tournamentPhase,
    },
  });

  const sp = new URLSearchParams({
    message: "record_created",
    event: eventCategory,
    date: playedAt,
    gameName,
    deckName,
    round: String(phaseCount + 1),
    phase: tournamentPhase,
    tournamentId: sessionId,
  });

  return `/matches/new?${sp.toString()}`;
}

export async function createMatchResult(formData: FormData) {
  const user = await requireUser();
  const parsed = parseMatchForm(formData);

  if (!parsed.success) {
    redirect(newMatchRedirect("error", "입력값을 확인해 주세요."));
  }

  const [{ deckId }, ownedTags] = await Promise.all([
    resolveGameAndDeck(user.id, parsed.data.gameName, parsed.data.myDeckName),
    ensureOwnedTags(user.id, parsed.data.tagIds),
  ]);

  if (ownedTags.length !== parsed.data.tagIds.length) {
    redirect(newMatchRedirect("error", "선택한 태그를 사용할 수 없습니다."));
  }

  const score = deriveScore(parsed.data.matchFormat, parsed.data.result);
  let tournamentSessionId: string | null = null;

  if (parsed.data.eventCategory === "shop" || parsed.data.eventCategory === "cs") {
    const resolved = await resolveTournamentSession({
      userId: user.id,
      myDeckId: deckId,
      playedAt: parsed.data.playedAt,
      eventCategory: parsed.data.eventCategory,
      tournamentSessionId: parsed.data.tournamentSessionId,
      name: parsed.data.tournamentDetail || undefined,
    });

    if (!resolved.ok) {
      redirect(newMatchRedirect("error", resolved.error));
    }

    tournamentSessionId = resolved.sessionId;
  }

  await prisma.matchResult.create({
    data: {
      userId: user.id,
      myDeckId: deckId,
      tournamentSessionId,
      playedAt: new Date(parsed.data.playedAt),
      opponentDeckName: parsed.data.opponentDeckName,
      eventCategory: parsed.data.eventCategory,
      tournamentPhase:
        parsed.data.eventCategory === "shop" || parsed.data.eventCategory === "cs"
          ? parsed.data.tournamentPhase ?? "swiss"
          : null,
      playOrder: parsed.data.playOrder,
      didChoosePlayOrder: parsed.data.didChoosePlayOrder,
      matchFormat: parsed.data.matchFormat,
      wins: score.wins,
      losses: score.losses,
      isMatchWin: parsed.data.result === "win",
      memo: parsed.data.memo || null,
      tags: parsed.data.tagIds.length
        ? {
            createMany: {
              data: parsed.data.tagIds.map((tagId) => ({ tagId })),
            },
          }
        : undefined,
    },
  });

  revalidatePath("/matches");
  revalidateDashboard(user.id);
  revalidatePath("/matches/new");
  revalidatePath("/settings/tags");

  if (tournamentSessionId && parsed.data.eventCategory === "shop") {
    redirect(
      await buildNextTournamentRedirect({
        sessionId: tournamentSessionId,
        userId: user.id,
        eventCategory: "shop",
        playedAt: parsed.data.playedAt,
        gameName: parsed.data.gameName,
        deckName: parsed.data.myDeckName,
        tournamentPhase: parsed.data.tournamentPhase ?? "swiss",
      }),
    );
  }

  redirect("/matches?message=record_created");
}

export async function updateMatchResult(formData: FormData) {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") || "");
  const parsed = parseMatchForm(formData);

  if (!matchId) {
    redirect(matchesRedirect("error", "수정할 경기 ID가 없습니다."));
  }

  if (!parsed.success) {
    redirect(editRedirect(matchId, "error", "입력값을 확인해 주세요."));
  }

  const [{ deckId }, existingMatch, ownedTags] = await Promise.all([
    resolveGameAndDeck(user.id, parsed.data.gameName, parsed.data.myDeckName),
    prisma.matchResult.findFirst({
      where: {
        id: matchId,
        userId: user.id,
      },
      select: {
        id: true,
        tournamentSessionId: true,
      },
    }),
    ensureOwnedTags(user.id, parsed.data.tagIds),
  ]);

  if (!existingMatch) {
    redirect(matchesRedirect("error", "수정할 대전 기록을 찾을 수 없습니다."));
  }

  if (ownedTags.length !== parsed.data.tagIds.length) {
    redirect(editRedirect(matchId, "error", "선택한 태그를 사용할 수 없습니다."));
  }

  const score = deriveScore(parsed.data.matchFormat, parsed.data.result);
  let tournamentSessionId = existingMatch.tournamentSessionId;

  if (parsed.data.eventCategory === "shop" || parsed.data.eventCategory === "cs") {
    const resolved = await resolveTournamentSession({
      userId: user.id,
      myDeckId: deckId,
      playedAt: parsed.data.playedAt,
      eventCategory: parsed.data.eventCategory,
      tournamentSessionId:
        parsed.data.tournamentSessionId ?? existingMatch.tournamentSessionId ?? undefined,
    });

    if (!resolved.ok) {
      redirect(editRedirect(matchId, "error", resolved.error));
    }

    tournamentSessionId = resolved.sessionId;
  } else {
    tournamentSessionId = null;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.matchResult.updateMany({
      where: {
        id: matchId,
        userId: user.id,
      },
      data: {
        myDeckId: deckId,
        tournamentSessionId,
        playedAt: new Date(parsed.data.playedAt),
        opponentDeckName: parsed.data.opponentDeckName,
        eventCategory: parsed.data.eventCategory,
        tournamentPhase:
          parsed.data.eventCategory === "shop" || parsed.data.eventCategory === "cs"
            ? parsed.data.tournamentPhase ?? "swiss"
            : null,
        playOrder: parsed.data.playOrder,
        didChoosePlayOrder: parsed.data.didChoosePlayOrder,
        matchFormat: parsed.data.matchFormat,
        wins: score.wins,
        losses: score.losses,
        isMatchWin: parsed.data.result === "win",
        memo: parsed.data.memo || null,
      },
    });

    await tx.matchResultTag.deleteMany({
      where: {
        matchResultId: matchId,
      },
    });

    if (parsed.data.tagIds.length > 0) {
      await tx.matchResultTag.createMany({
        data: parsed.data.tagIds.map((tagId) => ({
          matchResultId: matchId,
          tagId,
        })),
      });
    }

    return updated;
  });

  if (result.count === 0) {
    redirect(matchesRedirect("error", "수정 권한이 없거나 대전 기록을 찾을 수 없습니다."));
  }

  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}/edit`);
  revalidateDashboard(user.id);
  revalidatePath("/matches/new");
  revalidatePath("/settings/tags");
  redirect("/matches?message=record_updated");
}

export async function deleteMatchResult(formData: FormData) {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") || "");

  if (!matchId) {
    redirect(matchesRedirect("error", "삭제할 경기 ID가 없습니다."));
  }

  await prisma.matchResult.deleteMany({
    where: {
      id: matchId,
      userId: user.id,
    },
  });

  revalidatePath("/matches");
  revalidateDashboard(user.id);
  revalidatePath("/settings/tags");
  redirect("/matches?message=record_deleted");
}

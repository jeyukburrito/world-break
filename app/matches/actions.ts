"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { encodeJsonBase64Url } from "@/lib/base64url";
import { revalidateDashboard } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { matchIdSchema, matchResultSchema } from "@/lib/validation/match";

type TxClient = Prisma.TransactionClient;

function encodeParams(obj: Record<string, string>): string {
  return encodeJsonBase64Url(obj);
}

function matchesRedirect(type: "error" | "message", value: string, ep?: Record<string, string>) {
  const sp = new URLSearchParams({ [type]: value });
  if (ep) sp.set("ep", encodeParams(ep));
  return `/matches?${sp.toString()}`;
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

async function resolveGameAndDeck(tx: TxClient, userId: string, gameName: string, deckName: string) {
  const game = await tx.game.upsert({
    where: { userId_name: { userId, name: gameName } },
    update: {},
    create: { userId, name: gameName },
    select: { id: true },
  });

  const deck = await tx.deck.upsert({
    where: { userId_gameId_name: { userId, gameId: game.id, name: deckName } },
    update: {},
    create: { userId, gameId: game.id, name: deckName },
    select: { id: true },
  });

  return { gameId: game.id, deckId: deck.id };
}

async function ensureOwnedTags(tx: TxClient, userId: string, tagIds: string[]) {
  if (tagIds.length === 0) {
    return [];
  }

  return tx.tag.findMany({
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

function deriveScore(
  matchFormat: "bo1" | "bo3",
  result: "win" | "lose",
  bo3Score?: "2-0" | "2-1" | "0-2" | "1-2",
) {
  if (matchFormat === "bo1") {
    return result === "win" ? { wins: 1, losses: 0 } : { wins: 0, losses: 1 };
  }

  if (bo3Score) {
    const [w, l] = bo3Score.split("-").map(Number);
    return { wins: w, losses: l };
  }

  // 폴백: 기존 로직 (bo3Score 미제공 시)
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
    bo3Score: formData.get("bo3Score") || undefined,
    tournamentDetail: formData.get("tournamentDetail") || undefined,
    memo: formData.get("memo"),
    tagIds,
  });
}

async function resolveTournamentSession(tx: TxClient, params: {
  userId: string;
  myDeckId: string;
  playedAt: string;
  eventCategory: "shop";
  tournamentSessionId?: string;
  name?: string;
}) {
  const { userId, myDeckId, playedAt, eventCategory, tournamentSessionId, name } = params;
  const { start } = dateRangeForDay(playedAt);

  if (tournamentSessionId) {
    const existing = await tx.tournamentSession.findFirst({
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

  const created = await tx.tournamentSession.create({
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
  matchFormat: "bo1" | "bo3";
  playOrder: "first" | "second";
  matchEp: Record<string, string>;
}) {
  const { sessionId, userId, eventCategory, playedAt, gameName, deckName, tournamentPhase, matchFormat, playOrder, matchEp } = params;
  const phaseCount = await prisma.matchResult.count({
    where: {
      userId,
      tournamentSessionId: sessionId,
      tournamentPhase,
    },
  });

  const sp = new URLSearchParams({
    message: "record_created",
    ep: encodeParams(matchEp),
    event: eventCategory,
    date: playedAt,
    gameName,
    deckName,
    round: String(phaseCount + 1),
    phase: tournamentPhase,
    tournamentId: sessionId,
    matchFormat,
    playOrder,
  });

  return `/matches/new?${sp.toString()}`;
}

export async function createMatchResult(formData: FormData) {
  const user = await requireUser();
  const parsed = parseMatchForm(formData);

  if (!parsed.success) {
    redirect(newMatchRedirect("error", "입력값을 확인해 주세요."));
  }

  const score = deriveScore(parsed.data.matchFormat, parsed.data.result, parsed.data.bo3Score);

  const { tournamentSessionId } = await prisma.$transaction(async (tx) => {
    const [{ deckId }, ownedTags] = await Promise.all([
      resolveGameAndDeck(tx, user.id, parsed.data.gameName, parsed.data.myDeckName),
      ensureOwnedTags(tx, user.id, parsed.data.tagIds),
    ]);

    if (ownedTags.length !== parsed.data.tagIds.length) {
      throw new Error("TAG_MISMATCH");
    }

    let sessionId: string | null = null;

    if (parsed.data.eventCategory === "shop") {
      const resolved = await resolveTournamentSession(tx, {
        userId: user.id,
        myDeckId: deckId,
        playedAt: parsed.data.playedAt,
        eventCategory: parsed.data.eventCategory,
        tournamentSessionId: parsed.data.tournamentSessionId,
        name: parsed.data.tournamentDetail || undefined,
      });

      if (!resolved.ok) {
        throw new Error(`TOURNAMENT_ERROR:${resolved.error}`);
      }

      sessionId = resolved.sessionId;
    }

    await tx.matchResult.create({
      data: {
        userId: user.id,
        myDeckId: deckId,
        tournamentSessionId: sessionId,
        playedAt: new Date(parsed.data.playedAt),
        opponentDeckName: parsed.data.opponentDeckName,
        eventCategory: parsed.data.eventCategory,
        tournamentPhase:
          parsed.data.eventCategory === "shop"
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

    return { tournamentSessionId: sessionId };
  }).catch((error: Error) => {
    if (error.message === "TAG_MISMATCH") {
      redirect(newMatchRedirect("error", "선택한 태그를 사용할 수 없습니다."));
    }
    if (error.message.startsWith("TOURNAMENT_ERROR:")) {
      redirect(newMatchRedirect("error", error.message.slice("TOURNAMENT_ERROR:".length)));
    }
    throw error;
  });

  revalidatePath("/matches");
  revalidateDashboard(user.id);
  revalidatePath("/matches/new");
  revalidatePath("/settings/tags");

  const matchEp = {
    event_category: parsed.data.eventCategory,
    match_format: parsed.data.matchFormat,
    result: parsed.data.result,
    has_memo: parsed.data.memo ? "true" : "false",
    has_tags: parsed.data.tagIds.length > 0 ? "true" : "false",
    is_tournament: parsed.data.eventCategory === "shop" ? "true" : "false",
    game_name: parsed.data.gameName,
  };

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
        matchFormat: parsed.data.matchFormat,
        playOrder: parsed.data.playOrder,
        matchEp,
      }),
    );
  }

  redirect(matchesRedirect("message", "record_created", matchEp));
}

export async function updateMatchResult(formData: FormData) {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") || "");
  const parsed = parseMatchForm(formData);

  if (!matchIdSchema.safeParse(matchId).success) {
    redirect(matchesRedirect("error", "수정할 경기 ID가 올바르지 않습니다."));
  }

  if (!parsed.success) {
    redirect(editRedirect(matchId, "error", "입력값을 확인해 주세요."));
  }

  const score = deriveScore(parsed.data.matchFormat, parsed.data.result, parsed.data.bo3Score);

  const result = await prisma.$transaction(async (tx) => {
    const [{ deckId }, existingMatch, ownedTags] = await Promise.all([
      resolveGameAndDeck(tx, user.id, parsed.data.gameName, parsed.data.myDeckName),
      tx.matchResult.findFirst({
        where: {
          id: matchId,
          userId: user.id,
        },
        select: {
          id: true,
          tournamentSessionId: true,
        },
      }),
      ensureOwnedTags(tx, user.id, parsed.data.tagIds),
    ]);

    if (!existingMatch) {
      throw new Error("MATCH_NOT_FOUND");
    }

    if (ownedTags.length !== parsed.data.tagIds.length) {
      throw new Error("TAG_MISMATCH");
    }

    let tournamentSessionId = existingMatch.tournamentSessionId;

    if (parsed.data.eventCategory === "shop") {
      const resolved = await resolveTournamentSession(tx, {
        userId: user.id,
        myDeckId: deckId,
        playedAt: parsed.data.playedAt,
        eventCategory: parsed.data.eventCategory,
        tournamentSessionId:
          parsed.data.tournamentSessionId ?? existingMatch.tournamentSessionId ?? undefined,
      });

      if (!resolved.ok) {
        throw new Error(`TOURNAMENT_ERROR:${resolved.error}`);
      }

      tournamentSessionId = resolved.sessionId;
    } else {
      tournamentSessionId = null;
    }

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
          parsed.data.eventCategory === "shop"
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
  }).catch((error: Error) => {
    if (error.message === "MATCH_NOT_FOUND") {
      redirect(matchesRedirect("error", "수정할 대전 기록을 찾을 수 없습니다."));
    }
    if (error.message === "TAG_MISMATCH") {
      redirect(editRedirect(matchId, "error", "선택한 태그를 사용할 수 없습니다."));
    }
    if (error.message.startsWith("TOURNAMENT_ERROR:")) {
      redirect(editRedirect(matchId, "error", error.message.slice("TOURNAMENT_ERROR:".length)));
    }
    throw error;
  });

  if (result.count === 0) {
    redirect(matchesRedirect("error", "수정 권한이 없거나 대전 기록을 찾을 수 없습니다."));
  }

  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}/edit`);
  revalidateDashboard(user.id);
  revalidatePath("/matches/new");
  revalidatePath("/settings/tags");
  redirect(matchesRedirect("message", "record_updated", { match_id: matchId }));
}

export async function deleteMatchResult(formData: FormData) {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") || "");

  if (!matchIdSchema.safeParse(matchId).success) {
    redirect(matchesRedirect("error", "삭제할 경기 ID가 올바르지 않습니다."));
  }

  const result = await prisma.matchResult.deleteMany({
    where: {
      id: matchId,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    redirect(matchesRedirect("error", "삭제 권한이 없거나 대전 기록을 찾을 수 없습니다."));
  }

  revalidatePath("/matches");
  revalidateDashboard(user.id);
  revalidatePath("/settings/tags");
  redirect(matchesRedirect("message", "record_deleted", { match_id: matchId }));
}

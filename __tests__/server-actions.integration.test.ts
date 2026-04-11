import { randomUUID } from "crypto";

import { afterEach, describe, expect, it } from "vitest";

import { createMatchResult, deleteMatchResult, updateMatchResult } from "@/app/matches/actions";
import { deleteAccount } from "@/app/settings/actions";
import { prisma } from "@/lib/prisma";

import { cookiesDeleteMock, requireUserMock } from "./setup";

const createdUserIds = new Set<string>();

function trackUser(id: string) {
  createdUserIds.add(id);
  return id;
}

async function cleanupCreatedUsers() {
  if (createdUserIds.size === 0) {
    return;
  }

  await prisma.user.deleteMany({
    where: {
      id: {
        in: [...createdUserIds],
      },
    },
  });

  createdUserIds.clear();
}

function buildMatchForm(overrides: Record<string, string | null | undefined> = {}) {
  const defaults: Record<string, string> = {
    playedAt: "2026-03-28",
    gameName: "Shadowverse EVOLVE",
    myDeckName: "Artifact Portal",
    opponentDeckName: "Dragon Ramp",
    eventCategory: "friendly",
    playOrder: "first",
    didChoosePlayOrder: "true",
    matchFormat: "bo1",
    result: "win",
    memo: "",
  };

  const formData = new FormData();

  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    if (value !== null && value !== undefined) {
      formData.set(key, value);
    }
  }

  return formData;
}

function buildDeleteForm(matchId: string) {
  const formData = new FormData();
  formData.set("matchId", matchId);
  return formData;
}

async function expectRedirect(action: Promise<unknown>) {
  try {
    await action;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("NEXT_REDIRECT:")) {
      return error.message.slice("NEXT_REDIRECT:".length);
    }

    throw error;
  }

  throw new Error("Expected redirect");
}

async function createUser(id = randomUUID()) {
  const user = await prisma.user.create({
    data: { id },
  });

  trackUser(user.id);
  return user;
}

afterEach(async () => {
  await cleanupCreatedUsers();
});

describe("Server Action integration", () => {
  it("createMatchResult creates related records and redirects to matches", async () => {
    const user = await createUser();
    requireUserMock.mockResolvedValue({
      id: user.id,
      email: null,
      name: null,
      avatarUrl: null,
      isGuest: false,
      user_metadata: null,
    });

    const location = await expectRedirect(createMatchResult(buildMatchForm()));

    expect(location).toContain("/matches/new?message=record_created");

    const savedMatch = await prisma.matchResult.findFirst({
      where: { userId: user.id },
      include: {
        myDeck: {
          include: {
            game: true,
          },
        },
      },
    });

    expect(savedMatch).not.toBeNull();
    expect(savedMatch?.myDeck.name).toBe("Artifact Portal");
    expect(savedMatch?.myDeck.game.name).toBe("Shadowverse EVOLVE");
  });

  it("createMatchResult rejects invalid form input before writing", async () => {
    const user = await createUser();
    requireUserMock.mockResolvedValue({
      id: user.id,
      email: null,
      name: null,
      avatarUrl: null,
      isGuest: false,
      user_metadata: null,
    });

    const location = await expectRedirect(
      createMatchResult(buildMatchForm({ gameName: undefined })),
    );

    expect(location).toContain("/matches/new?error=");

    const matchCount = await prisma.matchResult.count({
      where: { userId: user.id },
    });

    expect(matchCount).toBe(0);
  });

  it("createMatchResult rolls back game and deck when tournament session resolution fails", async () => {
    const user = await createUser();
    requireUserMock.mockResolvedValue({
      id: user.id,
      email: null,
      name: null,
      avatarUrl: null,
      isGuest: false,
      user_metadata: null,
    });

    const location = await expectRedirect(
      createMatchResult(
        buildMatchForm({
          eventCategory: "shop",
          tournamentPhase: "swiss",
          tournamentSessionId: randomUUID(),
        }),
      ),
    );

    expect(location).toContain("/matches/new?error=");

    const gameCount = await prisma.game.count({
      where: { userId: user.id },
    });
    const deckCount = await prisma.deck.count({
      where: { userId: user.id },
    });

    expect(gameCount).toBe(0);
    expect(deckCount).toBe(0);
  });

  it("updateMatchResult updates only the current user's record", async () => {
    const user = await createUser();
    requireUserMock.mockResolvedValue({
      id: user.id,
      email: null,
      name: null,
      avatarUrl: null,
      isGuest: false,
      user_metadata: null,
    });

    const game = await prisma.game.create({
      data: {
        userId: user.id,
        name: "Pokemon",
      },
    });
    const deck = await prisma.deck.create({
      data: {
        userId: user.id,
        gameId: game.id,
        name: "Miraidon",
      },
    });
    const match = await prisma.matchResult.create({
      data: {
        userId: user.id,
        myDeckId: deck.id,
        playedAt: new Date("2026-03-28"),
        opponentDeckName: "Charizard",
        eventCategory: "friendly",
        playOrder: "first",
        didChoosePlayOrder: true,
        matchFormat: "bo1",
        wins: 1,
        losses: 0,
        isMatchWin: true,
      },
    });

    const location = await expectRedirect(
      updateMatchResult(
        buildMatchForm({
          matchId: match.id,
          gameName: "Pokemon",
          myDeckName: "Miraidon EX",
          opponentDeckName: "Gardevoir",
          result: "lose",
          playOrder: "second",
          didChoosePlayOrder: "false",
        }),
      ),
    );

    expect(location).toContain("/matches?message=record_updated");

    const updated = await prisma.matchResult.findUnique({
      where: { id: match.id },
      include: {
        myDeck: true,
      },
    });

    expect(updated?.opponentDeckName).toBe("Gardevoir");
    expect(updated?.myDeck.name).toBe("Miraidon EX");
    expect(updated?.isMatchWin).toBe(false);
    expect(updated?.playOrder).toBe("second");
  });

  it("deleteMatchResult blocks deleting another user's record", async () => {
    const actingUser = await createUser();
    const owner = await createUser();
    requireUserMock.mockResolvedValue({
      id: actingUser.id,
      email: null,
      name: null,
      avatarUrl: null,
      isGuest: false,
      user_metadata: null,
    });

    const game = await prisma.game.create({
      data: {
        userId: owner.id,
        name: "One Piece",
      },
    });
    const deck = await prisma.deck.create({
      data: {
        userId: owner.id,
        gameId: game.id,
        name: "Luffy",
      },
    });
    const match = await prisma.matchResult.create({
      data: {
        userId: owner.id,
        myDeckId: deck.id,
        playedAt: new Date("2026-03-28"),
        opponentDeckName: "Zoro",
        eventCategory: "friendly",
        playOrder: "first",
        didChoosePlayOrder: true,
        matchFormat: "bo1",
        wins: 1,
        losses: 0,
        isMatchWin: true,
      },
    });

    const location = await expectRedirect(deleteMatchResult(buildDeleteForm(match.id)));

    expect(location).toContain("/matches?error=");

    const stillExists = await prisma.matchResult.findUnique({
      where: { id: match.id },
    });

    expect(stillExists).not.toBeNull();
  });

  it("deleteAccount cascades guest-owned data and clears the guest cookie", async () => {
    const guest = await createUser();
    requireUserMock.mockResolvedValue({
      id: guest.id,
      email: null,
      name: "게스트",
      avatarUrl: null,
      isGuest: true,
      user_metadata: {
        name: "게스트",
        full_name: "게스트",
        avatar_url: null,
      },
    });

    const game = await prisma.game.create({
      data: {
        userId: guest.id,
        name: "Weiss Schwarz",
      },
    });
    const deck = await prisma.deck.create({
      data: {
        userId: guest.id,
        gameId: game.id,
        name: "8 Standby",
      },
    });
    await prisma.tournamentSession.create({
      data: {
        userId: guest.id,
        myDeckId: deck.id,
        eventCategory: "shop",
        playedOn: new Date("2026-03-28"),
      },
    });
    await prisma.matchResult.create({
      data: {
        userId: guest.id,
        myDeckId: deck.id,
        playedAt: new Date("2026-03-28"),
        opponentDeckName: "Anniversary",
        eventCategory: "friendly",
        playOrder: "first",
        didChoosePlayOrder: true,
        matchFormat: "bo1",
        wins: 1,
        losses: 0,
        isMatchWin: true,
      },
    });

    const location = await expectRedirect(deleteAccount());

    expect(location).toBe("/login?message=account_deleted");
    expect(cookiesDeleteMock).toHaveBeenCalledWith("wb_guest_token");

    const [userCount, gameCount, deckCount, matchCount, tournamentCount] = await Promise.all([
      prisma.user.count({ where: { id: guest.id } }),
      prisma.game.count({ where: { userId: guest.id } }),
      prisma.deck.count({ where: { userId: guest.id } }),
      prisma.matchResult.count({ where: { userId: guest.id } }),
      prisma.tournamentSession.count({ where: { userId: guest.id } }),
    ]);

    expect(userCount).toBe(0);
    expect(gameCount).toBe(0);
    expect(deckCount).toBe(0);
    expect(matchCount).toBe(0);
    expect(tournamentCount).toBe(0);
  });
});

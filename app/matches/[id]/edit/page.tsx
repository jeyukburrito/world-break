import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { EventCategorySelect } from "@/components/event-category-select";
import { GameDeckFields } from "@/components/game-deck-fields";
import { HeaderActions } from "@/components/header-actions";
import { MatchDetailControls } from "@/components/match-detail-controls";
import { MatchResultInput } from "@/components/match-result-input";
import { OpponentDeckField } from "@/components/opponent-deck-field";
import { SubmitButton } from "@/components/submit-button";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";
import { getRecentOpponentDecks } from "@/lib/matches";
import { prisma } from "@/lib/prisma";

import { updateMatchResult } from "../../actions";

type EditMatchPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditMatchPage({ params, searchParams }: EditMatchPageProps) {
  const user = await requireUser();
  const display = getUserDisplayInfo(user);
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const errorMessage = typeof query?.error === "string" ? query.error : undefined;

  const [match, recentOpponentDecks] = await Promise.all([
    prisma.matchResult.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        playedAt: true,
        tournamentSessionId: true,
        tournamentPhase: true,
        opponentDeckName: true,
        eventCategory: true,
        matchFormat: true,
        wins: true,
        losses: true,
        isMatchWin: true,
        playOrder: true,
        didChoosePlayOrder: true,
        bo3PlaySequence: true,
        memo: true,
        myDeck: {
          select: {
            name: true,
            game: { select: { name: true } },
          },
        },
      },
    }),
    getRecentOpponentDecks(user.id),
  ]);

  if (!match) {
    notFound();
  }

  return (
    <AppShell
      title="기록 수정"
      headerRight={<HeaderActions avatarUrl={display.avatarUrl} name={display.name} />}
    >
      <div className="mb-6">
        <Link
          href="/matches"
          className="inline-flex text-sm font-medium text-muted underline-offset-4 hover:underline"
        >
          기록 목록으로 돌아가기
        </Link>
      </div>
      <form action={updateMatchResult} className="space-y-6">
        <input type="hidden" name="matchId" value={match.id} />
        <input type="hidden" name="tournamentSessionId" value={match.tournamentSessionId ?? ""} />
        <input type="hidden" name="tournamentPhase" value={match.tournamentPhase ?? ""} />

        {errorMessage ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}

        {/* 기본 정보: 날짜·상대덱 / 게임·내덱 — 데스크톱 2열 */}
        <section className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            날짜
            <input
              name="playedAt"
              type="date"
              required
              defaultValue={match.playedAt.toISOString().slice(0, 10)}
              className="rounded-2xl bg-surface-container-high px-4 py-3 text-ink"
            />
          </label>
          <OpponentDeckField
            defaultGameName={match.myDeck.game.name}
            defaultValue={match.opponentDeckName}
            recentByGame={recentOpponentDecks}
          />
          <GameDeckFields
            defaultGameName={match.myDeck.game.name}
            defaultDeckName={match.myDeck.name}
          />
        </section>

        {/* 대회 유형 — 내부 md:col-span-2 무시, 단독 full-width */}
        <EventCategorySelect defaultValue={match.eventCategory} />

        {/* 매치 결과 — full width (BO3 카드 깨짐 방지) */}
        <MatchResultInput
          defaultFormat={match.matchFormat}
          defaultResult={match.isMatchWin ? "win" : "lose"}
          defaultWins={match.wins}
          defaultLosses={match.losses}
          defaultBo3PlaySequence={match.bo3PlaySequence ?? undefined}
        />

        {/* 선후공 — full width (segmented control 공간 확보) */}
        <MatchDetailControls
          defaultPlayOrder={match.playOrder}
          defaultDidChoosePlayOrder={match.didChoosePlayOrder}
          format={match.matchFormat}
        />

        <label className="grid gap-2 text-sm font-medium">
          메모
          <textarea
            name="memo"
            rows={4}
            defaultValue={match.memo ?? ""}
            className="rounded-2xl bg-surface-container-high px-4 py-3 text-ink"
          />
        </label>

        <SubmitButton label="수정 저장" />
      </form>
    </AppShell>
  );
}

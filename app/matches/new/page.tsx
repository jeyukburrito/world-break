import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { EventCategorySelect } from "@/components/event-category-select";
import { HeaderActions } from "@/components/header-actions";
import { MatchDetailControls } from "@/components/match-detail-controls";
import { MatchPrefillFields } from "@/components/match-prefill-fields";
import { OpponentDeckField } from "@/components/opponent-deck-field";
import { SubmitButton } from "@/components/submit-button";
import { TournamentBanner } from "@/components/tournament-banner";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";
import { getNewMatchPrefill, getRecentOpponentDecks } from "@/lib/matches";
import { prisma } from "@/lib/prisma";

import { createMatchResult } from "../actions";

type NewMatchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewMatchPage({ searchParams }: NewMatchPageProps) {
  const user = await requireUser();
  const display = getUserDisplayInfo(user);
  const params = searchParams ? await searchParams : undefined;
  const errorMessage = typeof params?.error === "string" ? params.error : undefined;
  const savedMessage = typeof params?.message === "string" ? params.message : undefined;

  const continueEvent = typeof params?.event === "string" ? params.event : undefined;
  const continueDate = typeof params?.date === "string" ? params.date : undefined;
  const continueGameName = typeof params?.gameName === "string" ? params.gameName : undefined;
  const continueDeckName = typeof params?.deckName === "string" ? params.deckName : undefined;
  const continueTournamentId =
    typeof params?.tournamentId === "string" ? params.tournamentId : undefined;

  // Show "saved" banner only on friendly match continuation (not tournament rounds).
  const showSavedBanner = savedMessage === "record_created" && !continueTournamentId;
  const continueMatchFormat = typeof params?.matchFormat === "string" ? params.matchFormat : undefined;
  const continuePlayOrder = typeof params?.playOrder === "string" ? params.playOrder : undefined;
  const phase = params?.phase === "elimination" ? "elimination" : "swiss";
  const isContinue = continueEvent === "shop";
  const isElimination = phase === "elimination";

  const eventLabel = "대회";
  const phaseLabel = isElimination ? "본선" : "예선";
  const today = continueDate ?? new Date().toISOString().slice(0, 10);

  const [continuedTournament, phaseCount, prefill, recentOpponentDecks] = await Promise.all([
    continueTournamentId
      ? prisma.tournamentSession.findFirst({
          where: {
            id: continueTournamentId,
            userId: user.id,
          },
          select: {
            id: true,
            endedAt: true,
          },
        })
      : Promise.resolve(null),
    continueTournamentId
      ? prisma.matchResult.count({
          where: {
            userId: user.id,
            tournamentSessionId: continueTournamentId,
            tournamentPhase: phase,
          },
        })
      : Promise.resolve(0),
    getNewMatchPrefill(user.id),
    getRecentOpponentDecks(user.id),
  ]);

  const initialGameName = continueGameName ?? prefill.latest?.gameName;
  const initialGamePrefill = initialGameName ? prefill.byGame[initialGameName] : undefined;
  const initialDeckName = continueDeckName ?? initialGamePrefill?.deckName;
  const initialMatchFormat = continueMatchFormat ?? initialGamePrefill?.matchFormat;

  const isActiveTournament = Boolean(continuedTournament && !continuedTournament.endedAt);
  const isEndedTournament = Boolean(continuedTournament?.endedAt);
  const hasInvalidTournamentContinuation = Boolean(continueTournamentId && !continuedTournament);
  const activeTournamentId =
    continuedTournament && !continuedTournament.endedAt ? continuedTournament.id : null;
  const roundNumber = isActiveTournament ? phaseCount + 1 : undefined;
  const eliminationUrl =
    isContinue && isActiveTournament
      ? `/matches/new?${new URLSearchParams({
          event: continueEvent!,
          date: continueDate ?? today,
          gameName: continueGameName ?? "",
          deckName: continueDeckName ?? "",
          phase: "elimination",
          tournamentId: continueTournamentId ?? "",
        }).toString()}`
      : null;
  const submitDisabled = isEndedTournament || hasInvalidTournamentContinuation;
  const submitLabel =
    isContinue && roundNumber
      ? `${phaseLabel} R${roundNumber} 기록 저장`
      : isEndedTournament || hasInvalidTournamentContinuation
        ? "대회 종료"
        : "경기 저장";

  return (
    <AppShell
      title="경기 입력"
      headerRight={<HeaderActions avatarUrl={display.avatarUrl} name={display.name} />}
    >
      <div className="flex flex-col gap-4 pb-28 md:pb-6">
        {showSavedBanner ? (
          <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3 text-sm">
            <span className="font-medium text-ink">저장 완료</span>
            <Link
              href="/matches"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              기록 목록 보기
            </Link>
          </div>
        ) : null}

        {isContinue && activeTournamentId && roundNumber ? (
          <TournamentBanner
            eventLabel={eventLabel}
            phaseLabel={phaseLabel}
            roundNumber={roundNumber}
            isElimination={isElimination}
            tournamentSessionId={activeTournamentId}
            eliminationUrl={eliminationUrl}
          />
        ) : null}

        {isContinue && (isEndedTournament || hasInvalidTournamentContinuation) ? (
          <div className="rounded-3xl bg-surface-container-low p-4 shadow-sm">
            <p className="text-sm font-semibold text-danger">대회 입력을 계속할 수 없습니다</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {isEndedTournament
                ? "종료된 대회입니다. 기존 경기 기록은 수정할 수 있지만, 새로운 라운드는 추가할 수 없습니다."
                : "이어진 대회 세션을 찾을 수 없습니다. 기록 목록에서 현재 상태를 다시 확인해주세요."}
            </p>
          </div>
        ) : null}

        <form action={createMatchResult} className="space-y-8">
          {isContinue && continueTournamentId ? (
            <>
              <input type="hidden" name="tournamentPhase" value={phase} />
              <input type="hidden" name="tournamentSessionId" value={continueTournamentId} />
            </>
          ) : null}

          <section className="grid gap-3 md:grid-cols-2">
            <EventCategorySelect defaultValue={continueEvent ?? "friendly"} />
            <label className="grid gap-2 text-sm font-semibold">
              날짜
              <input
                name="playedAt"
                type="date"
                required
                defaultValue={today}
                className="rounded-2xl bg-surface-container-high px-4 py-3 text-ink"
              />
            </label>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <MatchPrefillFields
              defaultGameName={initialGameName}
              defaultDeckName={initialDeckName}
              defaultFormat={initialMatchFormat}
              gameDefaults={prefill.byGame}
            />
            <OpponentDeckField
              defaultGameName={initialGameName}
              recentByGame={recentOpponentDecks}
            />
          </section>

          <MatchDetailControls
            defaultPlayOrder={continuePlayOrder === "first" || continuePlayOrder === "second" ? continuePlayOrder : undefined}
            format={initialMatchFormat}
          />

          <section className="grid gap-3">
            <label className="grid gap-2 text-sm font-semibold">
              메모
              <textarea
                name="memo"
                rows={3}
                className="min-h-28 rounded-2xl bg-surface-container-high px-4 py-3 text-ink"
              />
            </label>
          </section>

          {errorMessage ? (
            <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
              {errorMessage}
            </div>
          ) : null}

          {/* 모바일: bottom nav 위 fixed. 데스크톱: 폼 하단 inline */}
          <div className="fixed inset-x-0 bottom-20 z-40 bg-surface/90 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg md:static md:z-auto md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
            <SubmitButton label={submitLabel} disabled={submitDisabled} />
          </div>
        </form>
      </div>
    </AppShell>
  );
}

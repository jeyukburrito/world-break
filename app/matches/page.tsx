import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DeleteMatchButton } from "@/components/delete-match-button";
import { HeaderActions } from "@/components/header-actions";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format-date";
import {
  groupMatchesForDisplay,
  type DisplayItem,
} from "@/lib/group-matches";
import {
  MATCHES_PAGE_SIZE,
  countMatchesForUser,
  listMatchesForUser,
} from "@/lib/matches";

import { deleteMatchResult } from "./actions";

type MatchesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function pageHref(page: number) {
  return page > 1 ? `/matches?page=${page}` : "/matches";
}

function formatPlayOrderLabel(playOrder: string, didChoosePlayOrder: boolean) {
  const order = playOrder === "first" ? "선공" : "후공";
  const chooser = didChoosePlayOrder ? "내가 선택" : "상대가 선택";
  return `${order} · ${chooser}`;
}

function formatPlaySequence(sequence: string | null | undefined) {
  if (!sequence) {
    return "";
  }

  return sequence
    .split("")
    .map((value) => (value === "S" ? "후" : "선"))
    .join("");
}

function formatMatchFormatLabel(match: Extract<DisplayItem, { type: "single" }>["match"]) {
  if (match.matchFormat !== "bo3") {
    return match.matchFormat.toUpperCase();
  }

  const sequence = formatPlaySequence(match.bo3PlaySequence);
  return sequence ? `BO3 ${match.wins}-${match.losses} · ${sequence}` : `BO3 ${match.wins}-${match.losses}`;
}

function MatchStatusPill({ isWin }: { isWin: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
        isWin ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
      }`}
    >
      {isWin ? "승리" : "패배"}
    </span>
  );
}

function SingleMatchCard({
  match,
  deleteAction,
}: {
  match: Extract<DisplayItem, { type: "single" }>["match"];
  deleteAction: (formData: FormData) => void;
}) {
  return (
    <article
      className={`rounded-[32px] p-5 shadow-sm ${
        match.isMatchWin
          ? "bg-success/[0.07] ring-1 ring-success/20"
          : "bg-danger/[0.04] ring-1 ring-danger/15"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-accent">
              {match.eventCategory === "friendly" ? "친선" : "대회"}
            </span>
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
              {formatDate(match.playedAt)}
            </span>
            <span className="rounded-full bg-line/40 px-3 py-1 text-xs font-semibold text-muted">
              {formatMatchFormatLabel(match)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {match.myDeck.name} vs {match.opponentDeckName}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {match.myDeck.game.name} · {formatPlayOrderLabel(match.playOrder, match.didChoosePlayOrder)}
              {match.memo ? ` · ${match.memo}` : ""}
            </p>
          </div>
        </div>
        <MatchStatusPill isWin={match.isMatchWin} />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/matches/${match.id}/edit`}
          className="inline-flex rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
        >
          수정
        </Link>
        <form action={deleteAction}>
          <input type="hidden" name="matchId" value={match.id} />
          <DeleteMatchButton />
        </form>
      </div>
    </article>
  );
}

function TournamentMatchCard({
  group,
  deleteAction,
}: {
  group: Extract<DisplayItem, { type: "tournament" }>["group"];
  deleteAction: (formData: FormData) => void;
}) {
  const wins = group.matches.filter((match) => match.isMatchWin).length;
  const losses = group.matches.length - wins;
  const isEnded = Boolean(group.endedAt);
  const showPhaseLabels = group.hasSwiss && group.hasElimination;
  const lastMatch = group.matches[group.matches.length - 1];
  const nextSwissRound =
    group.matches.filter((match) => match.tournamentPhase !== "elimination").length + 1;
  const nextEliminationRound =
    group.matches.filter((match) => match.tournamentPhase === "elimination").length + 1;
  const nextHref =
    group.tournamentSessionId && lastMatch
      ? `/matches/new?${new URLSearchParams({
          event: group.eventCategory,
          date: group.date.toISOString().slice(0, 10),
          deckName: group.deckName,
          gameName: group.gameName,
          matchFormat: lastMatch.matchFormat,
          playOrder: lastMatch.playOrder,
          phase: group.hasElimination ? "elimination" : "swiss",
          tournamentId: group.tournamentSessionId,
        }).toString()}`
      : null;

  let swissIndex = 0;
  let eliminationIndex = 0;

  return (
    <article
      className={`rounded-[32px] p-5 shadow-sm ${
        isEnded ? "bg-surface-container" : "bg-surface-container-low"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-accent">
              대회
            </span>
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
              {formatDate(group.date)}
            </span>
            {isEnded ? (
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                종료
              </span>
            ) : (
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                진행 중
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {group.name ? group.name : group.deckName}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {group.name ? `${group.gameName} · ${group.deckName}` : group.gameName}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tracking-tight text-ink">
            <span className="text-success">{wins}</span>
            <span className="mx-1 text-muted">-</span>
            <span className="text-danger">{losses}</span>
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            {group.matches.length} rounds
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {group.matches.map((match, index) => {
          const isElimination = match.tournamentPhase === "elimination";
          const phaseChanged =
            index > 0 && group.matches[index - 1].tournamentPhase !== match.tournamentPhase;
          const roundLabel = isElimination ? `T${++eliminationIndex}` : `R${++swissIndex}`;

          return (
            <div
              key={match.id}
              className={`rounded-[24px] px-4 py-4 ${
                match.isMatchWin
                  ? "bg-success/[0.07] ring-1 ring-success/20"
                  : "bg-danger/[0.04] ring-1 ring-danger/15"
              }`}
            >
              {showPhaseLabels && (index === 0 || phaseChanged) ? (
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-line/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
                    {isElimination ? "토너먼트" : "스위스"}
                  </span>
                </div>
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
                    {roundLabel}
                  </p>
                  <h3 className="mt-1 truncate text-base font-semibold text-ink">
                    vs {match.opponentDeckName}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {formatMatchFormatLabel(match)} ·{" "}
                    {formatPlayOrderLabel(match.playOrder, match.didChoosePlayOrder)}
                    {match.memo ? ` · ${match.memo}` : ""}
                  </p>
                </div>
                <MatchStatusPill isWin={match.isMatchWin} />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/matches/${match.id}/edit`}
                  className="inline-flex rounded-full bg-surface px-3 py-2 text-sm font-semibold text-ink"
                >
                  수정
                </Link>
                <form action={deleteAction}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <DeleteMatchButton />
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {!isEnded && (nextHref || group.tournamentSessionId) ? (
        <div className="mt-4 flex gap-2">
          {nextHref ? (
            <Link
              href={nextHref}
              className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              {group.hasElimination
                ? `토너먼트 R${nextEliminationRound} 추가`
                : `스위스 R${nextSwissRound} 추가`}
            </Link>
          ) : null}
          {group.tournamentSessionId ? (
            <form action="/matches/tournaments/end" method="post">
              <input
                type="hidden"
                name="tournamentSessionId"
                value={group.tournamentSessionId}
              />
              <button
                type="submit"
                className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted"
              >
                대회 종료
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const user = await requireUser();
  const display = getUserDisplayInfo(user);
  const params = searchParams ? await searchParams : undefined;
  const pageQuery = typeof params?.page === "string" ? Number(params.page) : 1;
  const currentPage = Number.isFinite(pageQuery) && pageQuery > 0 ? Math.floor(pageQuery) : 1;

  const [totalCount, rows] = await Promise.all([
    countMatchesForUser(user.id, {}),
    listMatchesForUser(user.id, {}, currentPage),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / MATCHES_PAGE_SIZE));
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const displayItems = groupMatchesForDisplay(rows);

  return (
    <AppShell
      title="기록 목록"
      headerRight={<HeaderActions avatarUrl={display.avatarUrl} name={display.name} />}
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 text-sm text-muted">
          <p>총 {formatNumber(totalCount)}경기</p>
          <span>
            {currentPage} / {totalPages} 페이지
          </span>
        </div>

        {displayItems.length === 0 ? (
          <article className="rounded-[32px] bg-surface-container-low p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-ink">아직 등록된 기록이 없습니다.</p>
            <p className="mt-2 text-sm text-muted">
              첫 경기 결과를 입력하면 목록이 여기에 나타납니다.
            </p>
            <Link
              href="/matches/new"
              className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              첫 기록 입력
            </Link>
          </article>
        ) : null}

        {displayItems.map((item) =>
          item.type === "tournament" ? (
            <TournamentMatchCard
              key={item.group.key}
              group={item.group}
              deleteAction={deleteMatchResult}
            />
          ) : (
            <SingleMatchCard
              key={item.match.id}
              match={item.match}
              deleteAction={deleteMatchResult}
            />
          ),
        )}

        {totalCount > MATCHES_PAGE_SIZE ? (
          <div className="flex items-center justify-between rounded-[28px] bg-surface-container-low p-4 shadow-sm">
            <p className="text-sm text-muted">
              한 페이지에 {MATCHES_PAGE_SIZE}경기씩 보여줍니다.
            </p>
            <div className="flex gap-2">
              {prevPage ? (
                <Link
                  href={pageHref(prevPage)}
                  className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
                >
                  이전
                </Link>
              ) : (
                <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-muted">
                  이전
                </span>
              )}
              {nextPage ? (
                <Link
                  href={pageHref(nextPage)}
                  className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink"
                >
                  다음
                </Link>
              ) : (
                <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-muted">
                  다음
                </span>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

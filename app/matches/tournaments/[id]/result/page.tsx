import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { HeaderActions } from "@/components/header-actions";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


type TournamentResultPageProps = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

function formatDate(value: Date) {
  return value.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getOpponentDeckLabel(value: string | null) {
  return value?.trim() ? value : "상대 덱 미입력";
}

export default async function TournamentResultPage({ params }: TournamentResultPageProps) {
  const { id: sessionId } = await params;
  const user = await requireUser();
  const display = getUserDisplayInfo(user);
  const session = await prisma.tournamentSession.findFirst({
    where: {
      id: sessionId,
      userId: user.id,
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
    notFound();
  }

  const totalMatches = session.matches.length;
  const wins = session.matches.filter((match) => match.isMatchWin).length;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <AppShell
      title="대회 결과"
      headerRight={<HeaderActions avatarUrl={display.avatarUrl} name={display.name} />}
    >
      <section className="space-y-4 pb-4">
        <header className="rounded-[32px] bg-surface-container-low p-6 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
            {session.myDeck.game.name}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            {session.name ?? "대회 결과"}
          </h1>
          <p className="mt-2 text-sm text-muted">{formatDate(session.playedOn)}</p>
        </header>

        <article className="rounded-[32px] bg-surface-container-low p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">사용한 덱</p>
          <p className="mt-3 text-xl font-semibold tracking-tight text-ink">
            {session.myDeck.name}
          </p>
        </article>

        <article className="rounded-[32px] bg-surface-container-low p-5 text-center shadow-sm">
          <p className="text-3xl font-black tracking-tight text-ink">
            <span className="text-success">{wins}승</span>
            <span className="mx-2 text-muted">·</span>
            <span className="text-danger">{losses}패</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            승률 {winRate}% · 총 {totalMatches}라운드
          </p>
        </article>

        <section className="space-y-3">
          {session.matches.length > 0 ? (
            session.matches.map((match, index) => (
              <article
                key={match.id}
                className={`rounded-[24px] px-4 py-4 shadow-sm ${
                  match.isMatchWin
                    ? "bg-success/[0.07] ring-1 ring-success/20"
                    : "bg-danger/[0.04] ring-1 ring-danger/15"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
                      ROUND {index + 1}
                    </p>
                    <h2 className="mt-1 truncate text-base font-semibold text-ink">
                      {getOpponentDeckLabel(match.opponentDeckName)}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {match.wins}-{match.losses}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      match.isMatchWin
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {match.isMatchWin ? "WIN" : "LOSS"}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-[32px] bg-surface-container-low p-6 text-center shadow-sm">
              <p className="text-sm text-muted">기록된 라운드가 없습니다.</p>
            </article>
          )}
        </section>

        <Link
          href="/matches"
          className="inline-flex w-full items-center justify-center rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink"
        >
          기록 목록으로 돌아가기
        </Link>
      </section>
    </AppShell>
  );
}

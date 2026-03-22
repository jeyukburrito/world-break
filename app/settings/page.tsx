import Link from "next/link";

import { Prisma } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { HeaderActions } from "@/components/header-actions";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { deleteAccount } from "./actions";
import { signOut } from "../login/actions";

type MatchStatsRow = {
  total: bigint | number;
  wins: bigint | number;
};

function bigintToNumber(value: bigint | number) {
  return typeof value === "bigint" ? Number(value) : value;
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(value);
}

async function getProfileStats(userId: string) {
  const rows = await prisma.$queryRaw<MatchStatsRow[]>(Prisma.sql`
    SELECT
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE "isMatchWin")::bigint AS wins
    FROM "match_results"
    WHERE "userId" = CAST(${userId} AS uuid)
  `);

  const row = rows[0];
  const total = row ? bigintToNumber(row.total) : 0;
  const wins = row ? bigintToNumber(row.wins) : 0;
  const rate = total === 0 ? null : Math.round((wins / total) * 100);

  return { total, rate };
}

export default async function SettingsPage() {
  const authUser = await requireUser();
  const display = getUserDisplayInfo(authUser);
  const isGuest = authUser.isGuest;

  const [profile, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: authUser.id },
      select: { createdAt: true },
    }),
    getProfileStats(authUser.id),
  ]);

  return (
    <AppShell
      title="설정"
      headerRight={<HeaderActions avatarUrl={display.avatarUrl} name={display.name} />}
    >
      <div className="mx-auto flex max-w-md flex-col gap-6 pb-8">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">Profile</p>
            <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-ink">
              {display.name ?? "미설정"}
            </h2>
            <p className="mt-1 truncate text-sm text-muted">{display.email ?? "-"}</p>
          </div>
        </section>

        <section>
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
            Match Stats
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="총 경기" value={`${stats.total}회`} />
            <StatCard
              label="승률"
              value={stats.rate !== null ? `${stats.rate}%` : "-"}
              accent={stats.rate !== null && stats.rate >= 50}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <SettingsLink
            href="/settings/export"
            label="CSV 내보내기"
            description="조건에 맞는 기록을 CSV로 받습니다."
          />
        </section>

        <section>
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
            Account
          </p>
          <article className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
            <dl className="space-y-0 divide-y divide-line">
              <div className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted">{isGuest ? "모드" : "가입일"}</dt>
                <dd className="font-semibold text-ink">
                  {isGuest ? "게스트" : formatDate(profile?.createdAt ?? null)}
                </dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-paper"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">로그아웃</span>
                <span className="mt-1 block text-xs text-muted">현재 세션을 종료합니다.</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-muted" aria-hidden="true">
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </section>

        <section>
          <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-danger">
            Danger Zone
          </p>
          <article className="rounded-3xl border border-danger/20 bg-danger/5 p-5 shadow-sm">
            <form action={deleteAccount}>
              <p className="mb-4 text-sm leading-6 text-muted">
                {isGuest
                  ? "게스트 데이터와 세션을 이 기기에서 제거합니다."
                  : "회원 탈퇴 시 계정과 경기 기록이 모두 삭제되며 복구할 수 없습니다."}
              </p>
              <DeleteAccountButton />
            </form>
          </article>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-3xl p-4 shadow-sm ${accent ? "bg-accent text-white" : "bg-surface"}`}>
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.28em] ${
          accent ? "text-white/70" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black tracking-tight ${accent ? "text-white" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}

function SettingsLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-paper"
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
      </span>
      <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-muted" aria-hidden="true">
        <path
          d="M9 18l6-6-6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

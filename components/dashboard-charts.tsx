// components/dashboard-charts.tsx
import Link from "next/link";

import type { DonutSlice, MatchupCell } from "@/lib/dashboard";

const COLORS = [
  "#4f46e5",
  "#8f5a20",
  "#3b6fa0",
  "#dc2626",
  "#6b5b95",
  "#d8a347",
  "#2e8b7a",
  "#c06050",
  "#4a7c59",
  "#7a6352",
];

type DashboardChartsProps = {
  myDeckSlices: DonutSlice[];
  opponentSlices: DonutSlice[];
  matchupCells: MatchupCell[];
  totalMatches: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function buildConicGradient(slices: DonutSlice[]) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return "conic-gradient(#e2e8f0 0% 100%)";
  }

  let cursor = 0;
  const segments = slices.map((slice, index) => {
    const start = cursor;
    const stop = start + (slice.value / total) * 100;
    cursor = stop;
    return `${COLORS[index % COLORS.length]} ${start.toFixed(2)}% ${stop.toFixed(2)}%`;
  });

  if (cursor < 100) {
    segments.push(`#e2e8f0 ${cursor.toFixed(2)}% 100%`);
  }

  return `conic-gradient(${segments.join(", ")})`;
}

function ringLabel(value: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

// 2-column 통계 카드 (보더 없음, 소프트 쉐도우)
function StatCard({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <article className="rounded-[24px] bg-surface p-5 shadow-[0_4px_20px_-4px_rgba(25,28,30,0.06)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-ink">{value}</p>
      {subtext ? <p className="mt-1.5 text-sm text-muted">{subtext}</p> : null}
    </article>
  );
}

// 분포 도넛 차트 카드 — 보더 없음, 색상 bar 인디케이터
function DistributionCard({
  title,
  centerLabel,
  slices,
  totalMatches,
  emptyHref,
}: {
  title: string;
  centerLabel: string;
  slices: DonutSlice[];
  totalMatches: number;
  emptyHref: string;
}) {
  const hasData = slices.length > 0 && totalMatches > 0;
  const topSlices = slices.slice(0, 4);
  const totalValue = slices.reduce((sum, slice) => sum + slice.value, 0);
  const gradient = buildConicGradient(slices);

  return (
    <article className="rounded-[28px] bg-surface p-5 shadow-[0_4px_20px_-4px_rgba(25,28,30,0.06)]">
      {/* 헤더: 색상 bar 인디케이터 + 제목 */}
      <div className="flex items-center gap-2.5">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
        <span className="ml-auto rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium text-muted">
          {formatNumber(totalValue)}경기
        </span>
      </div>

      {hasData ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
          {/* 도넛 차트 */}
          <div className="flex items-center justify-center">
            <div
              className="relative flex size-40 items-center justify-center rounded-full"
              style={{ background: gradient }}
            >
              {/* 안쪽 원 — 보더 없이 bg만 */}
              <div className="flex size-24 items-center justify-center rounded-full bg-surface text-center">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                    {centerLabel}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-ink">
                    {topSlices[0]?.name ?? "-"}
                  </p>
                  <p className="text-xs text-muted">
                    {topSlices[0] ? ringLabel(topSlices[0].value, totalMatches) : "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 범례 리스트 */}
          <div className="space-y-2">
            {topSlices.map((slice, index) => (
              <div key={slice.name} className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="flex-1 truncate text-sm font-medium text-ink">{slice.name}</span>
                <span className="text-xs font-semibold text-muted">
                  {formatNumber(slice.value)} / {slice.rate}%
                </span>
              </div>
            ))}
            {slices.length > topSlices.length ? (
              <div className="rounded-2xl bg-paper px-3 py-2.5 text-xs text-muted">
                그 외 {slices.length - topSlices.length}개 항목
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[20px] bg-paper px-5 py-8 text-center">
          <p className="text-sm font-medium text-ink">아직 분포 데이터가 없습니다.</p>
          <p className="mt-1.5 text-sm text-muted">첫 기록을 추가하면 분포와 상성이 채워집니다.</p>
          <Link
            href={emptyHref}
            className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            기록 추가
          </Link>
        </div>
      )}
    </article>
  );
}

export function DashboardCharts({
  myDeckSlices,
  opponentSlices,
  matchupCells,
  totalMatches,
}: DashboardChartsProps) {
  const totalWins = myDeckSlices.reduce((sum, slice) => sum + slice.wins, 0);
  const winRate = totalMatches === 0 ? 0 : Math.round((totalWins / totalMatches) * 100);

  // 승률 높은 순, 동점이면 경기수 많은 순
  const topMatchups = [...matchupCells]
    .sort((a, b) => b.rate - a.rate || b.total - a.total || a.opponentDeck.localeCompare(b.opponentDeck))
    .slice(0, 6);

  return (
    <section className="space-y-4">
      {/* 핵심 지표 2열 그리드 */}
      <div className="grid gap-4 grid-cols-2">
        <StatCard
          label="승률"
          value={`${winRate}%`}
          subtext={totalMatches > 0 ? `${formatNumber(totalWins)}승 포함` : "데이터가 더 필요합니다"}
        />
        <StatCard
          label="총 전적"
          value={formatNumber(totalMatches)}
          subtext={totalMatches > 0 ? `${formatNumber(totalWins)}승 · ${formatNumber(totalMatches - totalWins)}패` : "기록 없음"}
        />
      </div>

      {/* 분포 도넛 차트 2개 — 단일 컨테이너 카드 내부 */}
      <div className="rounded-[32px] bg-surface-container-low p-4 shadow-[0_4px_20px_-4px_rgba(25,28,30,0.04)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <DistributionCard
            title="내 덱 분포"
            centerLabel="MAIN"
            slices={myDeckSlices}
            totalMatches={totalMatches}
            emptyHref="/matches/new"
          />
          <DistributionCard
            title="상대 덱 분포"
            centerLabel="TIER 1"
            slices={opponentSlices}
            totalMatches={totalMatches}
            emptyHref="/matches/new"
          />
        </div>
      </div>

      {/* 상성 매트릭스 */}
      <article className="rounded-[32px] bg-surface p-5 shadow-[0_4px_20px_-4px_rgba(25,28,30,0.06)]">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-1 rounded-full bg-accent" />
          <h3 className="text-base font-semibold tracking-tight text-ink">상성 매트릭스</h3>
          <Link
            href="/matchups"
            className="ml-auto text-xs font-semibold text-accent hover:underline"
          >
            전체 보기
          </Link>
        </div>

        {topMatchups.length > 0 ? (
          <div className="mt-4 space-y-2">
            {topMatchups.map((cell) => {
              const losses = cell.total - cell.wins;
              const isFavored = cell.rate >= 55;
              const isUnfavored = cell.rate < 45;

              return (
                <div
                  key={`${cell.myDeck}:${cell.opponentDeck}`}
                  className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(25,28,30,0.04)]"
                >
                  <div className="min-w-0 flex-1">
                    {/* 덱명 */}
                    <p className="truncate text-sm font-semibold text-ink">
                      {cell.myDeck}
                      <span className="mx-1.5 font-normal text-muted">vs</span>
                      {cell.opponentDeck}
                    </p>
                    {/* 승률 텍스트 */}
                    <p className="mt-0.5 text-xs text-muted">
                      {cell.rate}% 승률 · {formatNumber(cell.total)}경기
                    </p>
                  </div>

                  {/* W/L 뱃지 */}
                  <div className="ml-4 flex items-center gap-1.5 shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isFavored
                          ? "bg-success/15 text-success"
                          : isUnfavored
                            ? "bg-error-container/40 text-error"
                            : "bg-accent/10 text-accent"
                      }`}
                    >
                      {formatNumber(cell.wins)}W
                    </span>
                    <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-bold text-muted">
                      {formatNumber(losses)}L
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[20px] bg-paper px-5 py-8 text-center text-sm text-muted">
            상성 데이터를 만들 기록이 아직 없습니다.
          </div>
        )}
      </article>
    </section>
  );
}

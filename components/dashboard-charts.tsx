// components/dashboard-charts.tsx
import Link from "next/link";

import type { DonutSlice } from "@/lib/dashboard";

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
  totalMatches: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

const OTHER_COLOR = "#52525b";

function buildConicGradient(slices: DonutSlice[], maxSlices: number) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return "conic-gradient(#e2e8f0 0% 100%)";
  }

  const visible = slices.slice(0, maxSlices);
  const otherValue = slices.slice(maxSlices).reduce((sum, s) => sum + s.value, 0);

  let cursor = 0;
  const segments = visible.map((slice, index) => {
    const start = cursor;
    const stop = start + (slice.value / total) * 100;
    cursor = stop;
    return `${COLORS[index % COLORS.length]} ${start.toFixed(2)}% ${stop.toFixed(2)}%`;
  });

  if (otherValue > 0) {
    const start = cursor;
    const stop = start + (otherValue / total) * 100;
    cursor = stop;
    segments.push(`${OTHER_COLOR} ${start.toFixed(2)}% ${stop.toFixed(2)}%`);
  }

  if (cursor < 100) {
    segments.push(`#e2e8f0 ${cursor.toFixed(2)}% 100%`);
  }

  return `conic-gradient(${segments.join(", ")})`;
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
const MAX_VISIBLE_SLICES = 3;

function DistributionCard({
  title,
  slices,
  totalMatches,
  emptyHref,
}: {
  title: string;
  slices: DonutSlice[];
  totalMatches: number;
  emptyHref: string;
}) {
  const hasData = slices.length > 0 && totalMatches > 0;
  const topSlices = slices.slice(0, MAX_VISIBLE_SLICES);
  const otherSlices = slices.slice(MAX_VISIBLE_SLICES);
  const otherValue = otherSlices.reduce((sum, s) => sum + s.value, 0);
  const totalValue = slices.reduce((sum, slice) => sum + slice.value, 0);
  const gradient = buildConicGradient(slices, MAX_VISIBLE_SLICES);

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
              {/* 안쪽 원 */}
              <div className="size-24 rounded-full bg-surface" />
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
            {otherValue > 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: OTHER_COLOR }}
                />
                <span className="flex-1 text-sm font-medium text-muted">
                  기타 {otherSlices.length}개
                </span>
                <span className="text-xs font-semibold text-muted">
                  {formatNumber(otherValue)} / {totalValue > 0 ? Math.round((otherValue / totalValue) * 100) : 0}%
                </span>
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
  totalMatches,
}: DashboardChartsProps) {
  const totalWins = myDeckSlices.reduce((sum, slice) => sum + slice.wins, 0);
  const winRate = totalMatches === 0 ? 0 : Math.round((totalWins / totalMatches) * 100);

  return (
    <section className="space-y-4">
      {/* 핵심 지표 2열 그리드 */}
      <div className="grid gap-4 grid-cols-2">
        <StatCard
          label="승률"
          value={`${winRate}%`}
        />
        <StatCard
          label="전적"
          value={
            totalMatches > 0
              ? `${formatNumber(totalWins)}승 ${formatNumber(totalMatches - totalWins)}패`
              : "0승 0패"
          }
          subtext={totalMatches > 0 ? `총 ${formatNumber(totalMatches)}경기` : "기록 없음"}
        />
      </div>

      {/* 분포 도넛 차트 2개 — 단일 컨테이너 카드 내부 */}
      <div className="rounded-[32px] bg-surface-container-low p-4 shadow-[0_4px_20px_-4px_rgba(25,28,30,0.04)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <DistributionCard
            title="내 덱 분포"
            slices={myDeckSlices}
            totalMatches={totalMatches}
            emptyHref="/matches/new"
          />
          <DistributionCard
            title="상대 덱 분포"
            slices={opponentSlices}
            totalMatches={totalMatches}
            emptyHref="/matches/new"
          />
        </div>
      </div>

    </section>
  );
}

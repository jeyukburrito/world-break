import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { CategoryFilter } from "@/components/category-filter";
import { DashboardCharts } from "@/components/dashboard-charts";
import { HeaderActions } from "@/components/header-actions";
import { PeriodFilter } from "@/components/period-filter";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";
import { getDashboardData, getTopMatchups } from "@/lib/dashboard";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};


export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireUser();
  const display = getUserDisplayInfo(user);
  const params = searchParams ? await searchParams : undefined;
  const period = typeof params?.period === "string" ? params.period : "all";
  const from = typeof params?.from === "string" ? params.from : undefined;
  const to = typeof params?.to === "string" ? params.to : undefined;
  const category = typeof params?.category === "string" ? params.category : "all";

  const [{ myDeckSlices, opponentSlices, totalMatches }, topMatchups] = await Promise.all([
    getDashboardData(user.id, {
      period,
      from,
      to,
      category,
    }),
    getTopMatchups(user.id, {
      period,
      from,
      to,
      category,
    }),
  ]);

  return (
    <AppShell
      title="대시보드"
      headerRight={<HeaderActions avatarUrl={display.avatarUrl} name={display.name} />}
    >
      {/* 기간 필터 */}
      <div className="mb-3">
        <Suspense fallback={null}>
          <PeriodFilter activePeriod={period} defaultFrom={from} defaultTo={to} />
        </Suspense>
      </div>
      {/* 카테고리 필터: 카드 없이 pill 행만 */}
      <div className="mb-5">
        <Suspense fallback={null}>
          <CategoryFilter activeCategory={category} />
        </Suspense>
      </div>

      <DashboardCharts
        myDeckSlices={myDeckSlices}
        opponentSlices={opponentSlices}
        topMatchups={topMatchups}
        totalMatches={totalMatches}
      />
    </AppShell>
  );
}

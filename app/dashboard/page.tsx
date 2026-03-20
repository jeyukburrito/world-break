import { AppShell } from "@/components/app-shell";
import { CategoryFilter } from "@/components/category-filter";
import { DashboardCharts } from "@/components/dashboard-charts";
import { HeaderActions } from "@/components/header-actions";
import { PeriodFilter } from "@/components/period-filter";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";
import { getDashboardData, getMatchupMatrix } from "@/lib/dashboard";

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

  const [{ myDeckSlices, opponentSlices, totalMatches }, matchupCells] = await Promise.all([
    getDashboardData(user.id, {
      period,
      from,
      to,
      category,
    }),
    getMatchupMatrix(user.id, {
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
      {/* 컴팩트 헤더: 라벨 + 제목 + 기간 필터 인라인 배치 */}
      <section className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Overview</p>
          <h2 className="text-2xl font-bold tracking-tight text-ink">대시보드</h2>
        </div>
        <PeriodFilter activePeriod={period} defaultFrom={from} defaultTo={to} />
      </section>

      {/* 카테고리 필터: 카드 없이 pill 행만 */}
      <div className="mb-5">
        <CategoryFilter activeCategory={category} />
      </div>

      <DashboardCharts
        myDeckSlices={myDeckSlices}
        opponentSlices={opponentSlices}
        matchupCells={matchupCells}
        totalMatches={totalMatches}
      />
    </AppShell>
  );
}

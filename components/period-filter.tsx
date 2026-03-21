"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type PeriodFilterProps = {
  activePeriod: string;
  defaultFrom?: string;
  defaultTo?: string;
};

const presets = [
  { label: "7일", value: "7d" },
  { label: "30일", value: "30d" },
  { label: "전체", value: "all" },
] as const;

export function PeriodFilter({ activePeriod, defaultFrom, defaultTo }: PeriodFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 커스텀 날짜 폼 표시 여부
  const [showCustom, setShowCustom] = useState(activePeriod === "custom");

  const navigate = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(params)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      window.gtag?.("event", "dashboard_filter", { period: params.period });
      router.push(`/dashboard?${sp.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-col items-start gap-2">
      {/* 프리셋 pill 토글 */}
      <div className="flex items-center gap-1 rounded-full bg-paper p-1">
        {presets.map((p) => (
          <button
            key={p.value}
            type="button"
            aria-pressed={activePeriod === p.value}
            onClick={() => {
              setShowCustom(false);
              navigate({ period: p.value });
            }}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activePeriod === p.value
                ? "bg-accent text-white shadow-[0_4px_12px_-2px_rgba(79,70,229,0.35)]"
                : "text-muted hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
        {/* 커스텀 기간 진입 버튼 */}
        <button
          type="button"
          aria-pressed={activePeriod === "custom"}
          onClick={() => setShowCustom((v) => !v)}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            activePeriod === "custom"
              ? "bg-accent text-white shadow-[0_4px_12px_-2px_rgba(79,70,229,0.35)]"
              : "text-muted hover:text-ink"
          }`}
        >
          직접입력
        </button>
      </div>

      {/* 커스텀 날짜 폼 — 토글로 접기/펼치기 */}
      {showCustom && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            navigate({
              period: "custom",
              from: fd.get("from") as string,
              to: fd.get("to") as string,
            });
          }}
          className="flex flex-wrap items-end gap-2 rounded-2xl bg-surface-container-low p-3"
        >
          <label className="grid gap-1 text-xs text-muted">
            시작일
            <input
              type="date"
              name="from"
              defaultValue={defaultFrom}
              className="rounded-xl bg-surface px-3 py-1.5 text-xs text-ink shadow-sm"
            />
          </label>
          <label className="grid gap-1 text-xs text-muted">
            종료일
            <input
              type="date"
              name="to"
              defaultValue={defaultTo}
              className="rounded-xl bg-surface px-3 py-1.5 text-xs text-ink shadow-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white"
          >
            적용
          </button>
        </form>
      )}
    </div>
  );
}

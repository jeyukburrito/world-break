"use client";

import { useState } from "react";

type EventCategorySelectProps = {
  defaultValue?: string;
  defaultTournamentDetail?: string;
};

const CATEGORIES = [
  { value: "friendly", label: "친선" },
  { value: "shop", label: "대회" },
] as const;

export function EventCategorySelect({
  defaultValue = "friendly",
  defaultTournamentDetail = "",
}: EventCategorySelectProps) {
  const [selected, setSelected] = useState(defaultValue);
  const [tournamentDetail, setTournamentDetail] = useState(defaultTournamentDetail);

  return (
    <div className="grid gap-3 md:col-span-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">대회 유형</span>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-container-low p-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setSelected(cat.value)}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
              selected === cat.value
                ? "bg-surface text-accent shadow-sm"
                : "text-muted"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="eventCategory" value={selected} />

      {selected === "shop" ? (
        <input
          type="text"
          name="tournamentDetail"
          placeholder="대회 세부 내용을 입력해주세요"
          value={tournamentDetail}
          onChange={(e) => setTournamentDetail(e.target.value)}
          maxLength={200}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted"
        />
      ) : null}
    </div>
  );
}

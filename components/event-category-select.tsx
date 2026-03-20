"use client";

import { useState } from "react";

type EventCategorySelectProps = {
  defaultValue?: string;
};

const CATEGORIES = [
  { value: "friendly", label: "친선전" },
  { value: "shop", label: "매장대회" },
  { value: "cs", label: "CS" },
] as const;

export function EventCategorySelect({ defaultValue = "friendly" }: EventCategorySelectProps) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <div className="grid gap-2 text-sm font-medium md:col-span-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">대회 유형</span>
      <div className="grid grid-cols-3 gap-2 rounded-full bg-surface-container-low p-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setSelected(cat.value)}
            className={`rounded-full px-3 py-3 text-sm font-semibold transition-all ${
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
    </div>
  );
}

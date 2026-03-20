"use client";

import { useState } from "react";

type MatchDetailControlsProps = {
  defaultPlayOrder?: "first" | "second";
  defaultDidChoosePlayOrder?: boolean;
};

const PLAY_ORDER_OPTIONS = [
  { value: "first", label: "선공" },
  { value: "second", label: "후공" },
] as const;

const DECISION_OPTIONS = [
  { value: "true", label: "직접 결정" },
  { value: "false", label: "랜덤/상대 결정" },
] as const;

function SegmentedControl({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">{label}</p>
      <input type="hidden" name={name} value={value} />
      {/* pill-shaped 세그먼트 컨트롤 */}
      <div className="grid grid-cols-2 gap-1.5 rounded-full bg-surface-container-low p-1.5">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full px-4 py-3 text-sm font-semibold transition-all ${
                active ? "bg-surface text-accent shadow-sm" : "text-muted"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MatchDetailControls({
  defaultPlayOrder = "first",
  defaultDidChoosePlayOrder = false,
}: MatchDetailControlsProps) {
  const [playOrder, setPlayOrder] = useState<"first" | "second">(defaultPlayOrder);
  const [didChoosePlayOrder, setDidChoosePlayOrder] = useState(
    defaultDidChoosePlayOrder ? "true" : "false",
  );

  return (
    // 카드 래퍼 제거 — 두 세그먼트 컨트롤을 나란히 2열로 배치
    <section className="grid grid-cols-2 gap-6">
      <SegmentedControl
        label="선후공"
        name="playOrder"
        value={playOrder}
        options={PLAY_ORDER_OPTIONS}
        onChange={(next) => setPlayOrder(next as "first" | "second")}
      />
      <SegmentedControl
        label="결정 방식"
        name="didChoosePlayOrder"
        value={didChoosePlayOrder}
        options={DECISION_OPTIONS}
        onChange={setDidChoosePlayOrder}
      />
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

type MatchDetailControlsProps = {
  defaultPlayOrder?: "first" | "second";
  defaultDidChoosePlayOrder?: boolean;
  format?: string;
};

type MatchFormat = "bo1" | "bo3";

export const MATCH_FORMAT_EVENT = "world-break:match-format-change";

const PLAY_ORDER_OPTIONS = [
  { value: "first", label: "선공" },
  { value: "second", label: "후공" },
] as const;

const DECISION_OPTIONS = [
  { value: "true", label: "내가 선택" },
  { value: "false", label: "상대가 선택" },
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

function normalizeFormat(value?: string): MatchFormat {
  return value === "bo3" ? "bo3" : "bo1";
}

export function MatchDetailControls({
  defaultPlayOrder = "first",
  defaultDidChoosePlayOrder = false,
  format,
}: MatchDetailControlsProps) {
  const [playOrder, setPlayOrder] = useState<"first" | "second">(defaultPlayOrder);
  const [didChoosePlayOrder, setDidChoosePlayOrder] = useState(
    defaultDidChoosePlayOrder ? "true" : "false",
  );
  const [currentFormat, setCurrentFormat] = useState<MatchFormat>(normalizeFormat(format));

  useEffect(() => {
    setCurrentFormat(normalizeFormat(format));
  }, [format]);

  useEffect(() => {
    const handleFormatChange = (event: Event) => {
      const detail = (event as CustomEvent<{ format?: string }>).detail;
      setCurrentFormat(normalizeFormat(detail?.format));
    };

    window.addEventListener(MATCH_FORMAT_EVENT, handleFormatChange as EventListener);
    return () => {
      window.removeEventListener(MATCH_FORMAT_EVENT, handleFormatChange as EventListener);
    };
  }, []);

  return (
    <section className={currentFormat === "bo3" ? "grid gap-6" : "grid grid-cols-2 gap-6"}>
      {currentFormat === "bo3" ? null : (
        <SegmentedControl
          label="선후공"
          name="playOrder"
          value={playOrder}
          options={PLAY_ORDER_OPTIONS}
          onChange={(next) => setPlayOrder(next as "first" | "second")}
        />
      )}
      <SegmentedControl
        label="선택 주체"
        name="didChoosePlayOrder"
        value={didChoosePlayOrder}
        options={DECISION_OPTIONS}
        onChange={setDidChoosePlayOrder}
      />
    </section>
  );
}

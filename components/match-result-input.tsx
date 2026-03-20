"use client";

import { useState } from "react";

type MatchResultInputProps = {
  defaultFormat?: string;
  defaultResult?: string;
};

export function MatchResultInput({
  defaultFormat = "bo1",
  defaultResult = "win",
}: MatchResultInputProps) {
  const [format, setFormat] = useState(defaultFormat);
  const [result, setResult] = useState<"win" | "lose">(
    defaultResult === "lose" ? "lose" : "win",
  );

  return (
    <section className="space-y-6">
      {/* 매치 형식 — pill-shaped 세그먼트 컨트롤 */}
      <div className="grid gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">매치 형식</p>
        <div className="grid grid-cols-2 gap-1.5 rounded-full bg-surface-container-low p-1.5">
          <input type="hidden" name="matchFormat" value={format} />
          <button
            type="button"
            onClick={() => setFormat("bo1")}
            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
              format === "bo1" ? "bg-surface text-accent shadow-sm" : "text-muted"
            }`}
          >
            BO1
          </button>
          <button
            type="button"
            onClick={() => setFormat("bo3")}
            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
              format === "bo3" ? "bg-surface text-accent shadow-sm" : "text-muted"
            }`}
          >
            BO3
          </button>
        </div>
      </div>

      {/* 매치 결과 — 큰 버튼, 아이콘 포함 */}
      <div className="grid gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">매치 결과</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setResult("win")}
            className={`flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-base font-bold transition-all ${
              result === "win"
                ? "border-transparent bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md"
                : "border-outline-variant/15 bg-surface-container-lowest text-outline"
            }`}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              emoji_events
            </span>
            승리
          </button>
          <button
            type="button"
            onClick={() => setResult("lose")}
            className={`flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-base font-bold transition-all ${
              result === "lose"
                ? "border-danger bg-danger/10 text-danger shadow-sm"
                : "border-outline-variant/15 bg-surface-container-lowest text-outline"
            }`}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              sentiment_dissatisfied
            </span>
            패배
          </button>
        </div>
        <input type="hidden" name="result" value={result} />
      </div>
    </section>
  );
}

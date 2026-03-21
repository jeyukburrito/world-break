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
      {/* 매치 형식 */}
      <div className="grid gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">매치 형식</p>
        <input type="hidden" name="matchFormat" value={format} />
        <div className="grid grid-cols-2 gap-1.5 rounded-full bg-surface-container-low p-1.5">
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

      {/* 매치 결과 */}
      <div className="grid gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">매치 결과</p>
        <input type="hidden" name="result" value={result} />
        <div className="grid grid-cols-2 gap-1.5 rounded-full bg-surface-container-low p-1.5">
          <button
            type="button"
            onClick={() => setResult("win")}
            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
              result === "win" ? "bg-surface text-accent shadow-sm" : "text-muted"
            }`}
          >
            승리
          </button>
          <button
            type="button"
            onClick={() => setResult("lose")}
            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
              result === "lose" ? "bg-surface text-danger shadow-sm" : "text-muted"
            }`}
          >
            패배
          </button>
        </div>
      </div>
    </section>
  );
}

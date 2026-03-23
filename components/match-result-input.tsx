"use client";

import { useState } from "react";

type MatchResultInputProps = {
  defaultFormat?: string;
  defaultResult?: string;
  defaultWins?: number;
  defaultLosses?: number;
};

export function MatchResultInput({
  defaultFormat = "bo1",
  defaultResult = "win",
  defaultWins,
  defaultLosses,
}: MatchResultInputProps) {
  const [format, setFormat] = useState(defaultFormat);
  const [result, setResult] = useState<"win" | "lose">(
    defaultResult === "lose" ? "lose" : "win",
  );
  const [myWins, setMyWins] = useState(
    defaultFormat === "bo3" && defaultWins !== undefined ? String(defaultWins) : "",
  );
  const [myLosses, setMyLosses] = useState(
    defaultFormat === "bo3" && defaultLosses !== undefined ? String(defaultLosses) : "",
  );

  const sanitizeScoreInput = (value: string) => value.replace(/[^0-2]/g, "").slice(0, 1);

  const handleFormatChange = (next: string) => {
    setFormat(next);
    if (next === "bo3") {
      setMyWins("");
      setMyLosses("");
    }
  };

  const handleResultChange = (next: "win" | "lose") => {
    setResult(next);
    if (format === "bo3") {
      setMyWins("");
      setMyLosses("");
    }
  };

  const bo3Score =
    format === "bo3"
      ? (`${myWins || (result === "win" ? "2" : "0")}-${myLosses || (result === "win" ? "0" : "2")}` as
          | "2-0"
          | "2-1"
          | "0-2"
          | "1-2")
      : undefined;

  return (
    <section className="space-y-6">
      {/* 매치 형식 */}
      <div className="grid gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">매치 형식</p>
        <input type="hidden" name="matchFormat" value={format} />
        <div className="grid grid-cols-2 gap-1.5 rounded-full bg-surface-container-low p-1.5">
          <button
            type="button"
            onClick={() => handleFormatChange("bo1")}
            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
              format === "bo1" ? "bg-surface text-accent shadow-sm" : "text-muted"
            }`}
          >
            BO1
          </button>
          <button
            type="button"
            onClick={() => handleFormatChange("bo3")}
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
            onClick={() => handleResultChange("win")}
            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
              result === "win" ? "bg-surface text-accent shadow-sm" : "text-muted"
            }`}
          >
            승리
          </button>
          <button
            type="button"
            onClick={() => handleResultChange("lose")}
            className={`rounded-full px-4 py-3 text-sm font-bold transition-all ${
              result === "lose" ? "bg-surface text-danger shadow-sm" : "text-muted"
            }`}
          >
            패배
          </button>
        </div>
      </div>

      {/* BO3 세부 점수 — 직접 입력 */}
      {format === "bo3" ? (
        <div className="grid gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">세부 점수</p>
          <input type="hidden" name="bo3Score" value={bo3Score} />
          <div className="flex items-center justify-center gap-3">
            <label className="grid gap-1 text-center">
              <span className="text-xs text-muted">내 승</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-2]"
                maxLength={1}
                value={myWins}
                placeholder="0"
                onChange={(e) => setMyWins(sanitizeScoreInput(e.target.value))}
                className="w-16 rounded-2xl bg-surface-container-high px-3 py-3 text-center text-lg font-bold text-ink"
              />
            </label>
            <span className="mt-5 text-lg font-bold text-muted">-</span>
            <label className="grid gap-1 text-center">
              <span className="text-xs text-muted">내 패</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-2]"
                maxLength={1}
                value={myLosses}
                placeholder="0"
                onChange={(e) => setMyLosses(sanitizeScoreInput(e.target.value))}
                className="w-16 rounded-2xl bg-surface-container-high px-3 py-3 text-center text-lg font-bold text-ink"
              />
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}

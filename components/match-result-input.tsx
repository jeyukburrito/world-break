"use client";

import { useEffect, useRef, useState } from "react";

import { MATCH_FORMAT_EVENT } from "@/components/match-detail-controls";

type MatchResultInputProps = {
  defaultFormat?: string;
  defaultResult?: string;
  defaultWins?: number;
  defaultLosses?: number;
  defaultBo3PlaySequence?: string;
};

function sanitizeScoreInput(value: string) {
  return value.replace(/[^0-2]/g, "").slice(0, 1);
}

function getBo3GameCount(wins: string, losses: string) {
  const score = `${wins}-${losses}`;

  if (score === "2-0" || score === "0-2") {
    return 2;
  }

  if (score === "2-1" || score === "1-2") {
    return 3;
  }

  return null;
}

function normalizeBo3PlaySequence(value: string | undefined, gameCount: number | null) {
  if (!gameCount) {
    return "";
  }

  const normalized = value?.toUpperCase().replace(/[^FS]/g, "") ?? "";
  if (normalized.length === gameCount) {
    return normalized;
  }

  return "F".repeat(gameCount);
}

function formatSequenceEntry(value: string) {
  return value === "S" ? "후공" : "선공";
}

export function MatchResultInput({
  defaultFormat = "bo1",
  defaultResult = "win",
  defaultWins,
  defaultLosses,
  defaultBo3PlaySequence,
}: MatchResultInputProps) {
  const [format, setFormat] = useState(defaultFormat === "bo3" ? "bo3" : "bo1");
  const [result, setResult] = useState<"win" | "lose">(
    defaultResult === "lose" ? "lose" : "win",
  );
  const [myWins, setMyWins] = useState(
    defaultFormat === "bo3" && defaultWins !== undefined ? String(defaultWins) : "",
  );
  const [myLosses, setMyLosses] = useState(
    defaultFormat === "bo3" && defaultLosses !== undefined ? String(defaultLosses) : "",
  );
  const initialGameCount =
    defaultFormat === "bo3"
      ? getBo3GameCount(
          defaultWins !== undefined ? String(defaultWins) : "",
          defaultLosses !== undefined ? String(defaultLosses) : "",
        )
      : null;
  const [bo3PlaySequence, setBo3PlaySequence] = useState(() =>
    normalizeBo3PlaySequence(defaultBo3PlaySequence, initialGameCount),
  );

  const gameCount = format === "bo3" ? getBo3GameCount(myWins, myLosses) : null;
  const previousGameCountRef = useRef<number | null>(initialGameCount);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(MATCH_FORMAT_EVENT, {
        detail: { format },
      }),
    );
  }, [format]);

  useEffect(() => {
    if (format !== "bo3") {
      previousGameCountRef.current = null;
      if (bo3PlaySequence) {
        setBo3PlaySequence("");
      }
      return;
    }

    if (gameCount === null) {
      previousGameCountRef.current = null;
      if (bo3PlaySequence) {
        setBo3PlaySequence("");
      }
      return;
    }

    if (previousGameCountRef.current === gameCount) {
      return;
    }

    previousGameCountRef.current = gameCount;
    setBo3PlaySequence("F".repeat(gameCount));
  }, [bo3PlaySequence, format, gameCount]);

  const handleFormatChange = (next: "bo1" | "bo3") => {
    setFormat(next);

    if (next === "bo3") {
      setMyWins("");
      setMyLosses("");
      return;
    }

    setBo3PlaySequence("");
  };

  const handleResultChange = (next: "win" | "lose") => {
    setResult(next);

    if (format === "bo3") {
      setMyWins("");
      setMyLosses("");
      setBo3PlaySequence("");
    }
  };

  const bo3Score =
    format === "bo3" && gameCount
      ? (`${myWins}-${myLosses}` as "2-0" | "2-1" | "0-2" | "1-2")
      : undefined;
  const derivedPlayOrder =
    format === "bo3" && bo3PlaySequence[0] === "S" ? "second" : "first";

  return (
    <section className="space-y-6">
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

      {format === "bo3" ? (
        <div className="grid gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">게임 스코어</p>
          <input type="hidden" name="bo3Score" value={bo3Score ?? ""} />
          <input type="hidden" name="bo3PlaySequence" value={bo3PlaySequence} />
          <input type="hidden" name="playOrder" value={derivedPlayOrder} />
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
                onChange={(event) => setMyWins(sanitizeScoreInput(event.target.value))}
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
                onChange={(event) => setMyLosses(sanitizeScoreInput(event.target.value))}
                className="w-16 rounded-2xl bg-surface-container-high px-3 py-3 text-center text-lg font-bold text-ink"
              />
            </label>
          </div>
        </div>
      ) : null}

      {format === "bo3" && gameCount ? (
        <div className="grid gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
            게임별 선후공
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: gameCount }, (_, index) => {
              const currentValue = bo3PlaySequence[index] ?? "F";

              return (
                <div
                  key={index}
                  className="rounded-3xl bg-surface-container-low p-3"
                >
                  <p className="text-xs font-semibold text-muted">{`Game ${index + 1}`}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-full bg-surface-container-high p-1.5">
                    {(["F", "S"] as const).map((value) => {
                      const active = currentValue === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setBo3PlaySequence((current) => {
                              const next = current.padEnd(gameCount, "F").split("");
                              next[index] = value;
                              return next.join("");
                            })
                          }
                          className={`rounded-full px-3 py-2 text-sm font-semibold transition-all ${
                            active ? "bg-surface text-accent shadow-sm" : "text-muted"
                          }`}
                        >
                          {formatSequenceEntry(value)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

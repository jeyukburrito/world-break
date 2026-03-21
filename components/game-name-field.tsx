"use client";

import { useEffect, useState } from "react";

import { PRESET_GAMES } from "@/lib/preset-games";

const CUSTOM_VALUE = "__custom__";

export function GameNameField({ defaultValue }: { defaultValue?: string }) {
  const isCustomDefault =
    defaultValue !== undefined && !PRESET_GAMES.includes(defaultValue as (typeof PRESET_GAMES)[number]);

  const [selected, setSelected] = useState<string>(
    isCustomDefault ? CUSTOM_VALUE : (defaultValue ?? ""),
  );
  const [customText, setCustomText] = useState(isCustomDefault ? (defaultValue ?? "") : "");
  const [open, setOpen] = useState(false);

  const gameName = selected === CUSTOM_VALUE ? customText : selected;
  const displayLabel =
    selected === CUSTOM_VALUE
      ? customText || "직접 입력"
      : selected || "카드게임 선택";

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <div className="grid gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">카드게임</span>
        <input type="hidden" name="gameName" value={gameName} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-14 items-center justify-between rounded-2xl bg-surface-container-high px-4 py-3 text-left transition"
        >
          <span className={selected ? "font-semibold text-ink" : "text-muted"}>
            {displayLabel}
          </span>
          <span className="material-symbols-outlined text-[20px] text-muted" aria-hidden="true">
            expand_more
          </span>
        </button>

        {selected === CUSTOM_VALUE && (
          <input
            type="text"
            placeholder="카드게임 이름 입력"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            maxLength={60}
            className="rounded-2xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted"
          />
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-[32px] bg-surface p-4 shadow-soft">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-outline-variant/70" />
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">카드게임</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">게임 선택</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-muted"
                aria-label="닫기"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  close
                </span>
              </button>
            </div>
            <div className="no-scrollbar max-h-[55dvh] space-y-2 overflow-y-auto pb-2">
              {PRESET_GAMES.map((game) => {
                const active = selected === game;
                return (
                  <button
                    key={game}
                    type="button"
                    onClick={() => {
                      setSelected(game);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-[24px] px-4 py-4 text-left transition ${
                      active
                        ? "bg-primary-fixed text-primary shadow-sm"
                        : "bg-surface-container-low text-ink"
                    }`}
                  >
                    <span className="text-sm font-semibold">{game}</span>
                    {active ? (
                      <span className="material-symbols-outlined filled text-[20px]" aria-hidden="true">
                        check_circle
                      </span>
                    ) : null}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setSelected(CUSTOM_VALUE);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-[24px] px-4 py-4 text-left transition ${
                  selected === CUSTOM_VALUE
                    ? "bg-primary-fixed text-primary shadow-sm"
                    : "bg-surface-container-low text-ink"
                }`}
              >
                <span className="text-sm font-semibold">직접 입력</span>
                {selected === CUSTOM_VALUE ? (
                  <span className="material-symbols-outlined filled text-[20px]" aria-hidden="true">
                    check_circle
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useState } from "react";

import { PRESET_GAMES } from "@/lib/preset-games";

const CUSTOM_VALUE = "__custom__";

export function GameNameField({ defaultValue }: { defaultValue?: string }) {
  const isCustomDefault =
    defaultValue !== undefined && !PRESET_GAMES.includes(defaultValue as (typeof PRESET_GAMES)[number]);

  const [selected, setSelected] = useState<string>(
    isCustomDefault ? CUSTOM_VALUE : (defaultValue ?? ""),
  );
  const [customText, setCustomText] = useState(isCustomDefault ? (defaultValue ?? "") : "");

  const gameName = selected === CUSTOM_VALUE ? customText : selected;

  return (
    <div className="grid gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">카드게임</p>
      {/* 가로 스크롤 — -mx-4 px-4로 컨테이너 가장자리까지 확장 */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {PRESET_GAMES.map((game) => (
          <button
            key={game}
            type="button"
            onClick={() => setSelected(game)}
            className={`shrink-0 rounded px-3 py-2 text-sm font-semibold transition-colors ${
              selected === game
                ? "bg-primary-container text-on-primary"
                : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {game}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelected(CUSTOM_VALUE)}
          className={`shrink-0 rounded px-3 py-2 text-sm font-semibold transition-colors ${
            selected === CUSTOM_VALUE
              ? "bg-primary-container text-on-primary"
              : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          직접 입력
        </button>
      </div>

      {selected === CUSTOM_VALUE && (
        <input
          type="text"
          placeholder="카드게임 이름 입력"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          maxLength={60}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-ink"
        />
      )}

      <input type="hidden" name="gameName" value={gameName} />
    </div>
  );
}

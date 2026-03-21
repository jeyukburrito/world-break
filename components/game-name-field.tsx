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
      <p className="text-sm font-medium">카드게임</p>
      <div className="flex flex-wrap gap-2">
        {PRESET_GAMES.map((game) => (
          <button
            key={game}
            type="button"
            onClick={() => setSelected(game)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selected === game
                ? "bg-accent text-white"
                : "bg-paper text-muted hover:bg-line/60"
            }`}
          >
            {game}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelected(CUSTOM_VALUE)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            selected === CUSTOM_VALUE
              ? "bg-accent text-white"
              : "bg-paper text-muted hover:bg-line/60"
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

"use client";

import { useEffect, useId, useState } from "react";

// Listens to game selection changes dispatched by MatchPrefillFields
// to filter suggestions by the currently selected game.
const GAME_CHANGE_EVENT = "world-break:game-name-change";

type OpponentDeckFieldProps = {
  defaultGameName?: string;
  defaultValue?: string;
  recentByGame: Record<string, string[]>;
};

export function OpponentDeckField({ defaultGameName, defaultValue, recentByGame }: OpponentDeckFieldProps) {
  const [gameName, setGameName] = useState(defaultGameName ?? "");
  const listId = useId();

  useEffect(() => {
    const handler = (e: Event) => {
      const game = (e as CustomEvent<{ gameName: string }>).detail.gameName;
      setGameName(game);
    };
    window.addEventListener(GAME_CHANGE_EVENT, handler);
    return () => window.removeEventListener(GAME_CHANGE_EVENT, handler);
  }, []);

  const suggestions = recentByGame[gameName] ?? [];

  return (
    <label className="grid gap-2 text-sm font-semibold">
      상대 덱명
      <input
        name="opponentDeckName"
        type="text"
        required
        list={suggestions.length > 0 ? listId : undefined}
        defaultValue={defaultValue}
        className="rounded-2xl bg-surface-container-high px-4 py-3 text-ink"
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((deck) => (
            <option key={deck} value={deck} />
          ))}
        </datalist>
      )}
    </label>
  );
}

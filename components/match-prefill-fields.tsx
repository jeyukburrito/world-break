"use client";

import { useEffect, useState } from "react";

const GAME_CHANGE_EVENT = "world-break:game-name-change";

import { GameDeckFields } from "@/components/game-deck-fields";
import { MatchResultInput } from "@/components/match-result-input";
import type { NewMatchPrefill } from "@/lib/matches";

type MatchPrefillFieldsProps = {
  defaultGameName?: string;
  defaultDeckName?: string;
  defaultFormat?: string;
  gameDefaults: NewMatchPrefill["byGame"];
};

export function MatchPrefillFields({
  defaultGameName,
  defaultDeckName,
  defaultFormat,
  gameDefaults,
}: MatchPrefillFieldsProps) {
  const [selectedGameName, setSelectedGameName] = useState(defaultGameName ?? "");

  // Broadcast game changes so OpponentDeckField can filter suggestions reactively.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(GAME_CHANGE_EVENT, { detail: { gameName: selectedGameName } }),
    );
  }, [selectedGameName]);

  const deckDefaults = Object.fromEntries(
    Object.entries(gameDefaults).map(([gameName, preference]) => [gameName, preference.deckName]),
  );
  const formatDefaults = Object.fromEntries(
    Object.entries(gameDefaults).map(([gameName, preference]) => [gameName, preference.matchFormat]),
  ) as Record<string, "bo1" | "bo3">;

  return (
    <>
      <GameDeckFields
        defaultGameName={defaultGameName}
        defaultDeckName={defaultDeckName}
        defaultDeckNameByGame={deckDefaults}
        onGameNameChange={setSelectedGameName}
      />
      <MatchResultInput
        defaultFormat={defaultFormat}
        defaultResult={undefined}
        currentGameName={selectedGameName}
        defaultFormatByGame={formatDefaults}
      />
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

import { GameNameField } from "@/components/game-name-field";

const DECK_LABEL = "\ub0b4 \ub371\uba85";
const DECK_PLACEHOLDER = "\ub0b4 \ub371\uba85\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694";

type GameDeckFieldsProps = {
  defaultGameName?: string;
  defaultDeckName?: string;
  defaultDeckNameByGame?: Record<string, string>;
  onGameNameChange?: (gameName: string) => void;
};

export function GameDeckFields({
  defaultGameName,
  defaultDeckName,
  defaultDeckNameByGame,
  onGameNameChange,
}: GameDeckFieldsProps) {
  const initialGameName = defaultGameName ?? "";
  const [selectedGameName, setSelectedGameName] = useState(initialGameName);
  const [deckName, setDeckName] = useState(
    defaultDeckName ??
      (initialGameName ? defaultDeckNameByGame?.[initialGameName] ?? "" : ""),
  );
  const didMountRef = useRef(false);

  useEffect(() => {
    onGameNameChange?.(selectedGameName);
  }, [onGameNameChange, selectedGameName]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    setDeckName(selectedGameName ? defaultDeckNameByGame?.[selectedGameName] ?? "" : "");
  }, [defaultDeckNameByGame, selectedGameName]);

  return (
    <>
      <GameNameField defaultValue={defaultGameName} onValueChange={setSelectedGameName} />
      <label className="grid gap-2 text-sm font-semibold">
        {DECK_LABEL}
        <input
          name="myDeckName"
          type="text"
          required
          maxLength={60}
          value={deckName}
          onChange={(event) => setDeckName(event.target.value)}
          className="rounded-2xl bg-surface-container-high px-4 py-3 text-ink"
          placeholder={DECK_PLACEHOLDER}
        />
      </label>
    </>
  );
}

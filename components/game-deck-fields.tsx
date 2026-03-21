"use client";

import { GameNameField } from "@/components/game-name-field";

type GameDeckFieldsProps = {
  defaultGameName?: string;
  defaultDeckName?: string;
};

export function GameDeckFields({ defaultGameName, defaultDeckName }: GameDeckFieldsProps) {
  return (
    <>
      <GameNameField defaultValue={defaultGameName} />
      <label className="grid gap-2 text-sm font-semibold">
        내 덱명
        <input
          name="myDeckName"
          type="text"
          required
          maxLength={60}
          defaultValue={defaultDeckName}
          className="rounded-2xl bg-surface-container-high px-4 py-3 text-ink"
          placeholder="예: 어그로 덱"
        />
      </label>
    </>
  );
}

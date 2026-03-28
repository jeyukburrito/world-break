"use client";

import { useRouter, useSearchParams } from "next/navigation";

type GameFilterProps = {
  activeGame?: string;
  games: string[];
};

export function GameFilter({ activeGame = "all", games }: GameFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (games.length <= 1) return null;

  const handleSelect = (nextGame: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (nextGame === "all") {
      sp.delete("game");
    } else {
      sp.set("game", nextGame);
    }
    router.push(`/dashboard${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {[{ label: "전체", value: "all" }, ...games.map((g) => ({ label: g, value: g }))].map(
        (item) => {
          const isActive = activeGame === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => handleSelect(item.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-accent text-white shadow-[0_10px_20px_-8px_rgba(79,70,229,0.45)]"
                  : "bg-paper text-ink"
              }`}
              aria-pressed={isActive}
            >
              {item.label}
            </button>
          );
        },
      )}
    </div>
  );
}

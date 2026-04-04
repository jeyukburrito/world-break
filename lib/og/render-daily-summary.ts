import fs from "fs/promises";
import path from "path";

import { cache, createElement } from "react";

import { ImageResponse } from "next/og";

import {
  DailyMatchCard,
  type DailyMatchEntry,
  type DailySummaryData,
} from "@/components/daily-match-card";

export type { DailyMatchEntry, DailySummaryData };

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return Uint8Array.from(buffer).buffer;
}

const loadFonts = cache(async () => {
  const [regular, bold] = await Promise.all([
    fs.readFile(path.join(process.cwd(), "public/fonts/NotoSansKR-Regular.woff2")),
    fs.readFile(path.join(process.cwd(), "public/fonts/NotoSansKR-Bold.woff2")),
  ]);
  return [
    {
      name: "Noto Sans KR",
      data: toArrayBuffer(regular),
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Noto Sans KR",
      data: toArrayBuffer(bold),
      style: "normal" as const,
      weight: 700 as const,
    },
  ];
});

function calcHeight(displayCount: number, hasHidden: boolean, isSingleDeck: boolean): number {
  // base: header + divider + footer-divider + footer + padding + border
  const base = isSingleDeck ? 290 : 250;
  const perMatch = 62;
  const deckLabelRow = 28; // only in multi-deck mode, per deck group change
  const hiddenRow = hasHidden ? 44 : 0;
  return Math.min(1200, base + displayCount * perMatch + deckLabelRow + hiddenRow);
}

export async function renderDailySummary(data: DailySummaryData): Promise<Buffer> {
  const fonts = await loadFonts();
  const displayCount = Math.min(data.matches.length, 10);
  const hasHidden = data.matches.length > 10;
  const uniqueDecks = new Set(data.matches.slice(0, 10).map((m) => m.myDeckName));
  const isSingleDeck = uniqueDecks.size <= 1;
  const height = calcHeight(displayCount, hasHidden, isSingleDeck);

  const response = new ImageResponse(createElement(DailyMatchCard, { data }), {
    width: 500,
    height,
    fonts,
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

import fs from "fs/promises";
import path from "path";

import { cache, createElement } from "react";

import { ImageResponse } from "next/og";

import {
  TournamentScorecardCard,
  type ScorecardSession,
} from "@/components/tournament-scorecard-card";

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return Uint8Array.from(buffer).buffer;
}

const loadScorecardFonts = cache(async () => {
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

export async function renderTournamentScorecard(session: ScorecardSession): Promise<Buffer> {
  const fonts = await loadScorecardFonts();
  const response = new ImageResponse(createElement(TournamentScorecardCard, { session }), {
    width: 500,
    height: 700,
    fonts,
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

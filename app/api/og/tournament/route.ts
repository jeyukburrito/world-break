import { createElement } from "react";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { TournamentShareOgCard } from "@/components/tournament-share-og-card";
import { loadMatchOgFonts } from "@/lib/share/og-font";
import { parseTournamentShareParams } from "@/lib/share/match-share";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const parsed = parseTournamentShareParams(request.nextUrl.searchParams);
  const share = parsed.success ? parsed.data : null;

  const origin = new URL(request.url).origin;

  let fonts: Awaited<ReturnType<typeof loadMatchOgFonts>> | undefined;
  try {
    fonts = await loadMatchOgFonts(origin);
  } catch {
    // font loading failed — render without custom fonts
  }

  return new ImageResponse(createElement(TournamentShareOgCard, { share }), {
    width: 1200,
    height: 630,
    ...(fonts ? { fonts } : {}),
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

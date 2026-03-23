import { createElement } from "react";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { TournamentShareOgCard } from "@/components/tournament-share-og-card";
import { loadMatchOgFonts } from "@/lib/share/og-font";
import { buildTournamentOgFontText, parseTournamentShareParams } from "@/lib/share/match-share";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const parsed = parseTournamentShareParams(request.nextUrl.searchParams);
  const share = parsed.success ? parsed.data : null;

  try {
    const fonts = await loadMatchOgFonts(buildTournamentOgFontText(share));

    return new ImageResponse(createElement(TournamentShareOgCard, { share }), {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new ImageResponse(createElement(TournamentShareOgCard, { share: null }), {
      width: 1200,
      height: 630,
    });
  }
}

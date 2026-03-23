import { createElement } from "react";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { MatchShareOgCard } from "@/components/match-share-og-card";
import { loadMatchOgFonts } from "@/lib/share/og-font";
import { buildMatchOgFontText, parseMatchShareParams } from "@/lib/share/match-share";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const parsed = parseMatchShareParams(request.nextUrl.searchParams);
  const share = parsed.success ? parsed.data : null;

  try {
    const fonts = await loadMatchOgFonts(buildMatchOgFontText(share));

    return new ImageResponse(createElement(MatchShareOgCard, { share }), {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new ImageResponse(createElement(MatchShareOgCard, { share: null }), {
      width: 1200,
      height: 630,
    });
  }
}

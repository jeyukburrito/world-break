import { createElement } from "react";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { MatchShareOgCard } from "@/components/match-share-og-card";
import { loadMatchOgFonts } from "@/lib/share/og-font";
import { parseMatchShareParams } from "@/lib/share/match-share";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const parsed = parseMatchShareParams(request.nextUrl.searchParams);
  const share = parsed.success ? parsed.data : null;

  const origin = new URL(request.url).origin;

  let fonts: Awaited<ReturnType<typeof loadMatchOgFonts>> | undefined;
  try {
    fonts = await loadMatchOgFonts(origin);
  } catch {
    // font loading failed — render without custom fonts
  }

  const response = new ImageResponse(createElement(MatchShareOgCard, { share }), {
    width: 1200,
    height: 630,
    ...(fonts ? { fonts } : {}),
  });

  return new Response(response.body, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

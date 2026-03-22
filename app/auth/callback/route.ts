import { type NextRequest, NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth";
import { getSafeRedirectPath, isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Inline to avoid bundling @/lib/guest (Prisma-heavy) into this route handler
const GUEST_COOKIE = "wb_guest_token";

function encodeParams(obj: Record<string, string>): string {
  return btoa(JSON.stringify(obj));
}

function bucketMatchCount(count: number): string {
  if (count === 0) return "0";
  if (count <= 10) return "1-10";
  if (count <= 50) return "11-50";
  return "50+";
}

async function buildUserProperties(userId: string): Promise<Record<string, string>> {
  try {
    const [matchCount, deckCount, topGame] = await Promise.all([
      prisma.matchResult.count({ where: { userId } }),
      prisma.deck.count({ where: { userId, isActive: true } }),
      prisma.matchResult.groupBy({
        by: ["myDeckId"],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }).then(async (results) => {
        if (results.length === 0) return "none";
        const deck = await prisma.deck.findUnique({
          where: { id: results[0].myDeckId },
          select: { game: { select: { name: true } } },
        });
        return deck?.game.name ?? "unknown";
      }),
    ]);

    return {
      total_matches: bucketMatchCount(matchCount),
      total_decks: String(deckCount),
      primary_game: topGame,
    };
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL("/login?error=config_missing", request.url));
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Detect new vs returning user before upsert
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true },
          });
          const isNewUser = !existingUser;

          await ensureUserProfile(user);

          // Build redirect with GA4 event params
          const redirectUrl = new URL(next, request.url);
          redirectUrl.searchParams.set("message", isNewUser ? "signup_success" : "login_success");

          const userProps = await buildUserProperties(user.id);
          if (Object.keys(userProps).length > 0) {
            redirectUrl.searchParams.set("up", encodeParams(userProps));
          }

          const response = NextResponse.redirect(redirectUrl);
          response.cookies.delete(GUEST_COOKIE);
          return response;
        }

        // Clear guest session only after successful Google login
        const response = NextResponse.redirect(new URL(next, request.url));
        response.cookies.delete(GUEST_COOKIE);
        return response;
      }
    } catch {
      return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
}

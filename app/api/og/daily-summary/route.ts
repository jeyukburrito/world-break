import { prisma } from "@/lib/prisma";
import { renderDailySummary } from "@/lib/og/render-daily-summary";
import type { DailyMatchEntry } from "@/lib/og/render-daily-summary";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam =
    searchParams.get("date") ??
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return new Response("Invalid date", { status: 400 });
  }

  const dayStart = new Date(dateParam + "T00:00:00+09:00");
  const dayEnd = new Date(dateParam + "T23:59:59.999+09:00");

  const rows = await prisma.matchResult.findMany({
    where: {
      userId: user.id,
      playedAt: { gte: dayStart, lte: dayEnd },
    },
    include: { myDeck: true },
    orderBy: { playedAt: "asc" },
  });

  const matches: DailyMatchEntry[] = rows.map((row) => ({
    id: row.id,
    myDeckName: row.myDeck.name,
    opponentDeckName: row.opponentDeckName,
    matchFormat: row.matchFormat,
    wins: row.wins,
    losses: row.losses,
    isMatchWin: row.isMatchWin,
  }));

  const buffer = await renderDailySummary({ date: dateParam, matches });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="worldbreak-${dateParam}.png"`,
      "Cache-Control": "no-store",
    },
  });
}

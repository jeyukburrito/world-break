import { z } from "zod";

const matchShareParamsSchema = z.object({
  game: z.string().trim().min(1).max(80),
  myDeck: z.string().trim().min(1).max(120),
  opponentDeck: z.string().trim().min(1).max(120),
  result: z.enum(["win", "lose"]),
  format: z.enum(["bo1", "bo3"]),
  score: z
    .string()
    .trim()
    .regex(/^(2-0|2-1|0-2|1-2)$/)
    .optional(),
  order: z.enum(["first", "second"]),
  phase: z.enum(["swiss", "elimination"]).optional(),
  round: z.coerce.number().int().min(1).max(99).optional(),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type MatchSharePayload = z.infer<typeof matchShareParamsSchema>;
const tournamentShareParamsSchema = z.object({
  game: z.string().trim().min(1).max(80),
  myDeck: z.string().trim().min(1).max(120),
  result: z.enum(["win", "lose"]),
  format: z.enum(["bo1", "bo3"]),
  wins: z.coerce.number().int().min(0),
  losses: z.coerce.number().int().min(0),
  rounds: z.coerce.number().int().min(1),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type TournamentSharePayload = z.infer<typeof tournamentShareParamsSchema>;

type ShareSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | undefined;

function readSearchParam(searchParams: ShareSearchParams, key: string) {
  if (!searchParams) {
    return undefined;
  }

  if (searchParams instanceof URLSearchParams) {
    const value = searchParams.get(key);
    return value?.trim() || undefined;
  }

  const value = searchParams[key];
  const singleValue = typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
  return singleValue?.trim() || undefined;
}

export function parseMatchShareParams(searchParams: ShareSearchParams) {
  return matchShareParamsSchema.safeParse({
    game: readSearchParam(searchParams, "game"),
    myDeck: readSearchParam(searchParams, "myDeck"),
    opponentDeck: readSearchParam(searchParams, "opponentDeck"),
    result: readSearchParam(searchParams, "result"),
    format: readSearchParam(searchParams, "format"),
    score: readSearchParam(searchParams, "score"),
    order: readSearchParam(searchParams, "order"),
    phase: readSearchParam(searchParams, "phase"),
    round: readSearchParam(searchParams, "round"),
    date: readSearchParam(searchParams, "date"),
  });
}

export function buildMatchShareSearchParams(payload: MatchSharePayload) {
  const params = new URLSearchParams({
    game: payload.game,
    myDeck: payload.myDeck,
    opponentDeck: payload.opponentDeck,
    result: payload.result,
    format: payload.format,
    order: payload.order,
  });

  if (payload.score) {
    params.set("score", payload.score);
  }

  if (payload.phase) {
    params.set("phase", payload.phase);
  }

  if (payload.round) {
    params.set("round", String(payload.round));
  }

  if (payload.date) {
    params.set("date", payload.date);
  }

  return params;
}

export function parseTournamentShareParams(searchParams: ShareSearchParams) {
  return tournamentShareParamsSchema.safeParse({
    game: readSearchParam(searchParams, "game"),
    myDeck: readSearchParam(searchParams, "myDeck"),
    result: readSearchParam(searchParams, "result"),
    format: readSearchParam(searchParams, "format"),
    wins: readSearchParam(searchParams, "wins"),
    losses: readSearchParam(searchParams, "losses"),
    rounds: readSearchParam(searchParams, "rounds"),
    date: readSearchParam(searchParams, "date"),
  });
}

export function buildTournamentShareSearchParams(payload: TournamentSharePayload) {
  return new URLSearchParams({
    game: payload.game,
    myDeck: payload.myDeck,
    result: payload.result,
    format: payload.format,
    wins: String(payload.wins),
    losses: String(payload.losses),
    rounds: String(payload.rounds),
    date: payload.date,
  });
}

export function buildMatchSharePath(payload: MatchSharePayload) {
  return `/share/match?${buildMatchShareSearchParams(payload).toString()}`;
}

export function buildMatchOgPath(payload: MatchSharePayload) {
  return `/api/og/match?${buildMatchShareSearchParams(payload).toString()}`;
}

export function buildTournamentSharePath(payload: TournamentSharePayload) {
  return `/share/tournament?${buildTournamentShareSearchParams(payload).toString()}`;
}

export function buildTournamentOgPath(payload: TournamentSharePayload) {
  return `/api/og/tournament?${buildTournamentShareSearchParams(payload).toString()}`;
}

export function getMatchResultLabel(result: MatchSharePayload["result"]) {
  return result === "win" ? "승리" : "패배";
}

export function getMatchResultBadge(result: MatchSharePayload["result"]) {
  return result === "win" ? "WIN" : "LOSE";
}

export function getMatchOrderLabel(order: MatchSharePayload["order"]) {
  return order === "first" ? "선공" : "후공";
}

export function getMatchPhaseLabel(phase: MatchSharePayload["phase"]) {
  if (phase === "elimination") {
    return "본선";
  }

  if (phase === "swiss") {
    return "예선";
  }

  return "친선전";
}

export function buildMatchShareTitle(payload: MatchSharePayload) {
  const verb = payload.result === "win" ? "beat" : "lost to";
  return `${payload.myDeck} ${verb} ${payload.opponentDeck} (${payload.format.toUpperCase()} · ${getMatchOrderLabel(payload.order)})`;
}

export function buildMatchShareDescription(payload: MatchSharePayload) {
  const detailParts = [];

  if (payload.phase) {
    detailParts.push(
      payload.round ? `${getMatchPhaseLabel(payload.phase)} Round ${payload.round}` : getMatchPhaseLabel(payload.phase),
    );
  } else {
    detailParts.push("친선전");
  }

  if (payload.date) {
    detailParts.push(payload.date);
  }

  return ["World Break", ...detailParts].join(" · ");
}

export function buildMatchShareAlt(payload: MatchSharePayload) {
  return `${payload.myDeck} vs ${payload.opponentDeck} · ${getMatchResultLabel(payload.result)}`;
}

export function buildMatchShareFooterItems(payload: MatchSharePayload) {
  const items = [payload.game, payload.format.toUpperCase(), getMatchOrderLabel(payload.order)];

  if (payload.round) {
    items.push(`Round ${payload.round}`);
  } else if (payload.phase) {
    items.push(getMatchPhaseLabel(payload.phase));
  } else {
    items.push("친선전");
  }

  if (payload.date) {
    items.push(payload.date);
  }

  return items;
}

export function buildTournamentShareTitle(payload: TournamentSharePayload) {
  return `${payload.myDeck} — ${payload.wins}승 ${payload.losses}패 (${payload.rounds} Rounds)`;
}

export function buildTournamentShareDescription(payload: TournamentSharePayload) {
  return ["World Break", payload.game, payload.date].join(" · ");
}

export function buildTournamentShareAlt(payload: TournamentSharePayload) {
  return `${payload.myDeck} · ${payload.wins}승 ${payload.losses}패`;
}

export function buildTournamentShareFooterItems(payload: TournamentSharePayload) {
  return [payload.game, payload.format.toUpperCase(), `${payload.rounds} Rounds`, payload.date];
}

export function buildMatchOgFontText(payload: MatchSharePayload | null) {
  const baseText = [
    "World Break",
    "MY DECK",
    "OPPONENT",
    "WIN",
    "LOSE",
    "친선전",
    "예선",
    "본선",
    "선공",
    "후공",
    "Round",
    "Date",
    "Format",
  ];

  if (payload) {
    baseText.push(
      payload.game,
      payload.myDeck,
      payload.opponentDeck,
      payload.date ?? "",
      payload.score ?? "",
      getMatchOrderLabel(payload.order),
      getMatchPhaseLabel(payload.phase),
    );
  }

  return Array.from(new Set(baseText.join("").replace(/\s+/g, ""))).join("");
}

export function buildTournamentOgFontText(payload: TournamentSharePayload | null) {
  const baseText = [
    "World Break",
    "TOURNAMENT",
    "ROUNDS",
    "WIN",
    "LOSE",
    "승",
    "패",
    "Rounds",
    "Date",
    "Format",
  ];

  if (payload) {
    baseText.push(
      payload.game,
      payload.myDeck,
      payload.date,
      String(payload.wins),
      String(payload.losses),
      String(payload.rounds),
    );
  }

  return Array.from(new Set(baseText.join("").replace(/\s+/g, ""))).join("");
}

export function getRequestOrigin(headers: Pick<Headers, "get">) {
  const origin = headers.get("origin");

  if (origin) {
    return origin;
  }

  const host = headers.get("x-forwarded-host") ?? headers.get("host");

  if (!host) {
    return null;
  }

  const proto = headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function buildAbsoluteUrl(origin: string | null, path: string) {
  return origin ? new URL(path, origin).toString() : path;
}

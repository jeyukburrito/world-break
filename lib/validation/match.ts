import { z } from "zod";

export const matchResultSchema = z
  .object({
    playedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    gameName: z.string().trim().min(1).max(60),
    myDeckName: z.string().trim().min(1).max(60),
    tournamentSessionId: z.string().uuid().optional(),
    opponentDeckName: z.string().trim().min(1).max(120),
    eventCategory: z.enum(["friendly", "shop"]),
    tournamentPhase: z.enum(["swiss", "elimination"]).optional(),
    playOrder: z.enum(["first", "second"]),
    didChoosePlayOrder: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),
    matchFormat: z.enum(["bo1", "bo3"]),
    result: z.enum(["win", "lose"]),
    tournamentDetail: z.string().max(200).optional().or(z.literal("")),
    memo: z.string().max(1000).optional().or(z.literal("")),
    tagIds: z.array(z.string().uuid()).max(10).default([]),
  });

export type MatchResultInput = z.infer<typeof matchResultSchema>;

export const matchIdSchema = z.string().uuid("올바른 경기 ID 형식이 아닙니다.");
export const tournamentSessionIdSchema = z.string().uuid("올바른 대회 세션 ID 형식이 아닙니다.");

import { z } from "zod";

const bo3PlaySequenceSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return normalized === "" ? undefined : normalized;
}, z.string().regex(/^[FS]{2,3}$/, "Invalid BO3 play sequence").optional());

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
    bo3Score: z.enum(["2-0", "2-1", "0-2", "1-2"]).optional(),
    bo3PlaySequence: bo3PlaySequenceSchema,
    tournamentDetail: z.string().max(200).optional().or(z.literal("")),
    memo: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.matchFormat !== "bo3" || !data.bo3Score) return true;
      const isWinScore = data.bo3Score === "2-0" || data.bo3Score === "2-1";
      return data.result === "win" ? isWinScore : !isWinScore;
    },
    { message: "BO3 세부 점수가 매치 결과와 일치하지 않습니다", path: ["bo3Score"] },
  );

export type MatchResultInput = z.infer<typeof matchResultSchema>;

export const matchIdSchema = z.string().uuid("올바른 경기 ID 형식이 아닙니다.");
export const tournamentSessionIdSchema = z.string().uuid("올바른 대회 세션 ID 형식이 아닙니다.");

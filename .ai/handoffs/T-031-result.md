Author: Codex (Implementer)

# T-031 Result

## Summary
Implemented the tournament scorecard persistence flow so ending a tournament now lands on a dedicated result page, authenticated users can render and store a PNG scorecard, and the public scorecard URL is persisted on the tournament session.

## Files Changed
- `.ai/handoffs/T-031-result.md`
- `.ai/daily/2026-03-31-codex.md`
- `.ai/TASKS.md`
- `prisma/schema.prisma`
- `prisma/migrations/20260331230000_add_scorecard_url/migration.sql`
- `components/tournament-scorecard-card.tsx`
- `lib/og/render-scorecard.ts`
- `app/api/og/tournament-scorecard/route.ts`
- `app/matches/tournaments/end/route.ts`
- `app/matches/tournaments/[id]/result/page.tsx`
- `app/matches/tournaments/[id]/result/actions.ts`
- `app/matches/tournaments/[id]/result/save-scorecard-button.tsx`

## Implemented
- `prisma/schema.prisma`
  - added nullable `scorecardUrl` to `TournamentSession`
- `prisma/migrations/20260331230000_add_scorecard_url/migration.sql`
  - added the `scorecard_url` column to `tournament_sessions`
- `components/tournament-scorecard-card.tsx`
  - added a 500x700 inline-style Satori scorecard card
  - renders up to 8 rounds and collapses overflow into an `외 N라운드` summary row
- `lib/og/render-scorecard.ts`
  - added filesystem font loading from `public/fonts`
  - renders the scorecard component to a PNG `Buffer`
- `app/matches/tournaments/[id]/result/page.tsx`
  - added a tournament result summary page inside the existing app shell
  - keeps guest viewing support through `requireUser()`
  - only shows the save CTA for authenticated users
- `app/matches/tournaments/[id]/result/actions.ts`
  - added auth-only `saveTournamentScorecard`
  - renders the PNG, uploads it to `tournament-scorecards`, saves the public URL, and revalidates result/list pages
- `app/matches/tournaments/[id]/result/save-scorecard-button.tsx`
  - added the client-side save / re-save UI
- `app/matches/tournaments/end/route.ts`
  - changed tournament end redirect from `/matches` to `/matches/tournaments/{id}/result`
- `app/api/og/tournament-scorecard/route.ts`
  - added the placeholder OG route required by the spec

## Validation
- `npm.cmd run prisma:migrate`: FAIL due pre-existing shadow DB migration issue in `20260322180000_migrate_cs_to_shop` (`operator does not exist: "EventCategory" = "EventCategory_old"`)
- `npm.cmd run prisma:generate` with `.env.local` loaded into the shell: PASS
- `npm.cmd run lint`: PASS
- `npm.cmd run build` with `.env.local` loaded into the shell: PASS
  - `prisma migrate deploy` applied `20260331230000_add_scorecard_url` successfully before the Next build

## Risks
- Supabase dashboard setup is still required before end-to-end storage verification: bucket `tournament-scorecards` must exist, be public, and have the folder policy from the spec.
- The runtime save flow depends on a valid `SUPABASE_SERVICE_ROLE_KEY`; the code path built successfully but was not exercised against real Storage in this session.
- `prisma migrate dev` remains broken by a legacy migration chain issue unrelated to the new `scorecard_url` addition. If local dev migrations must stay clean, that older migration needs a separate fix.

## Next Agent Context
- `T-031` implementation is ready for Gemini review.
- Review should focus on access control boundaries (`guest view` vs `auth-only save`), Satori rendering logic, Storage upload/persist flow, and the tournament end redirect.
- External QA prerequisite: create the Supabase Storage bucket/policy from the spec, then smoke-test the save button with an authenticated user.

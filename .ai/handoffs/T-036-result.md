Author: Codex (Implementer)

# T-036 Result

## Summary
Fixed guest access for the daily summary OG download route and tightened the tournament scorecard save flow so missing Supabase admin setup fails with explicit messages.

## Files Changed
- `middleware.ts`
- `app/matches/tournaments/[id]/result/actions.ts`

## Implemented
- Added `/api/og/daily-summary` to `SUPABASE_ONLY_PATHS` so guest sessions are redirected to `/login` instead of receiving a raw 401 download response.
- Rewrote `saveTournamentScorecard` error handling to surface:
  - missing auth as `로그인이 필요합니다.`
  - missing `SUPABASE_SERVICE_ROLE_KEY` as an explicit admin-setup error
  - missing `tournament-scorecards` bucket as an explicit Storage setup error
  - generic upload failures as `성적표 저장에 실패했습니다.`

## Diagnosis
- The code path depends on two external prerequisites that cannot be fixed in code:
  - `SUPABASE_SERVICE_ROLE_KEY` must be set in the deployment environment.
  - the Supabase Storage bucket `tournament-scorecards` must exist.
- The repository already documents both prerequisites in `docs/SUPABASE_SETUP.md`.
- This CLI session could not directly verify the Supabase Dashboard or Vercel environment settings, so those two items still need manual confirmation.

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build` with `.env.local` loaded into the process: PASS

## Notes
- No workaround was added for missing Supabase setup. The code now fails with clearer messages instead.

Author: Codex (Implementer)

# T-032 Result

## Summary
Removed the deprecated URL-based share feature. The match/tournament share pages, OG routes, share components, and share helper library were deleted; the tournament share CTA was removed from the matches page; and `/share` is no longer treated as a public path. The PNG download routes kept by the spec remain intact.

## Files Changed
- `.ai/handoffs/T-032-result.md`
- `.ai/daily/2026-04-05-codex.md`
- `.ai/TASKS.md`
- `app/matches/page.tsx`
- `middleware.ts`
- `lib/supabase/middleware.ts`
- `app/api/og/match/route.ts` (deleted)
- `app/api/og/tournament/route.ts` (deleted)
- `app/share/match/page.tsx` (deleted)
- `app/share/tournament/page.tsx` (deleted)
- `components/share-button.tsx` (deleted)
- `components/match-share-og-card.tsx` (deleted)
- `components/tournament-share-og-card.tsx` (deleted)
- `lib/share/match-share.ts` (deleted)
- `lib/share/og-font.ts` (deleted)

## Implemented
- `app/matches/page.tsx`
  - removed the tournament share button, share payload builder, and related imports
- `middleware.ts`
  - removed `/share` from the edge middleware public path list
- `lib/supabase/middleware.ts`
  - removed `/share` from the Supabase session middleware public path list
- Deleted the obsolete URL-share routes and helpers:
  - `app/share/match/page.tsx`
  - `app/share/tournament/page.tsx`
  - `app/api/og/match/route.ts`
  - `app/api/og/tournament/route.ts`
  - `components/share-button.tsx`
  - `components/match-share-og-card.tsx`
  - `components/tournament-share-og-card.tsx`
  - `lib/share/match-share.ts`
  - `lib/share/og-font.ts`
- Kept the required PNG routes/components intact:
  - `app/api/og/daily-summary/route.ts`
  - `app/api/og/tournament-scorecard/route.ts`
  - `lib/og/*`
  - `components/daily-match-card.tsx`
  - `components/tournament-scorecard-card.tsx`

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL because `DIRECT_URL` was not loaded into the shell environment
- `Get-Content .env.local | ForEach-Object { if ($_ -match '^(?!\\s*#)([^=]+)=(.*)$') { $name = $matches[1].Trim(); $value = $matches[2].Trim(); if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) { $value = $value.Substring(1, $value.Length - 2) }; [System.Environment]::SetEnvironmentVariable($name, $value, 'Process') } }; npm.cmd run build` inside sandbox: FAIL because Prisma engine download was blocked by sandbox network restrictions
- `Get-Content .env.local | ForEach-Object { if ($_ -match '^(?!\\s*#)([^=]+)=(.*)$') { $name = $matches[1].Trim(); $value = $matches[2].Trim(); if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) { $value = $value.Substring(1, $value.Length - 2) }; [System.Environment]::SetEnvironmentVariable($name, $value, 'Process') } }; npm.cmd run build` outside sandbox: PASS

## Risks
- Existing `/share/*` URLs and removed OG URLs will stop resolving after deploy. This is expected by the spec, but any previously posted share links will effectively 404.

## Next Agent Context
- `T-032` is ready for Gemini review.
- Review should confirm there are no leftover imports/routes tied to the removed share flow and that the retained PNG routes (`daily-summary`, `tournament-scorecard`) still build correctly.
- `T-033` should start from this post-removal state, as intended by the spec dependency.

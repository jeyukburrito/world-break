Author: Codex (Implementer)

# T-019 Result

## Summary
Applied the `T-019` spec by moving sharing from single matches to tournament-level results, fixing BO3 detail-score input UX for mobile, and correcting next-round continuation parameters so game/deck/format/play-order defaults persist.

## Files Changed
- `app/api/og/tournament/route.ts`
- `app/share/tournament/page.tsx`
- `app/matches/page.tsx`
- `components/tournament-share-og-card.tsx`
- `components/match-result-input.tsx`
- `lib/share/match-share.ts`

## Implemented
- `app/matches/page.tsx`
  - removed the share button from `SingleMatchCard`
  - removed per-round share buttons inside `TournamentMatchCard`
  - added `createTournamentSharePayload(group)` for whole-tournament shares
  - added one tournament-level share button in the card header area
  - corrected `nextHref` continuation params to use `deckName`, `gameName`, `matchFormat`, and `playOrder`
- `lib/share/match-share.ts`
  - kept the existing single-match share schema/path helpers intact
  - added tournament share schema/path/title/description/alt/footer/font-text helpers
  - used separate `/share/tournament` and `/api/og/tournament` paths to avoid regressing T-017 single-match links
- `components/tournament-share-og-card.tsx`
  - added a tournament-only OG layout centered on deck name + total record
  - added a fallback card for invalid or missing params
- `app/api/og/tournament/route.ts`
  - added a dedicated Edge OG route for tournament shares
- `app/share/tournament/page.tsx`
  - added a dedicated public tournament share page with OG/Twitter metadata
- `components/match-result-input.tsx`
  - changed BO3 score state from numeric defaults to empty strings
  - switched the inputs from `type="number"` to `type="text"` with `inputMode="numeric"` and `pattern="[0-2]"`
  - added placeholder `0`
  - reset BO3 inputs to blank when format/result changes
  - kept the hidden `bo3Score` field valid by defaulting blank win/lose states to `2-0` or `0-2`

## Validation
- `npm.cmd run lint`: PASS
- `Get-Content .env.local | ForEach-Object { ... }; npm.cmd run build`: FAIL due unrelated pre-existing type error in `./~/gstack/browse/src/browser-manager.ts` (`Cannot find module 'playwright'`)

## Notes
- `app/matches/actions.ts` core logic was left untouched per spec.
- `components/share-button.tsx`, `components/toast.tsx`, and `lib/toast.ts` were not modified.
- The existing T-017 single-match share page/OG route remain in place for backwards compatibility, but no longer have callers from the match list UI.

## Risks
- Full production build verification remains blocked by the unrelated `~/gstack/**` Playwright type dependency issue outside the T-019 change set.
- The BO3 input now starts blank as requested, but server validation for impossible scores still lives in `lib/validation/match.ts`; invalid manual combinations remain server-rejected by design.

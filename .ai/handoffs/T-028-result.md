Author: Codex (Implementer)

# T-028 Result

## Summary
Implemented BO3 game-by-game play-order sequence tracking end-to-end. BO3 matches can now store sequences such as `FF`, `FS`, or `FSF`, derive the top-level `playOrder` from the first game, preserve the sequence on edits, and display the sequence on the matches page.

## Files Changed
- `prisma/schema.prisma`
- `prisma/migrations/20260328193000_add_bo3_play_sequence/migration.sql`
- `lib/validation/match.ts`
- `app/matches/actions.ts`
- `lib/matches.ts`
- `lib/group-matches.ts`
- `components/match-detail-controls.tsx`
- `components/match-result-input.tsx`
- `app/matches/new/page.tsx`
- `app/matches/[id]/edit/page.tsx`
- `app/matches/page.tsx`
- `.ai/handoffs/T-028-result.md`
- `.ai/daily/2026-03-28-codex.md`

## Implemented
- `prisma/schema.prisma`
  - added nullable `bo3PlaySequence` to `MatchResult`
- `prisma/migrations/20260328193000_add_bo3_play_sequence/migration.sql`
  - added the migration that creates the new nullable column
- `lib/validation/match.ts`
  - added BO3 play-sequence validation and normalization
- `app/matches/actions.ts`
  - parses `bo3PlaySequence` from form submissions
  - stores the sequence on create when `matchFormat === "bo3"`
  - preserves the existing sequence on update when the form does not submit a new one
- `lib/matches.ts`
  - added `bo3PlaySequence` to the matches list query
- `lib/group-matches.ts`
  - extended grouped match rows to carry `bo3PlaySequence`
- `components/match-result-input.tsx`
  - added per-game BO3 play-order controls that appear only for valid BO3 score combinations
  - emits hidden `bo3PlaySequence` and derived `playOrder` values for BO3 submissions
- `components/match-detail-controls.tsx`
  - listens for BO3 format changes and hides the separate play-order segmented control when BO3 is active
- `app/matches/new/page.tsx`
  - passes the current format into `MatchDetailControls` for correct initial BO3 behavior
- `app/matches/[id]/edit/page.tsx`
  - loads the saved sequence and passes it to the edit form defaults
- `app/matches/page.tsx`
  - displays BO3 sequences such as `선후선` alongside the BO3 score label

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL due missing environment variable `DIRECT_URL` during Prisma config validation before Next build starts

## Notes
- BO3 play-order sequence input resets when the BO3 score shape changes between 2-game and 3-game outcomes.
- The first character of the BO3 sequence remains the canonical source for the top-level `playOrder` field.

## Risks
- Full build verification remains blocked by the pre-existing local Prisma environment issue.

Author: Codex (Implementer)

# T-026 Result

## Summary
Added server-driven new-match prefill so `/matches/new` now defaults to the user's latest game, latest deck for that game, and latest match format. When the selected game changes inside the form, the deck and format update to that game's latest known preference.

## Files Changed
- `.ai/handoffs/T-026-spec.md`
- `.ai/handoffs/T-026-result.md`
- `.ai/daily/2026-03-28-codex.md`
- `.ai/TASKS.md`
- `lib/matches.ts`
- `app/matches/new/page.tsx`
- `components/game-name-field.tsx`
- `components/game-deck-fields.tsx`
- `components/match-result-input.tsx`
- `components/match-prefill-fields.tsx`

## Implemented
- `lib/matches.ts`
  - added `getNewMatchPrefill()` to derive:
    - the latest overall match preference
    - the latest deck/format preference per game
- `app/matches/new/page.tsx`
  - loads recent-match preferences on the server
  - applies them as defaults when continuation params do not already provide values
- `components/game-name-field.tsx`
  - added `onValueChange` so parent fields can react to game changes
- `components/game-deck-fields.tsx`
  - made deck input controlled
  - updates the deck value when the selected game changes
- `components/match-result-input.tsx`
  - accepts per-game format defaults
  - updates the match format when the selected game changes
- `components/match-prefill-fields.tsx`
  - added a small client-side glue component to coordinate selected game state between the deck field and format input

## Validation
- `npm.cmd run lint`: PASS
- `npx.cmd tsc --noEmit`: PASS
- `npm.cmd run build`: FAIL due missing environment variable `DIRECT_URL` during Prisma config validation before Next build starts

## Risks
- Per-game prefill is intentionally limited to `game -> last deck + last format`; event category and play-order auto-prefill remain out of scope.
- Custom game names update the derived deck/format suggestions immediately as the user edits the game name, which is acceptable for this ticket's minimal scope but could be refined later if needed.

## Next Agent Context
- `T-026` implementation is ready for review.
- Review focus should be limited to the new-match prefill path: server preference lookup, initial defaults, and game-change synchronization.
- Full build verification is still blocked by the existing local Prisma `DIRECT_URL` environment gap.

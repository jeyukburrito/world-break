Author: Codex (Implementer)

# T-029 Result

## Summary
Clarified the play-order chooser wording in the form and made match cards explicitly show whether the play order was chosen by the user or the opponent.

## Files Changed
- `components/match-detail-controls.tsx`
- `app/matches/page.tsx`
- `.ai/handoffs/T-029-result.md`
- `.ai/daily/2026-03-28-codex.md`

## Implemented
- `components/match-detail-controls.tsx`
  - renamed the label from `결정 방식` to `선택 주체`
  - changed the options to `내가 선택` / `상대가 선택`
- `app/matches/page.tsx`
  - added a shared formatter so both single-match cards and tournament rounds display `선공 · 내가 선택` or `후공 · 상대가 선택`
  - removed the old ambiguous `(선택)` suffix behavior

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL due missing environment variable `DIRECT_URL` during Prisma config validation before Next build starts

## Risks
- Full build verification remains blocked by the pre-existing local Prisma environment issue.

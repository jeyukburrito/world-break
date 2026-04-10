Author: Codex (Implementer)

# T-035 Result

## Summary
Repaired the corrupted Korean error strings in `app/matches/actions.ts` and restored the `deriveScore` comment to readable Korean.

## Files Changed
- `app/matches/actions.ts`

## Implemented
- Replaced all corrupted user-facing Korean error strings in the match actions flow with readable Korean.
- Restored the `deriveScore` comment so the BO3 fallback behavior is understandable again.

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build` with `.env.local` loaded into the process: PASS

## Notes
- The change was intentionally limited to text recovery. No match-scoring logic was changed.

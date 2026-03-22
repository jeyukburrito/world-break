Author: Codex (Implementer)

# T-014 Result

## Summary
Applied the `T-014-spec.md` changes by merging the profile view into `/settings`, moving account deletion to the settings route, and removing the standalone `/settings/profile` page.

## Files Changed
- `components/profile-avatar.tsx`
- `app/settings/page.tsx`
- `app/settings/actions.ts`
- `app/settings/profile/page.tsx` (deleted)
- `app/settings/profile/actions.ts` (deleted)

## Implemented
- Changed the header avatar link from `/settings/profile` to `/settings`.
- Moved the profile card, match stats, account section, and danger-zone delete flow into `app/settings/page.tsx`.
- Reduced settings-page stats to the two required cards: total matches and win rate.
- Removed the profile-page-only game management link and the last-played stat from the settings/profile experience.
- Moved `deleteAccount` into `app/settings/actions.ts` and updated its failure redirect to `/settings?error=delete_failed`.
- Deleted the dedicated `/settings/profile` route files.

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL initially because `DIRECT_URL` was not exported into the shell for Prisma CLI.
- `npm.cmd run build` with `.env.local` loaded into the process environment: FAIL due an unrelated pre-existing type error in `./~/gstack/browse/src/browser-manager.ts` (`Cannot find module 'playwright'`).

## Notes
- The settings page still keeps `/settings/export` and the direct `/settings/games` route intact, as required by spec.
- Guest mode continues to show mode information and uses the same delete-account flow from the consolidated settings page.

## Risks
- Full `npm run build` verification remains blocked by the unrelated `~/gstack/**` Playwright dependency issue outside the T-014 file scope.

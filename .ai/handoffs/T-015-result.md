Author: Codex (Implementer)

# T-015 Result

## Summary
Applied the `T-015-spec.md` microcopy and information-architecture cleanup in the four scoped code files.

## Files Changed
- `lib/format-date.ts`
- `app/matches/page.tsx`
- `app/matches/new/page.tsx`
- `components/dashboard-charts.tsx`

## Implemented
- Replaced the relative-date formatter with an absolute-date formatter:
  - same year: `M월 D일`
  - previous years: `YYYY.M.D`
- Updated the matches page to use `formatDate()` for match and tournament dates.
- Removed the redundant top-right `[N 경기] [새 기록]` header strip from the matches list page.
- Removed the redundant `New Record` / `결과 입력` intro section from the new-match page because `AppShell` already provides the page title.
- Changed the dashboard stat cards so:
  - `승률` shows only the percentage
  - `전적` shows `N승 M패` with `총 N경기` as subtext
- Kept a compatibility alias export `formatRelativeDate = formatDate` inside `lib/format-date.ts` so the wider tree still compiles without expanding the scoped file count beyond the requested four files.

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL (`DIRECT_URL` not exported into the shell for Prisma CLI)
- `npm.cmd run build` with `.env.local` loaded into the process environment: FAIL due an unrelated pre-existing type error in `./~/gstack/browse/src/browser-manager.ts` (`Cannot find module 'playwright'`)

## Notes
- The requested four-file implementation scope was preserved.
- The absolute-date formatting behavior now applies to both the updated matches page and any remaining callers that still import the legacy formatter alias.

## Risks
- Full production build verification remains blocked by the unrelated `~/gstack/**` Playwright dependency issue outside the T-015 change set.

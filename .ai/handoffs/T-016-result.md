Author: Codex (Implementer)

# T-016 Result

## Summary
Applied the `T-016-spec.md` UI cleanup by removing the guest banner flow, tightening the settings profile card, and making the top app brand navigate home.

## Files Changed
- `app/login/page.tsx`
- `components/app-shell.tsx`
- `components/guest-banner.tsx` (deleted)
- `components/top-app-bar.tsx`
- `app/settings/page.tsx`

## Implemented
- Changed the guest CTA label on the login page from `게스트로 체험하기` to `게스트로 로그인`.
- Removed guest-banner support from `AppShell`:
  - deleted the `GuestBanner` import
  - deleted the `GUEST_COOKIE` import
  - removed the `isGuest` prop from `AppShellProps`
  - removed guest-cookie/banner detection and rendering
- Deleted `components/guest-banner.tsx`.
- Wrapped the top app-bar brand block in `Link` so clicking `World Break` navigates to `/dashboard` without changing its appearance.
- Removed the profile avatar/initial block from the settings page and kept the profile section as text-only name/email information.

## Validation
- `rg -n "GuestBanner|guest-banner|isGuest\?: boolean|showGuestBanner|hasGuestCookie|게스트로 체험하기" app components lib`: PASS (no matches)
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL (`DIRECT_URL` not exported into the shell for Prisma CLI)
- `npm.cmd run build` with `.env.local` loaded into the process environment: FAIL due an unrelated pre-existing type error in `./~/gstack/browse/src/browser-manager.ts` (`Cannot find module 'playwright'`)

## Notes
- The implementation stayed within the five-file scope defined in the spec.
- `GUEST_COOKIE` remains in auth/login/settings server logic where it is still part of guest-session behavior; only the banner UI path was removed.

## Risks
- Full production build verification remains blocked by the unrelated `~/gstack/**` Playwright dependency issue outside the T-016 change set.

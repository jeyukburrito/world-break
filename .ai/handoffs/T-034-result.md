Author: Codex (Implementer)

# T-034 Result

## Summary
Added a desktop-only page header row inside `AppShell` so tablet/desktop layouts show the current page title and profile actions again, and removed the stale `title` prop definition from `TopAppBar`.

## Files Changed
- `components/app-shell.tsx`
- `components/top-app-bar.tsx`

## Implemented
- `components/app-shell.tsx`
  - removed the unused `title` prop pass-through to `TopAppBar`
  - added a `hidden md:flex` header row above `{children}` inside `<main>`
  - rendered the page title on the left and `headerRight` on the right when present
- `components/top-app-bar.tsx`
  - removed the unused `title` prop from `TopAppBarProps`

## Validation
- `npm.cmd run lint`: PASS
- Loaded `.env.local` into the process and ran `npm.cmd run build`: PASS

## Risks
- No browser-based desktop smoke test was run in this CLI session, so the final visual spacing across `dashboard`, `matches`, `matches/new`, `matches/[id]/edit`, and `settings` still needs reviewer confirmation.

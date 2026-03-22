Author: Codex (Implementer)

# T-012 Result

## Summary
Implemented guest mode across login, auth, middleware, and profile flows so the app can run without a Supabase session while still using Prisma-backed user records.

## Files Changed
- `.env.local.example`
- `app/login/actions.ts`
- `app/login/page.tsx`
- `app/settings/profile/actions.ts`
- `app/settings/profile/page.tsx`
- `components/app-shell.tsx`
- `components/guest-banner.tsx`
- `lib/auth.ts`
- `lib/guest.ts`
- `middleware.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260321042000_add_guest_mode/migration.sql`

## Implemented
- Added guest user support to Prisma with `isGuest` and `guestToken` on `User`.
- Added `lib/guest.ts` to mint guest tokens, resolve guest users, and lazily create guest users on first authenticated access.
- Extended `requireUser()` to return either a synced Supabase user or a Prisma-backed guest user based on session and guest cookie state.
- Added a guest entry action on the login page that sets `wb_guest_token` and redirects to `/matches/new`.
- Hid the Google login button when Supabase env vars are absent and exposed a guest-only login path for local/development use.
- Added `GuestBanner` to `AppShell` and adjusted copy so guest mode does not imply automatic account-data migration.
- Allowed guests to reach `/login?guest=upgrade` so the banner CTA can open the Google login screen without being redirected away by middleware.
- Updated profile UI and delete-account handling so guest users can remove their local guest account and session cleanly.
- Documented guest-mode env expectations in `.env.local.example`.

## Validation
- `npm.cmd run build`: PASS

## Notes
- Guest users are stored in the existing Postgres-backed `users` table with UUID ids to stay compatible with the current Prisma schema and relations.
- The spec's SQLite/provider-switch suggestion was not implemented because the schema is currently Postgres-specific; guest mode instead works by omitting Supabase env vars while keeping Prisma database connectivity.
- Guest-to-Google account data migration remains out of scope for this ticket.

## Risks
- Starting Google login from guest mode clears the guest cookie and begins a separate authenticated account; guest data is not transferred automatically.
- If a guest cookie is manually replaced with a new valid-looking token, the app can create a new guest row for that token on demand. This is acceptable within the current anonymous-device model.



Author: Codex (Implementation + Security/Critical Review)
Date: 2026-04-10
Subject: PM Handoff - Security & Critical Review (Current Working Tree)

## 1. Executive Summary

- Current conclusion: **PASS with follow-up required**
- No `P0` security issue was confirmed in the current working tree.
- I did **not** find:
  - auth bypass allowing cross-user access
  - SQL injection
  - confirmed IDOR against match/tournament data
  - direct guest access to auth-only scorecard save
- I did confirm:
  - `P1` account deletion integrity failure
  - `P2` scorecard privacy/availability contract mismatch
  - `P3` guest CSV export dead-end UX/auth-boundary issue

This memo is intended for PM handoff and is based on direct code inspection plus local validation (`lint`, `test`).

---

## 2. Verified Findings

### [P1] Account deletion is not guaranteed

**Evidence**
- `app/settings/actions.ts`
  - `deleteAccount()` creates the admin client before deletion flow.
  - DB user row is deleted before `admin.auth.admin.deleteUser(user.id)` is confirmed.
  - if Supabase Auth deletion fails, the code logs the error and still redirects to `/login?message=account_deleted`.
- `lib/auth.ts`
  - `ensureUserProfileExists()` recreates a missing Prisma `users` row on the next successful Supabase login.

**Impact**
- A user can see "account deleted" even though the Supabase Auth identity still exists.
- On next login, the app can recreate an empty account row and let the user re-enter.
- This is not an auth bypass, but it is a critical account-lifecycle integrity bug.

**PM recommendation**
- Treat as release-blocking if "account deletion" is advertised as irreversible.

---

### [P2] Scorecard storage privacy model is internally inconsistent

**Evidence**
- `app/matches/tournaments/[id]/result/actions.ts`
  - saves `storage.getPublicUrl(filePath)` into `TournamentSession.scorecardUrl`
- `app/matches/tournaments/[id]/result/save-scorecard-button.tsx`
  - opens the saved URL directly in the browser
- `docs/SUPABASE_SETUP.md`
  - instructs operators to create `tournament-scorecards` as a **private** bucket

**Impact**
- If ops follow the current setup guide, saved scorecards may not open via the stored URL.
- If the product instead requires public URLs for the current implementation, private tournament result images become link-accessible outside authenticated app flows.
- The code and deployment contract are currently misaligned on whether scorecards are public assets or protected user data.

**PM recommendation**
- Product/security decision required:
  - `private + signed URL` model, or
  - explicitly public asset model with accepted privacy tradeoff

---

### [P3] Guest users can enter CSV export UI for a feature they cannot execute

**Evidence**
- `app/settings/page.tsx` exposes CSV export navigation to guest users.
- `app/settings/export/page.tsx` renders the export form for any `requireUser()` result, including guests.
- `middleware.ts` blocks `/matches/export` via `SUPABASE_ONLY_PATHS`.

**Impact**
- Guests can navigate into a supported-looking flow and only fail at submit time via redirect.
- This is not a data exposure issue, but it is a misleading auth-boundary UX and should be closed.

**PM recommendation**
- Low priority unless guest mode is part of active product polish.

---

## 3. Re-checked Items That I Do Not Confirm As Security Bugs

### 3-1. `redirect()` inside `catch` blocks in match actions

I re-checked `app/matches/actions.ts`.

- In the current code, `redirect()` is called from the `catch` callback itself.
- `redirect()` throws immediately and is not swallowed afterward.
- I do **not** currently classify this as a confirmed bug or security issue.

This is still brittle style, but not a verified failure in the present implementation.

### 3-2. `/api/og/daily-summary` being in both public path logic and Supabase-only logic

I re-checked `middleware.ts` and `lib/supabase/middleware.ts`.

- Guest requests are blocked by the top-level guest branch in `middleware.ts`.
- Non-guest requests still flow into `updateSession()` and perform Supabase user resolution.
- I do **not** currently classify this as a security bypass.

This is primarily a routing-policy/UX distinction, not a confirmed auth hole.

### 3-3. "RLS + app layer" wording should not be treated as equal runtime defense

The repository documents dual protection, but runtime Prisma queries use server DB credentials rather than end-user Supabase RLS sessions.

- `supabase/rls.sql` is valid and useful for direct Supabase access patterns.
- For current Prisma server code, the real protection is still the app-layer `userId` scoping.

This is not an immediate vulnerability, but PM/engineering documentation should avoid overstating RLS coverage for server-side Prisma paths.

---

## 4. Validation Performed

- `npm.cmd run lint`: PASS
- `npm.cmd run test`: PASS
- Manual code review focus:
  - auth/session flow
  - guest/auth boundaries
  - destructive actions
  - storage URL exposure model
  - cross-user data access patterns

---

## 5. Suggested PM Next Actions

1. Open a fix ticket for account deletion integrity (`P1`).
2. Make an explicit product/security decision on scorecard access model (`P2`).
3. Hide or explain CSV export for guest users (`P3`).
4. Align docs so security claims match the actual runtime architecture.

---

## 6. Final Assessment

The codebase is generally disciplined and I do not see a critical exploit path today.
The most important unresolved issue is not classic intrusion risk, but **account lifecycle correctness**.
The next most important issue is the **privacy contract** for tournament scorecard images.

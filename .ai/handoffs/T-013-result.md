# T-013 Result

## Summary
- Completed a read-only audit of the Prisma schema, server actions, API routes, auth/guest flows, and dashboard raw SQL.
- Verdict summary: `7 FAIL`, `9 WARN`, `14 PASS`.
- Highest-risk findings:
  - Legacy `cs` data handling is inconsistent: the server still accepts `cs`, but current UI filters only expose `shop`.
  - UUID validation is missing on some mutation paths (`matchId`, `tournamentSessionId`), so malformed input can reach Prisma UUID fields.
  - Some `updateMany` / `deleteMany` paths report success even when zero rows were affected.
  - CSV export has no formula-injection defense and builds the full file in memory.

## Files Changed
- `.ai/handoffs/T-013-result.md`
- `.ai/daily/2026-03-22.md`

## Validation
- `npm.cmd run lint`: PASS
- `npx.cmd prisma validate`: FAIL (`schema-engine` download was blocked by network restrictions in the current environment; the audit verdicts below are based on static code inspection)

## Findings

### A. Prisma schema integrity
- `A-1 FAIL` `prisma/schema.prisma:143-147`, `lib/validation/match.ts:8-10`, `components/event-category-select.tsx:10-20`, `components/category-filter.tsx:9-13`, `app/settings/export/page.tsx:46-51`, `lib/dashboard.ts:89-90`
  - `cs` still exists in the DB enum and is still accepted by server-side validation / server actions, so a crafted form POST can still create new `cs` rows.
  - UI only exposes `friendly` / `shop`, and the dashboard/export "대회" filters only send `shop`, so legacy `cs` rows are excluded from filtered tournament views instead of being treated uniformly.
  - Existing `cs` rows remain readable in unfiltered lists and are coerced to `shop` only when edited through the current UI, which means the migration is partial and behavior is inconsistent.
  - 재현: submit `eventCategory=cs` to `createMatchResult`, or compare `/dashboard?category=shop` against the unfiltered dashboard when legacy `cs` data exists.
  - 영향: tournament analytics/export can undercount legacy data, and the supposedly removed category can still re-enter the system.
- `A-2 WARN` `prisma/schema.prisma:92-109`, `app/matches/actions.ts:139-145`, `app/matches/actions.ts:207-221`
  - There is no uniqueness constraint on `(userId, myDeckId, playedOn, eventCategory)`, and the create path always inserts a new `TournamentSession` when no `tournamentSessionId` is supplied.
  - The new optional `name` field suggests multiple same-day sessions may be intentional, but unnamed duplicate sessions are still possible and indistinguishable from accidental double-submit duplicates.
- `A-3 PASS` `prisma/schema.prisma:49-56`, `app/settings/games/actions.ts:110-136`
  - `Deck.game` is `onDelete: Restrict`, and `deleteGame` preloads the user's game, counts attached decks, and blocks deletion before Prisma can hit the FK restriction.
- `A-4 PASS` `prisma/schema.prisma:77-80`, `app/matches/tournaments/end/route.ts:26-44`
  - `MatchResult.tournamentSession` uses `onDelete: SetNull`, but there is no standalone tournament-session deletion path in the current codebase.
  - The only tournament-session mutation found is "end tournament", not delete.
- `A-5 PASS` `prisma/schema.prisma:11-23`, `lib/guest.ts:10-12`, `lib/guest.ts:41-47`
  - `User.id` is UUID-backed in Prisma, guest users use `crypto.randomUUID()`, and Supabase user IDs are also UUID strings. The formats are compatible.
- `A-6 WARN` `prisma/schema.prisma:82-88`, `lib/dashboard.ts:116-170`
  - `match_results_userId_playedAt_idx` and `match_results_userId_eventCategory_playedAt_idx` align with the dashboard's common `userId` + date/category filters.
  - `match_results_userId_myDeckId_playedAt_idx` is less aligned with the current raw SQL shape because dashboard queries filter by `userId` + `playedAt`, not by `myDeckId`; the trailing `playedAt` portion cannot be fully exploited without a bound `myDeckId`.
  - `userId_opponentDeckName`, `userId_playOrder`, `userId_matchFormat`, and `userId_tournamentSessionId` do not materially help the dashboard raw SQL paths; they exist for other app flows.
  - 개선 제안: if dashboard data volume grows materially, reassess composite order around `playedAt` for deck/opponent aggregations instead of assuming the current `myDeckId` index is sufficient.

### B. Server Actions safety
- `B-1 PASS` `app/matches/actions.ts:31-64`, `app/matches/actions.ts:112-145`, `app/matches/actions.ts:224-250`, `app/matches/actions.ts:290-299`, `app/matches/actions.ts:334-338`, `app/matches/actions.ts:397-401`, `app/settings/games/actions.ts:25-29`, `app/settings/games/actions.ts:66-69`, `app/settings/games/actions.ts:110-114`, `app/settings/decks/actions.ts:28-31`, `app/settings/decks/actions.ts:38-43`, `app/settings/decks/actions.ts:78-80`, `app/settings/tags/actions.ts:29-33`, `app/settings/tags/actions.ts:61-65`, `app/settings/profile/actions.ts:19-23`, `app/settings/profile/actions.ts:37-40`
  - All DB reads/writes in the scoped server actions are either keyed by `userId` directly or derive a previously user-scoped record before delete/update.
- `B-2 FAIL` `app/matches/actions.ts:277-285`, `app/matches/actions.ts:391-397`, `lib/validation/match.ts:3-20`
  - `parseMatchForm()` validates `tournamentSessionId` and `tagIds` as UUIDs, but `matchId` is only checked for non-empty string in both `updateMatchResult` and `deleteMatchResult`.
  - 재현: post `matchId=not-a-uuid` to either action.
  - 영향: invalid IDs can reach Prisma UUID fields and produce an unhandled server error instead of a controlled redirect.
- `B-3 FAIL` `app/settings/decks/actions.ts:77-96`, `app/matches/actions.ts:397-407`
  - `updateGame` and `tournaments/end` check `result.count === 0`, but `toggleDeckState` and `deleteMatchResult` do not.
  - 재현: submit another user's `deckId` to `toggleDeckState`, or a missing `matchId` to `deleteMatchResult`.
  - 영향: the UI can show a success toast even when no row was updated/deleted.
- `B-4 WARN` `app/matches/actions.ts:195-224`, `app/matches/actions.ts:288-375`
  - The tag reset inside `updateMatchResult` is correctly wrapped in `$transaction`, so the main match update and tag rewrite are atomic together.
  - However, `resolveGameAndDeck()` and `resolveTournamentSession()` happen outside that transaction in both create/update flows. If later steps fail, newly created game/deck/session rows can remain as side effects.
- `B-5 PASS` `app/matches/actions.ts:11-20`, `app/settings/games/actions.ts:10-12`, `app/settings/decks/actions.ts:10-12`, `app/settings/tags/actions.ts:10-12`, `app/settings/profile/actions.ts:25`, `app/settings/profile/actions.ts:34-45`, `app/login/actions.ts:12`, `app/login/actions.ts:21`, `app/login/actions.ts:35`
  - Where an action surfaces status via query params, errors use `?error=` and success uses `?message=` consistently.
  - Some auth flows redirect without status params (`startAsGuest`, `signOut`), but they do not invert the pattern.
- `B-6 FAIL` `app/matches/actions.ts:389-407`
  - `deleteMatchResult` calls `deleteMany` and always redirects to `?message=record_deleted` regardless of whether anything was removed.
  - 재현: delete the same record twice, or submit a missing/other-user `matchId`.
  - 영향: users receive false confirmation, and missing/unauthorized deletes are indistinguishable from real success.
- `B-7 FAIL` `app/matches/actions.ts:100-152`, `app/matches/actions.ts:195-224`
  - `createMatchResult` performs game upsert, deck upsert, tournament-session creation, and match creation as separate operations.
  - There is no unique constraint on the session key and no transaction spanning the full flow.
  - 재현: submit two identical first-round tournament forms concurrently, or double-submit before the first response returns.
  - 영향: duplicate `TournamentSession` rows and/or orphaned session/game/deck rows can be created.
- `B-8 PASS` `lib/auth.ts:111-141`, `middleware.ts:11-27`, `app/settings/profile/actions.ts:12-26`
  - Guest users are intentionally allowed to use normal CRUD actions on their own scoped data.
  - The two routes that must remain Supabase-only (`/matches/export`, `/matches/tournaments/end`) are explicitly blocked in middleware.

### C. API route audit
- `C-1 PASS` `app/matches/tournaments/end/route.ts:9-17`, `middleware.ts:11-27`
  - `tournaments/end` uses direct Supabase auth instead of `requireUser()`, but that is stricter, not looser: it guarantees a real Supabase session.
  - Middleware already rejects guest access before the route runs.
- `C-2 FAIL` `app/matches/tournaments/end/route.ts:19-35`
  - `tournamentSessionId` is only checked for non-empty string before being sent into `updateMany` on a UUID column.
  - 재현: POST `tournamentSessionId=not-a-uuid`.
  - 영향: invalid input can surface as an unhandled Prisma/database error instead of a controlled `tournament_not_found` redirect.
- `C-3 WARN` `app/matches/export/route.ts:23-52`, `lib/matches.ts:58-105`, `lib/csv.ts:5-11`
  - Export loads the entire filtered match set into memory, eagerly includes relations/tags, materializes every CSV row into an array, then joins the whole file into one string.
  - There is no row limit, streaming, or chunked response path. For a personal tracker this may be acceptable today, but the implementation does not scale gracefully.
- `C-4 FAIL` `app/matches/export/route.ts:27-52`, `lib/csv.ts:1-11`
  - CSV cells are quoted, but formula-leading characters are not neutralized.
  - User-controlled fields include `game.name`, `myDeck.name`, `opponentDeckName`, and `memo`.
  - 재현: save a memo such as `=HYPERLINK("https://example.com")`, then export and open the CSV in Excel/Sheets.
  - 영향: spreadsheet software can interpret exported cells as formulas.
- `C-5 PASS` `app/login/actions.ts:18-31`, `app/auth/callback/route.ts:11-16`, `lib/env.ts:33-42`
  - Both the login action and callback sanitize `next` via `getSafeRedirectPath()`, which only permits same-origin absolute paths starting with a single `/`.

### D. Auth & guest mode
- `D-1 WARN` `lib/auth.ts:115-141`, `app/auth/callback/route.ts:33-35`
  - The normal upgrade path clears the guest cookie on successful Google login, which reduces the chance of authenticated users silently falling back to guest mode.
  - However, `requireUser()` catches any Supabase auth error and will return a guest user whenever a guest cookie is present, even though the error may be transient infrastructure failure rather than a deliberate guest session choice.
- `D-2 PASS` `prisma/schema.prisma:11-23`, `lib/guest.ts:38-51`
  - `ensureGuestUserByToken()` uses a unique `guestTokenHash` and a single Prisma `upsert`, which is the correct code-level pattern for eliminating read-then-create races.
- `D-3 PASS` `lib/guest.ts:14-26`
  - The raw token stays only in an HTTP-only cookie; the DB stores a SHA-256 hash of a UUID-sized random token. For the current anonymous-device model, that is a reasonable storage design.
- `D-4 PASS` `middleware.ts:57-59`
  - The matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `manifest.json`, `sw.js`, `icons/`, and common image extensions, which covers the static assets currently present in the repo.
- `D-5 WARN` `lib/guest.ts:4`, `app/settings/profile/actions.ts:16-25`
  - Guest cookies expire after 30 days, but no scheduled cleanup or TTL-based purge for abandoned guest rows exists in the codebase.
  - Result: expired guest sessions leave unreachable user/match/tag/deck data behind until someone deletes them manually before expiry.
- `D-6 WARN` `app/settings/profile/actions.ts:16-25`, `prisma/schema.prisma:31`, `prisma/schema.prisma:49`, `prisma/schema.prisma:77`, `prisma/schema.prisma:102`, `prisma/schema.prisma:116`
  - Cascade coverage is correct: deleting `User` cascades to games, decks, matches, tournaments, and tags.
  - The guest delete flow still clears the cookie before attempting `prisma.user.delete()`, so the safer "delete DB state first, then clear the client token on success" ordering is not used for the guest branch.

### E. Dashboard raw SQL
- `E-1 PASS` `lib/dashboard.ts:61-93`, `lib/dashboard.ts:117-170`
  - Dynamic values are passed through `Prisma.sql` template bindings / `Prisma.join`; there is no string concatenation of user input into raw SQL.
- `E-2 WARN` `lib/dashboard.ts:85-93`
  - Unknown `category` values are ignored and widen the query back to "all categories" instead of being rejected.
  - This does not cross user boundaries because `m."userId" = ...` is always enforced, but invalid input silently broadens the caller's result set.
- `E-3 PASS` `lib/dashboard.ts:105-110`, `lib/dashboard.ts:186-207`
  - `unstable_cache` keys and tags both include `userId`, so cached aggregates remain user-scoped.
- `E-4 PASS` `lib/dashboard.ts:43-58`
  - `bigintToNumber()` can lose precision above `Number.MAX_SAFE_INTEGER`, but a personal TCG tracker would need astronomically high match counts before that becomes realistic.
- `E-5 WARN` `app/dashboard/page.tsx:20-23`, `lib/dashboard.ts:65-79`
  - `from` / `to` are accepted from query params without format validation and are passed through `new Date(...)` directly.
  - Invalid values are not normalized or rejected before query construction, so dashboard behavior on malformed dates is left to downstream Date/Prisma handling instead of an explicit guard.

## Suggested Follow-up Tickets
- Split legacy `cs` cleanup into a dedicated data-normalization ticket: server-side normalization, filter unification, and optional DB enum migration.
- Add UUID validation + `count === 0` handling for the remaining match/tournament/deck mutation paths.
- Harden CSV export with formula neutralization and a streaming / chunked response path.
- Revisit multi-step transactional boundaries around tournament-session creation if duplicate-session reports appear in production.

Author: Codex (Implementer)

# T-024 Result

## Summary
Implemented a dry-run-first cleanup script for expired guest accounts so orphaned guest-owned data can be reviewed safely and deleted explicitly when needed.

## Files Changed
- `package.json`
- `package-lock.json`
- `scripts/cleanup-guests.mjs`
- `.ai/handoffs/T-024-result.md`
- `.ai/daily/2026-03-28-codex.md`

## Implemented
- `scripts/cleanup-guests.mjs`
  - added a Prisma-backed cleanup entrypoint for expired guest users
  - targets `guestTokenHash IS NOT NULL` and `updatedAt < now - 60 days`
  - defaults to dry-run mode
  - supports `--apply`, `--dry-run`, and `--days=<n>`
  - logs the cutoff timestamp and affected user count before deleting
- `package.json`
  - added `cleanup:guests` script as `node scripts/cleanup-guests.mjs`

## Validation
- `node --check scripts/cleanup-guests.mjs`: PASS
- `npm.cmd run lint`: PASS
- `npm.cmd run cleanup:guests -- --dry-run`: FAIL locally because Prisma datasource validation/runtime environment is not usable in the current shell

## Notes
- Deleting `User` rows is sufficient for cleanup because Prisma relations already cascade to guest-owned child data.
- The implementation chose the spec's low-risk manual execution path rather than introducing DB cron or Vercel cron in the same ticket.

## Risks
- This cleanup is not yet scheduled automatically; it must be run manually until a cron-based follow-up is introduced.
- Runtime verification depends on a working Prisma datasource in the executing environment.

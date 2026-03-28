Author: Codex (Implementer)

# T-025 Result

## Summary
Removed the unused tag data model and application references so the Prisma schema, query layer, and match UI no longer carry dead `Tag` / `MatchResultTag` behavior.

## Files Changed
- `prisma/schema.prisma`
- `prisma/migrations/20260328183000_remove_tag_tables/migration.sql`
- `app/matches/actions.ts`
- `lib/validation/match.ts`
- `lib/matches.ts`
- `lib/group-matches.ts`
- `components/tournament-timeline.tsx`
- `lib/validation/tag.ts`
- `.ai/handoffs/T-025-result.md`
- `.ai/daily/2026-03-28-codex.md`

## Implemented
- `prisma/schema.prisma`
  - removed `Tag` and `MatchResultTag` models
  - removed tag relations from `User` and `MatchResult`
- `prisma/migrations/20260328183000_remove_tag_tables/migration.sql`
  - added a migration that drops `match_result_tags` and `tags`
- `app/matches/actions.ts`
  - removed tag parsing, ownership checks, write paths, and tag-related revalidation
- `lib/validation/match.ts`
  - removed `tagIds` from match form validation
- `lib/matches.ts`
  - removed tag selection from match list queries
- `lib/group-matches.ts`
  - removed tag typing from grouped match rows
- `components/tournament-timeline.tsx`
  - removed unused tag badge rendering
- `lib/validation/tag.ts`
  - deleted the unused tag validation module

## Validation
- `npm.cmd run lint`: PASS
- `rg -n "\\bTag\\b|MatchResultTag|settings/tags|tag-selector" app lib components prisma docs -S`: PASS for active app code; remaining hits are limited to historical migrations and analytics event names
- `npm.cmd run build`: FAIL due missing environment variable `DIRECT_URL` during Prisma config validation before Next build starts

## Notes
- `docs/ARCHITECTURE.md` did not require changes because it already described the current core model graph without tag entities.
- `prisma/seed.mjs` did not need edits because it no longer seeds tag data.

## Risks
- The migration file is present, but applying it still depends on a valid local Prisma database environment.
- Analytics event labels that mention tags remain as historical event naming and were intentionally left unchanged in this ticket.

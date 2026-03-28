# World Break — Agent Coordination Guide

## Overview
Mobile-first PWA for personal TCG match result tracking.

Architecture details: `docs/ARCHITECTURE.md`

## Tech Stack
- **Framework**: Next.js 15 App Router + TypeScript
- **UI**: Tailwind CSS
- **Auth**: Supabase Auth (Google login)
- **Database**: Supabase Postgres
- **ORM**: Prisma
- **Charts**: Recharts
- **Hosting**: Vercel

## Project Structure
```
world-break/
  app/           # Next.js App Router pages
  components/    # Reusable UI components
  lib/           # Utilities, Supabase client, Prisma client
  prisma/        # Prisma schema and migrations
  public/        # Static assets
  .ai/           # Multi-CLI collaboration system
    daily/       # Daily logs, reviews, retrospectives, release notes/checklists
```

## Prisma Models
- `User` — synced from Supabase Auth
- `Game` — user-defined card game categories
- `Deck` — user's own decks (scoped by Game)
- `MatchResult` — match records with `wins` and `losses`
- `TournamentSession` — shop/CS tournament grouping

## Coding Conventions
- Variables and code comments in English
- User-facing text in Korean
- Game terms (card names, keywords) in Japanese original
- Use server components by default; client components only when needed
- All data must be scoped by `userId` with RLS

## Working Principles
- Simplicity first: keep changes minimal and tightly scoped.
- Fix root causes; avoid temporary workarounds when addressing bugs or regressions.
- For work that spans multiple steps/files or changes architecture, update the relevant `.ai/` spec/handoff before implementation.
- Before calling work done, run the relevant verification commands and record the result, including failures.
- Use sub-agents only for clearly bounded work; keep one focused task per sub-agent and preserve file ownership boundaries.

## Session Start Protocol

**Read in this order to orient yourself:**
1. `.ai/TASKS.md` — top "현재 상태" block for current state summary, then ticket list for full status
2. Most recent result file for the last completed ticket (`handoffs/T-xxx-result.md`) — check "Next Agent Context" section if present
3. Relevant spec for the ticket you're working on

If the "현재 상태" block in TASKS.md looks stale (old date), treat the ticket list below it as authoritative.

## Multi-CLI Coordination
The `.ai/` directory is the single source of truth for all collaboration.

- `.ai/TASKS.md`: ticket index, status, and **current state header** (start here)
- `.ai/PROJECT_RULES.md`: role boundaries and operating rules
- `.ai/handoffs/`: spec and result documents
- `.ai/daily/`: daily logs, reviews, retrospectives, release notes, and release checklists

Do not use ad-hoc notes or chat-only instructions as collaboration sources of truth.
Do not create a parallel `tasks/` workflow for planning or lessons unless a dedicated project ticket explicitly introduces it; use the `.ai/` system instead.

## Role Assignment
| AI | Role | Responsibility |
|----|------|---------------|
| Claude | PM + Final Approval | Spec writing, final review approval, deployment |
| Codex | Implementation | Feature development based on spec |
| Gemini | Code Reviewer | Code review, quality/security/performance checks |

## Review Responsibilities
- Gemini reviews all implementation work (both Codex and Claude-authored).
- Gemini writes review documents as `daily/T-xxx-review-gemini.md`.
- Claude reviews Gemini's findings and makes the final approval/rejection decision.
- When Gemini performs a review, the review scope is limited to the ticket's spec/result and actual diff. Adding new requirements is prohibited.

## Daily Work Log
- Daily work logs must be written under `.ai/daily/`.
- Use one file per day per agent, named `YYYY-MM-DD-{agent}.md` (e.g., `2026-03-22-codex.md`).
- After each completed work session, append or update that day's log with:
  - summary of changes
  - files touched
  - validation performed
  - open risks or follow-up items

## Verification Standard
- Prefer the strongest relevant verification for the task, typically `npm run lint`, `npm run build`, and Prisma validation/generation commands when schema or data-access code changes.
- If an environment limitation blocks verification, record the exact command and failure reason in the result document and daily log.



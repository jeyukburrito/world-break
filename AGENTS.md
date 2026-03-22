Author: Codex

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
- `Tag` — user-defined tags
- `MatchResultTag` — M:N join table

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

## Multi-CLI Coordination
The `.ai/` directory is the single source of truth for all collaboration.

- `.ai/PROJECT_RULES.md`: role boundaries and operating rules
- `.ai/TASKS.md`: ticket index and status
- `.ai/handoffs/`: spec and result documents
- `.ai/daily/`: daily logs, reviews, retrospectives, release notes, and release checklists


Do not use ad-hoc notes or chat-only instructions as collaboration sources of truth.
Do not create a parallel `tasks/` workflow for planning or lessons unless a dedicated project ticket explicitly introduces it; use the `.ai/` system instead.

## Review Responsibilities
- Codex reviews Claude-owned implementation work when the work is executed in a remote environment.
- When Codex performs a review task, it must call a dedicated review sub-agent and then integrate the final review judgment itself.

## Daily Work Log
- Daily work logs must be written under `.ai/daily/`.
- Use one file per day named `YYYY-MM-DD.md`.
- After each completed work session, append or update that day's log with:
  - summary of changes
  - files touched
  - validation performed
  - open risks or follow-up items

## Verification Standard
- Prefer the strongest relevant verification for the task, typically `npm run lint`, `npm run build`, and Prisma validation/generation commands when schema or data-access code changes.
- If an environment limitation blocks verification, record the exact command and failure reason in the result document and daily log.



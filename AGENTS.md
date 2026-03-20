# World Break — Agent Coordination Guide

## Overview
Mobile-first PWA for personal TCG match result tracking.

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
  .ai/           # Claude↔Codex handoff system
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

## Claude↔Codex Coordination
The `.ai/` directory is the single source of truth for all collaboration.

- `.ai/PROJECT_RULES.md`: role boundaries and operating rules
- `.ai/TASKS.md`: ticket index and status
- `.ai/handoffs/`: spec and result documents
- `.ai/reviews/`: review documents
- `.ai/release/`: release checklist and deploy notes

Do not use ad-hoc notes or chat-only instructions as collaboration sources of truth.

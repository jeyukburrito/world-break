# GEMINI.md - World Break Project Context

This file provides the foundational context, architectural patterns, and development workflows for the **World Break** project. Adhere to these guidelines for all contributions.

## Project Overview

**World Break** is a mobile-first Progressive Web App (PWA) designed for Trading Card Game (TCG) players to record match results, analyze win rates by deck, track match-up statistics, and manage tournament sessions.

- **Primary Framework:** Next.js 15 (App Router) + TypeScript
- **Authentication:** Supabase Auth (Google OAuth) + Guest Mode (Cookie-based)
- **Database & ORM:** Supabase Postgres + Prisma 6
- **Styling:** Tailwind CSS
- **Visualization:** Recharts
- **Hosting:** Vercel

## Core Architecture

The project follows a standard Next.js App Router structure with a focus on Server Actions for data mutations and Prisma for database access.

- `app/`: Contains application pages, layouts, and Server Actions (`actions.ts` within route folders).
- `components/`: Reusable UI components.
- `lib/`: Core utility logic, including:
  - `auth.ts`: Authentication helpers and `requireUser()` session validation.
  - `prisma.ts`: Prisma client instance.
  - `supabase/`: Supabase client configuration for server and browser.
  - `dashboard.ts`: Complex SQL aggregations using Prisma `$queryRaw`.
  - `validation/`: Zod schemas for data validation (match, deck, game, tag).
- `prisma/`: Database schema (`schema.prisma`) and migrations.
- `supabase/`: SQL scripts for Row Level Security (RLS) policies.

## Key Patterns & Conventions

### 1. Authentication & User Scoping
- **`requireUser()`:** Use this function (cached via `react.cache()`) in all Server Components and Actions that require authentication. It handles Supabase session validation and ensures the user exists in the Prisma `users` table.
- **User Privacy:** The `User` model in Prisma stores only the `id` (UUID). Sensitive PII (email, name) remains in Supabase Auth metadata.
- **Data Isolation:** **Every** database query must include a `userId` filter to ensure users can only access their own data.

### 2. Documentation Standards
- **Consolidated Logs:** All reviews, session retrospectives, and daily logs are consolidated into the `.ai/daily/` directory.

### 3. Data Mutation (Server Actions)
- All data modifications (Create, Update, Delete) should be handled via Server Actions in `actions.ts` files.
- Use `zod` for input validation within these actions.
- Post-mutation, always use `revalidatePath()` to refresh the UI and `redirect()` where necessary.

### 4. Database Aggregation
- For dashboard statistics and complex queries, prefer raw SQL via `prisma.$queryRaw` in `lib/dashboard.ts` to optimize performance over multiple Prisma model calls.

### 5. Codebase Navigation
- Check `docs/ARCHITECTURE.md` for high-level design decisions.
- Follow `.ai/PROJECT_RULES.md` for collaboration between AI agents.
- Review `.ai/TASKS.md` for current development status and ticket tracking.
- All session logs, reviews, and checklists are located in `.ai/daily/`.

## Development Workflow

### Key Commands
- `npm run dev`: Start the development server at `http://localhost:3000`.
- `npm run build`: Perform a production build. Note: This automatically runs `prisma migrate deploy`.
- `npm run lint`: Run ESLint for code quality checks.
- `npm run prisma:generate`: Regenerate the Prisma Client.
- `npm run prisma:migrate`: Create and apply development migrations.
- `npm run prisma:seed`: Populate the database with development seed data.

### Testing & Validation
- Ensure new features are accompanied by appropriate validation logic in `lib/validation/`.
- Verify changes by running `npm run build` locally before pushing to ensure type safety and successful migration application.

## Collaboration & Handoffs
- All significant feature work follows a ticket-based system using `.ai/handoffs/`.
- **Spec:** `handoffs/T-xxx-spec.md` (Requirements & Done Definition).
- **Result:** `handoffs/T-xxx-result.md` (Implementation details, lint/build results).
- **Review:** `daily/T-xxx-review.md` (Quality assurance feedback).


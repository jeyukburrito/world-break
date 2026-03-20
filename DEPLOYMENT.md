# Deployment Guide

## Stack
- **Hosting**: Vercel
- **Database / Auth**: Supabase
- **ORM**: Prisma

## Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations (account deletion) |
| `DATABASE_URL` | Transaction Pooler — port 6543 (pgbouncer) |
| `DIRECT_URL` | Direct connection — port 5432 (migrations only) |

## Vercel Setup
1. Import `jeyukburisto/world-break` in Vercel.
2. Root Directory: `.` (root — no subdirectory).
3. Add all required environment variables for Production and Preview.
4. Deploy.

## Supabase Setup
1. Add the Vercel production URL to `Authentication > URL Configuration > Site URL`.
2. Add `https://YOUR_DOMAIN/auth/callback` to Redirect URLs.
3. Add the same URL to the Google OAuth client if Google login is enabled.

## Database Migration
Run from a machine with direct Supabase access:

```bash
npm run prisma:migrate -- --name your_change_name
```

For production deploys with an existing schema, prefer:
```bash
npx prisma migrate deploy
```

## Post-Deploy Verification
- [ ] Google login works on production URL
- [ ] `/matches/new` saves records
- [ ] `/matches` filters records
- [ ] CSV export downloads a file
- [ ] `/dashboard` loads stats without errors

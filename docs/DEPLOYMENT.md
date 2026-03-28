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
| `DIRECT_URL` | Direct connection — port 5432 (REQUIRED for build/migrate) |

## Vercel Setup
1. Import `jeyukburisto/world-break` in Vercel.
2. Root Directory: `.` (root — no subdirectory).
3. Add all required environment variables for Production and Preview.
4. Deploy.

## Supabase Setup
1. Set `Authentication > URL Configuration > Site URL` to `https://world-break.vercel.app`.
2. Add `https://world-break.vercel.app/auth/callback` to Redirect URLs.
3. Keep `http://localhost:3000/auth/callback` in Redirect URLs for local development.
4. Add `https://world-break.vercel.app` to Google OAuth client `Authorized JavaScript origins` if Google login is enabled.
5. Keep the Google OAuth client `Authorized redirect URI` pointed at the Supabase callback URL shown in Supabase.

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

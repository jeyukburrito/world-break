Author: Codex (Implementer)

# T-022 Result

## Summary
Fixed the Google login callback URL generation so production OAuth always returns to the canonical app domain `https://world-break.vercel.app/auth/callback` instead of inheriting a Vercel internal or preview host from request headers.

## Files Changed
- `lib/env.ts`
- `app/login/actions.ts`
- `docs/SUPABASE_SETUP.md`
- `docs/DEPLOYMENT.md`
- `.ai/handoffs/T-022-spec.md`
- `.ai/handoffs/T-022-result.md`
- `.ai/daily/2026-03-28-codex.md`

## Implemented
- `lib/env.ts`
  - added a canonical production app origin constant for auth callbacks
  - added `getAuthCallbackOrigin()` so OAuth uses the fixed production origin outside localhost
  - kept localhost and loopback hosts on dynamic local origins so local development still works
- `app/login/actions.ts`
  - replaced header-assembled `redirectTo` origin logic with `getAuthCallbackOrigin()`
  - preserved the existing `next` path sanitization and callback query handling
- `docs/SUPABASE_SETUP.md`
  - documented the exact Redirect URL entries required in Supabase
  - clarified that the app now uses a fixed production callback URL plus localhost in local dev
- `docs/DEPLOYMENT.md`
  - documented the exact production Site URL and callback URL
  - clarified the difference between Google OAuth JavaScript origins and the Supabase callback URI
- `.ai/handoffs/T-022-spec.md`
  - updated the ticket scope so it reflects the implemented OAuth callback fix instead of a docs-only task

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL due missing environment variable `DIRECT_URL` during Prisma config validation before Next build starts
- `rg -n "redirectTo|window\\.location\\.origin|VERCEL_URL|NEXT_PUBLIC_VERCEL_URL|/auth/callback|signInWithOAuth" app lib components docs -S`: PASS

## Notes
- Search results confirmed the login culprit was `app/login/actions.ts`; no `VERCEL_URL` or `NEXT_PUBLIC_VERCEL_URL` usage exists in the app code.
- `components/share-button.tsx` still uses `window.location.origin`, but only for client-side share URL assembly and not for Supabase OAuth redirects.
- Preview or Vercel internal hosts now intentionally redirect Google OAuth callbacks back to the canonical production domain.

## Risks
- Production verification still depends on Supabase Redirect URL allow list containing both `http://localhost:3000/auth/callback` and `https://world-break.vercel.app/auth/callback`.
- Full `npm run build` verification remains blocked by missing local database environment configuration unrelated to this auth change.

Author: Codex (Implementer)

# T-017 Result

## Summary
Applied the `T-017` spec by adding a stateless match-share flow: match cards can now generate public share URLs, `/share/match` renders a public preview page with OG metadata, and `/api/og/match` returns a 1200x630 social preview image without DB writes or auth requirements.

## Files Changed
- `app/api/og/match/route.ts`
- `app/share/match/page.tsx`
- `app/matches/page.tsx`
- `components/share-button.tsx`
- `components/match-share-og-card.tsx`
- `components/toast.tsx`
- `lib/share/match-share.ts`
- `lib/share/og-font.ts`
- `lib/toast.ts`
- `middleware.ts`
- `lib/supabase/middleware.ts`

## Implemented
- Added `lib/share/match-share.ts` to centralize:
  - share query validation
  - `/share/match?...` URL generation
  - `/api/og/match?...` URL generation
  - OG title/description/footer label formatting
  - request-origin resolution for absolute metadata URLs
- Added `app/api/og/match/route.ts` with `runtime = "edge"` and `ImageResponse`.
- Added `components/match-share-og-card.tsx` for the OG card layout:
  - MY DECK / OPPONENT split
  - centered WIN / LOSE badge
  - bottom metadata strip
  - generic fallback card when required params are missing
- Added `lib/share/og-font.ts` for the font spike / fallback path:
  - first try `Noto Sans KR` subset fetch
  - if the subset fetch exceeds the 500ms threshold, fall back to `Inter`
  - if both fail, render without custom fonts rather than throwing a 500
- Added `app/share/match/page.tsx`:
  - public preview page
  - OG / Twitter metadata
  - canonical URL
  - public CTA back into World Break
  - redirect to `/` when required params are missing
- Added `components/share-button.tsx` and wired it into `app/matches/page.tsx`:
  - mobile: `navigator.share({ url })`
  - fallback: clipboard copy + toast
  - single-match cards and tournament-round cards both supported
- Extended `components/toast.tsx` to support runtime custom toast events in addition to `?message=...`.
- Marked `/share` and `/api/og` as public paths in both middleware entry points so the shared page and OG image remain auth-free.

## Font Spike
- Local unrestricted network probe for `Noto Sans KR` subset fetch:
  - weight 400: CSS 331.3ms + font 349.6ms = 680.9ms
  - weight 700: CSS 326.9ms + font 349.3ms = 676.2ms
- Local unrestricted network probe for `Inter` subset fetch:
  - weight 400: CSS 326.4ms + font 343.1ms = 669.5ms
  - weight 700: CSS 309.8ms + font 328.7ms = 638.5ms
- Decision:
  - keep the spike logic in code
  - only use `Noto Sans KR` when it stays within the 500ms budget
  - otherwise fall back to `Inter` per spec

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL (`DIRECT_URL` not exported into the shell for Prisma CLI)
- `Get-Content .env.local | ForEach-Object { ... }; npm.cmd run build`: FAIL due unrelated pre-existing type error in `./~/gstack/browse/src/browser-manager.ts` (`Cannot find module 'playwright'`)

## Notes
- `app/matches/actions.ts` and Prisma schema were not changed.
- The share flow is fully stateless; no share tokens, share tables, or persisted flags were added.
- Missing or invalid OG query parameters render a generic fallback image instead of returning a 500.

## Risks
- The full production build is still blocked by the unrelated `~/gstack/**` Playwright type dependency issue outside the T-017 change set.
- The Noto subset fetch exceeded the 500ms target in the local probe, so runtime behavior may fall back to `Inter` until deployment-side latency proves lower.

Author: Codex (Implementer)

# T-021 Result

## Summary
Applied the `T-021` spec by removing runtime Google Fonts fetches from the OG image routes and switching them to bundled local font assets loaded from `public/fonts`.

## Files Changed
- `public/fonts/NotoSansKR-Regular.woff2`
- `public/fonts/NotoSansKR-Bold.woff2`
- `lib/share/og-font.ts`
- `lib/share/match-share.ts`
- `app/api/og/match/route.ts`
- `app/api/og/tournament/route.ts`
- `.ai/TASKS.md`

## Implemented
- `public/fonts/*`
  - generated bundled `NotoSansKR-Regular.woff2` and `NotoSansKR-Bold.woff2` from the local system font source `C:\Windows\Fonts\NotoSansKR-VF.ttf`
  - removed OG runtime dependence on Google Fonts network access
- `lib/share/og-font.ts`
  - replaced Google Fonts CSS/font fetch logic with local disk reads from `public/fonts`
  - removed per-text font caching and network fallback-chain logic
  - kept a single module-level promise cache so OG routes do not re-read the font files on every request
- `lib/share/match-share.ts`
  - removed unused `buildMatchOgFontText`
  - removed unused `buildTournamentOgFontText`
- `app/api/og/match/route.ts`
  - changed OG font loading to `loadMatchOgFonts()`
  - removed the `buildMatchOgFontText` import
- `app/api/og/tournament/route.ts`
  - changed OG font loading to `loadMatchOgFonts()`
  - removed the `buildTournamentOgFontText` import
- `.ai/TASKS.md`
  - moved `T-021` to `in-progress` during implementation

## Validation
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: FAIL due missing environment variable `DIRECT_URL` in `prisma/schema.prisma`
- `npx.cmd next build`: FAIL due unrelated pre-existing type error in `./~/gstack/browse/src/browser-manager.ts` (`Cannot find module 'playwright'`)
- `rg -n "buildMatchOgFontText|buildTournamentOgFontText|loadMatchOgFonts\\(" app lib -S`: PASS

## Review
- Gemini was unavailable for review in this session.
- A separate Codex-invoked sub-agent review was requested instead.
- Review result: `NEEDS_FIX`
- Review summary:
  - the bundled fonts are full-size local exports at about 2MB each, not the smaller pre-subset assets the spec expected
  - the runtime network dependency is removed correctly, but asset footprint remains larger than intended
  - review record: `.ai/daily/T-021-review-subagent.md`

## Notes
- Both OG routes keep `runtime = "nodejs"` as required by the spec.
- Bundled font sizes are `2,072,860` bytes (`Regular`) and `2,120,040` bytes (`Bold`).

## Risks
- Full production build verification remains blocked by unrelated repository issues outside the T-021 change set (`DIRECT_URL` env requirement in the package build script and `playwright` type resolution failure under `~/gstack/**`).
- The current bundled fonts fix the runtime reliability issue, but they do not yet satisfy the spec's smaller-binary expectation called out by the sub-agent review.

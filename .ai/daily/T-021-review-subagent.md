Author: Codex Sub-Agent (Reviewer)

# T-021 Review - OG 이미지 폰트 번들링

**리뷰어**: Codex-invoked sub-agent  
**날짜**: 2026-03-25  
**판정**: `NEEDS_FIX`

---

## Review Summary
- Gemini가 현재 사용 불가하여 Codex가 별도 서브에이전트를 호출해 읽기 전용 검수를 수행함.
- OG 라우트의 런타임 Google Fonts 의존 제거 자체는 올바르게 구현되었음.
- 다만 번들된 `woff2` 자산이 로컬 variable font 전체 export에 가까운 약 2MB 크기라, 스펙이 기대한 더 작은 pre-subset 자산 목표에는 미달함.

## Findings
- `public/fonts/NotoSansKR-Regular.woff2` and `public/fonts/NotoSansKR-Bold.woff2` are full-size variable-font exports at about 2MB each, not the subsetted 200-400KB assets the spec calls for.
- This keeps the OG routes reliable, but increases deploy size and first-request I/O compared with the intended bundled-font footprint.

## Verification Gaps
- `npm.cmd run lint` passed.
- Full `next build` remained blocked by the unrelated existing `playwright` type dependency issue in `~/gstack/browse`.

## Decision
- `NEEDS_FIX`

## Notes
- This review was performed by a Codex sub-agent because Gemini was unavailable.

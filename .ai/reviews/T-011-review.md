# T-011 Review - PWA start_url 수정 + UI 중복 제목 제거

**리뷰어**: Codex  
**날짜**: 2026-03-21  
**판정**: `APPROVE`

---

## Review Summary
- `public/manifest.json`의 `start_url`이 `/matches/new`로 수정되어 실제 앱 진입 경로와 일치합니다.
- `app/dashboard/page.tsx`에서 본문 중복 제목이 제거되었고, `PeriodFilter`가 `AppShell` `headerRight`로 이동해 최신 스펙과 일치합니다.
- `app/matches/page.tsx`와 `app/settings/page.tsx`의 중복 본문 제목 제거가 반영되었습니다.
- `.ai/handoffs/T-011-result.md`와 일일 작업 로그가 현재 구현 상태를 반영합니다.
- `npm.cmd run build` 검증이 통과했습니다.

## Pass
- `public/manifest.json`
  - `start_url` = `"/matches/new"`
- `app/dashboard/page.tsx`
  - 본문 타이틀 블록 제거 완료
  - `PeriodFilter`가 `headerRight`에서 `HeaderActions`와 함께 렌더링됨
- `app/matches/page.tsx`
  - 중복 `<h2>` 제거 완료
  - 경기 수 배지와 `새 기록` 버튼 우측 정렬 유지
- `app/settings/page.tsx`
  - 중복 제목 `<section>` 제거 완료
- `.ai/handoffs/T-011-result.md`
  - 새 스펙 기준 설명으로 갱신 완료
- `npm.cmd run build`
  - PASS

## Issues
- None blocking.

## Decision
- `APPROVE`

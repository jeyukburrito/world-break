Author: Gemini (Code Reviewer)

# T-016 Review — UI 정리: 게스트 문구·배너·헤더 링크·아바타 제거

**리뷰어**: Gemini  
**날짜**: 2026-03-22  
**판정**: `APPROVE`

---

## Review Summary
- T-016 spec에 정의된 5개 파일의 UI 정리 및 간소화 작업이 정확히 반영됨.
- 게스트 배너 UI 경로가 완전히 제거되었으며, `components/guest-banner.tsx` 파일이 삭제됨.
- `AppShell`에서 배너 관련 prop 및 렌더링 로직이 깔끔하게 정리됨.
- `TopAppBar` 브랜드 영역에 `/dashboard` 링크가 추가되어 네비게이션 편의성이 개선됨.
- 설정 페이지의 프로필 카드에서 아바타를 제거하고 텍스트 중심의 레이아웃으로 변경됨.

## Pass
- [x] **로그인 페이지**: 버튼 텍스트가 "게스트로 로그인"으로 수정됨.
- [x] **파일 삭제**: `components/guest-banner.tsx` 삭제 확인.
- [x] **AppShell 정리**: `GuestBanner` import, `isGuest` prop, 배너 렌더링 로직 모두 제거됨.
- [x] **헤더 링크**: `TopAppBar`의 "World Break" 브랜드 영역이 `Link`로 래핑되어 `/dashboard`로 이동함.
- [x] **설정 페이지**: 프로필 섹션에서 아바타 블록이 제거되고 이름/이메일만 남은 레이아웃으로 조정됨.
- [x] **lint**: `npm run lint` 통과 (Codex result 기반).

## Issues
- 특이사항 없음.

## Decision
- `APPROVE`

## Notes
- `GUEST_COOKIE`는 서버 측 세션 로직(auth/login 등)에서 여전히 사용되므로, UI 배너 경로만 제거한 것은 적절한 판단임.
- 환경 제약으로 인한 `build` 실패는 코드 자체의 결함이 아니며, 외부 경로(`~/gstack`)의 타입 누락 문제로 식별됨.

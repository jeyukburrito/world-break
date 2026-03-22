Author: Claude (PM/QA)

# T-012 Review - 게스트 모드

**리뷰어**: Codex  
**날짜**: 2026-03-21  
**판정**: `APPROVE`

---

## Review Summary
- 로그인 페이지에 게스트 진입 경로가 추가되었고, Supabase 미설정 환경에서도 게스트 모드로 진입할 수 있습니다.
- `requireUser()`와 `middleware.ts`가 게스트 쿠키를 인식하도록 확장되어 보호 페이지 접근이 Prisma 기반 게스트 사용자로 연결됩니다.
- 프로필 페이지와 계정 삭제 액션이 게스트 사용자 상태를 처리하도록 보강되었습니다.
- 게스트 배너의 계정 전환 CTA는 `/login?guest=upgrade` 예외를 통해 실제로 로그인 화면에 도달할 수 있도록 수정되었습니다.
- 현재 구현은 스펙의 핵심 요구사항을 충족하지만, 게스트 데이터의 계정 이전은 여전히 범위 밖입니다.

## Pass
- `prisma/schema.prisma`
  - `User`에 `isGuest`, `guestToken`이 추가되었고 마이그레이션이 존재합니다.
- `lib/guest.ts`
  - 게스트 토큰 생성, 쿠키 옵션, 게스트 사용자 조회/생성 로직이 구현되었습니다.
- `lib/auth.ts`
  - Supabase 사용자 우선, 게스트 쿠키 fallback 흐름으로 `requireUser()`가 확장되었습니다.
- `middleware.ts`
  - 게스트 쿠키를 인식하고, Supabase 미설정 시 보호 경로를 `/login`으로 보내며, 게스트 업그레이드용 로그인 경로 예외를 허용합니다.
- `app/login/page.tsx`
  - Google 로그인과 게스트 체험 버튼이 분리되었고, Supabase 미설정 시 게스트 중심 UI가 노출됩니다.
- `app/settings/profile/actions.ts`
  - 게스트 계정 삭제 시 쿠키 제거와 Prisma 사용자 삭제가 수행됩니다.
- `app/settings/profile/page.tsx`
  - 게스트 상태에 맞는 계정 정보와 삭제 안내 문구가 노출됩니다.
- `npm.cmd run build`
  - PASS

## Issues
- None blocking.

## Decision
- `APPROVE`


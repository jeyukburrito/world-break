Author: Claude (PM)
Status: done (code fix applied, prod verification needed)

# T-020: QA Fix — Share Card OG Image, Share Login Redirect, 대회 종료

## 배경

사용자 리포트 (2026-03-23):
1. 공유 카드 OG 이미지 깨짐 ("?")
2. 공유 기능을 로그인해서 봐야 한다는 인식
3. 대회 종료 기능 작동 안 함

## 수정 범위

### Fix 1: OG Image 500 에러 방어 처리
- `app/api/og/tournament/route.ts`: try/catch 추가 → 에러 시 fallback 카드 반환
- `app/api/og/match/route.ts`: 동일 처리

### Fix 2: 공유 페이지 → 로그인 리다이렉트 루프 해결
- `app/share/tournament/page.tsx`: 파라미터 오류 시 `redirect("/")` 대신 인라인 에러 메시지
- `app/share/match/page.tsx`: 동일 처리
- 미인증 사용자도 에러 메시지 볼 수 있음 (로그인 페이지로 안 넘어감)

### Fix 3: 대회 종료 기능 복구
- `middleware.ts`: SUPABASE_ONLY_PATHS에서 `/matches/tournaments/end` 제거
  (route.ts가 이미 게스트 인증을 지원하므로 미들웨어 차단 불필요)
- `app/matches/page.tsx`: TournamentMatchCard에 "대회 종료" 버튼 직접 추가
  (기존에는 /matches/new의 TournamentBanner에만 있었음)

## 배포 후 확인 사항

1. `/share/tournament?...` 페이지에서 OG 이미지 정상 표시 여부
2. 파라미터 없는 공유 URL 접근 시 에러 메시지 표시 (로그인 리다이렉트 아님)
3. 기록 목록에서 "대회 종료" 버튼 작동 여부 (Supabase + 게스트 모두)

## 미해결 과제

OG 이미지 렌더링 실패의 근본 원인 불명 (로컬 dev 환경 전체가 500 → 재현 불가).
프로덕션 로그 확인 필요. 가능한 원인:
- Vercel edge 함수에서 Google Fonts 로딩 타임아웃
- Satori 렌더링 오류 (지원하지 않는 CSS 속성)
- ImageResponse 번들 크기 또는 메모리 이슈

근본 원인 확인 후 별도 티켓 작성 필요.

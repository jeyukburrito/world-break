Author: Claude (PM)

# T-022: 커스텀 도메인 설정 + Supabase Redirect URL 정비

## 배경

현재 앱 URL이 `world-break-jeyukburritos-projects.vercel.app`으로 길고 기억하기 어려움.
공유 카드(OG 이미지), PWA 설치, 브라우저 북마크 등에서도 긴 URL이 노출됨.
또한 Google 로그인 시작 시 서버 헤더 기반으로 `redirectTo`를 조합하면 Vercel 내부/preview 호스트가 섞여 Supabase Redirect URL allow list와 불일치할 수 있음.

## 목표

짧고 기억하기 쉬운 도메인으로 앱 접근 가능하게 만들고, Google 로그인 콜백 URL도 canonical 프로덕션 도메인으로 일관되게 고정하기.

## 작업 항목

### 1단계: Vercel 도메인 설정 (사용자 수동 작업)

두 가지 옵션 중 선택:

**옵션 A: 커스텀 도메인 (추천)**
- 도메인 구매 (예: `worldbreak.app`, `world-break.kr` 등)
- Vercel 대시보드 → Project Settings → Domains → 도메인 추가
- DNS 레코드 설정 (CNAME 또는 A 레코드)
- Vercel이 자동으로 SSL 인증서 발급

**옵션 B: Vercel 프로젝트명 변경 (무료, 즉시)**
- Vercel 대시보드 → Project Settings → General → Project Name
- `sve-meta` → `world-break` 으로 변경
- 결과: `world-break.vercel.app` (현재보다 훨씬 짧음)
- 기존 URL도 자동 리다이렉트됨

### 2단계: Supabase Redirect URL 업데이트 (사용자 수동 작업)

도메인 변경 후 반드시 수행:
1. Supabase 대시보드 → Authentication → URL Configuration
2. **Site URL**: 새 도메인으로 변경 (예: `https://world-break.vercel.app`)
3. **Redirect URLs**: `https://NEW_DOMAIN/auth/callback` 추가
4. Google OAuth Console → Authorized redirect URIs에도 새 콜백 URL 추가

### 3단계: 코드 변경 (자동화 가능)

도메인 확정 후:

- [ ] `lib/env.ts` / `app/login/actions.ts` — production OAuth `redirectTo`를 `https://world-break.vercel.app/auth/callback` 기준으로 고정
- [ ] localhost 개발 환경에서는 현재 로컬 origin(`http://localhost:3000`)을 계속 사용
- [ ] `docs/DEPLOYMENT.md` — 새 도메인으로 문서 업데이트
- [ ] `docs/SUPABASE_SETUP.md` — Redirect URL 예시 업데이트
- [ ] `public/manifest.json` — `start_url`, `scope` 확인 (상대경로면 변경 불필요)
- [ ] OG 이미지 URL 확인 — `getRequestOrigin()` 사용 중이므로 자동 대응됨

## 영향 범위

- 인증 진입점(`app/login/actions.ts`)과 env 유틸(`lib/env.ts`) 수정
- 운영 문서(`docs/DEPLOYMENT.md`, `docs/SUPABASE_SETUP.md`) 업데이트
- Vercel/Supabase 설정은 대시보드에서 수동 수행
- 기존 공유 링크: Vercel이 이전 URL → 새 URL 자동 리다이렉트 처리

## 수용 기준

- [ ] 새 도메인으로 접속 가능
- [ ] Google 로그인 시작 시 `redirectTo`가 `https://world-break.vercel.app/auth/callback` 기준으로 생성됨
- [ ] Google 로그인 완료 후 새 도메인으로 정상 리다이렉트
- [ ] localhost 개발 환경 로그인은 `http://localhost:3000/auth/callback`을 계속 사용
- [ ] PWA 설치 시 새 도메인 표시
- [ ] 공유 카드 URL에 새 도메인 반영

## 비고

- 옵션 B(프로젝트명 변경)는 Vercel 대시보드에서 1분이면 완료
- 옵션 A(커스텀 도메인)는 도메인 구매 + DNS 전파 시간(최대 48시간) 필요
- 두 옵션 모두 Supabase redirect URL 업데이트 필수
- preview/Vercel 내부 도메인에서 로그인 버튼을 눌러도 OAuth 콜백은 canonical 프로덕션 도메인으로 돌아오도록 처리함

# T-014: 프로필+설정 페이지 통합

**Author:** Claude (PM/QA)
**Status:** ready
**Priority:** P1
**Effort:** human: ~2h / CC: ~15min

---

## 배경

현재 프로필(`/settings/profile`)과 설정(`/settings`)이 분리되어 있다.
- 프로필 페이지: 아바타, 이름, 이메일, 매치 스탯, 게임 관리 링크, 계정 정보, 회원 탈퇴
- 설정 페이지: CSV 내보내기, 로그아웃

모바일 PWA에서 두 페이지를 오가는 것이 불필요. 하나의 설정 페이지로 통합한다.

## 변경 사항

### 1. 프로필 아바타 링크 변경
- `components/profile-avatar.tsx`: `href="/settings/profile"` → `href="/settings"`

### 2. 설정 페이지에 프로필 카드 통합
- `app/settings/page.tsx`에 프로필 정보(아바타, 이름, 이메일) + 매치 스탯 통합
- 레이아웃 순서:
  1. 프로필 카드 (아바타 + 이름 + 이메일)
  2. Match Stats (총 경기, 승률) — **2개만, 2열 그리드**
  3. CSV 내보내기 링크
  4. Account 섹션 (가입일)
  5. 로그아웃
  6. Danger Zone (회원 탈퇴)

### 3. 삭제 항목
- **게임 관리 메뉴** (`/settings/games` 링크) — 프로필에서 제거
- **마지막 경기 스탯** (`StatCard label="마지막 경기"`) — 삭제
- **`/settings/profile` 페이지** — 설정에 통합되므로 삭제
  - `app/settings/profile/page.tsx` 삭제
  - `app/settings/profile/actions.ts` 삭제

### 4. 유지 항목
- `/settings/games` 라우트 자체는 유지 (바텀 네비에서 접근 불가하지만 직접 URL 접근은 가능)
- `StatCard` 컴포넌트 — 설정 페이지에서 재사용
- `getProfileStats()` — 설정 페이지로 이동 (gameCount 쿼리 제거 가능)
- `deleteAccount` Server Action — 설정 페이지로 import 경로 변경

## Done Definition

- [ ] 프로필 아바타 클릭 → `/settings`으로 이동
- [ ] 설정 페이지에 프로필 카드 + 매치 스탯(총 경기, 승률) 표시
- [ ] 게임 관리 링크 없음
- [ ] 마지막 경기 스탯 없음
- [ ] `/settings/profile` 페이지 삭제
- [ ] `npm run build` 통과
- [ ] 게스트/로그인 모드 모두 정상 동작

## 참고

- 기존 프로필 페이지 코드: `app/settings/profile/page.tsx` (229줄)
- 기존 설정 페이지 코드: `app/settings/page.tsx` (83줄)
- `deleteAccount` action: `app/settings/profile/actions.ts`
- Storm Design System 규칙 준수 (항상 다크 모드, 라운딩 24px/28px, 44px 터치 타겟)

Author: Claude (PM)

# T-016 — UI 정리: 게스트 문구·배너·헤더 링크·아바타 제거

## 배경

게스트 UX 문구 정확성, 불필요한 반복 배너 제거, 네비게이션 기본 패턴 보완, 설정 페이지 간소화.

## 변경사항

### 1. 로그인 페이지 — 버튼 텍스트 변경

**파일:** `app/login/page.tsx`

- 65행: "게스트로 체험하기" → "게스트로 로그인"

### 2. 게스트 배너 완전 제거

**파일:** `components/app-shell.tsx`, `components/guest-banner.tsx`

- `components/guest-banner.tsx` 파일 삭제
- `app-shell.tsx`에서:
  - `GuestBanner` import 제거
  - `GUEST_COOKIE` import 제거
  - `isGuest` prop 제거 (AppShellProps에서도)
  - `hasGuestCookie`, `showGuestBanner` 로직 제거
  - 배너 렌더링 블록 (`{showGuestBanner ? ... : null}`) 제거
  - `cookies()` 호출이 더 이상 필요 없으면 제거 (다른 용도 확인 후)

### 3. 헤더에 홈 링크 추가

**파일:** `components/top-app-bar.tsx`

- 아이콘 + "World Break" 텍스트를 `<Link href="/dashboard">` 로 감싸기
- `next/link` import 추가
- 시각적 변경 없음 (스타일 유지, 링크 동작만 추가)

### 4. 설정 페이지 프로필 아바타 제거

**파일:** `app/settings/page.tsx`

- 71-87행의 아바타 블록 (size-20 원형 이미지/이니셜) 제거
- 이름/이메일 표시는 유지하되, 아바타 없는 레이아웃으로 조정
- flex + gap-4 구조 → 아바타 div 제거 후 이름/이메일만 남기기

변경 후 프로필 섹션 구조:
```
┌─────────────────────────────────┐
│  Profile                        │
│  사용자이름                      │
│  user@email.com                 │
└─────────────────────────────────┘
```

## Done Definition

- [ ] 로그인 페이지 버튼: "게스트로 로그인"
- [ ] `guest-banner.tsx` 파일 삭제
- [ ] `app-shell.tsx`에서 배너 관련 코드 전부 제거 (import, prop, 로직, 렌더링)
- [ ] 헤더 "World Break" 클릭 시 `/dashboard` 이동
- [ ] 설정 페이지 프로필 아바타(사진/이니셜) 제거, 이름·이메일 유지
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과 (또는 환경 제약 시 lint로 대체, 사유 기록)

## 영향 범위

| 파일 | 변경 유형 |
|------|-----------|
| `app/login/page.tsx` | 텍스트 1줄 변경 |
| `components/app-shell.tsx` | 배너 관련 코드 삭제 |
| `components/guest-banner.tsx` | 파일 삭제 |
| `components/top-app-bar.tsx` | Link 래핑 추가 |
| `app/settings/page.tsx` | 아바타 블록 삭제 |

5개 파일, 전부 삭제·축소 방향.

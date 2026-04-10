# Architecture — World Break

> 이 문서는 앱의 아키텍처 패턴, 데이터 모델, 디렉토리 구조를 설명합니다.
> 행동 지침과 협업 규칙은 `CLAUDE.md`를 참조하세요.

---

## 인증 흐름

- Supabase Auth (Google OAuth) → `middleware.ts`가 모든 요청에서 세션 갱신
- `requireUser()` (`lib/auth.ts`) — `react.cache()` 래핑으로 렌더 트리 내 1회만 실행. Supabase 세션 우선 → 게스트 쿠키(`wb_guest_token`) fallback → 미인증 시 `/login` redirect. Supabase user는 Prisma `users` 테이블에 upsert 동기화.
- **게스트 모드** (`lib/guest.ts`): Supabase 환경 변수 없이 쿠키 기반으로 동작. 게스트 세션은 `/matches/export`, `/matches/tournaments/end` 접근 불가 (미들웨어 차단). Google OAuth 성공 후에만 게스트 쿠키 삭제.
- **Canonical host redirect** (`middleware.ts`): `/auth/callback` 경로에만 적용. 전체 경로에 적용하면 preview 배포가 모두 프로덕션으로 307 리다이렉트되는 버그 발생.
- 모든 페이지 컴포넌트는 서버 컴포넌트로 작성, 상단에서 `await requireUser()` 호출.

---

## 셸 아키텍처 (Adaptive Shell)

반응형 레이아웃은 `md` 브레이크포인트(768px)를 기준으로 모바일/데스크톱 레이아웃을 전환한다.

| 컴포넌트 | 가시성 | 역할 |
|---------|--------|------|
| `components/app-shell.tsx` | 항상 | 루트 래퍼. 데스크톱에서 `md:pl-56` + `max-w-3xl` 콘텐츠 영역 제한 |
| `components/side-nav.tsx` | `md:flex` (모바일 `hidden`) | 고정 사이드바 (w-56). 브랜드, nav 항목, `+ 새 매치 입력` CTA |
| `components/bottom-nav.tsx` | `md:hidden` | 모바일 하단 탭 바 |
| `components/top-app-bar.tsx` | `md:hidden` | 모바일 상단 바. 데스크톱에서 페이지 제목·프로필 미노출 (T-034 예정) |
| `lib/navigation.ts` | — | `NavigationItem` 타입 + `isNavigationItemActive()`. BottomNav/SideNav 공유 |

- 레이아웃 전환은 Tailwind 클래스로만 처리 (JS 감지 없음)
- 네비게이션 활성 상태 로직은 `lib/navigation.ts`에 중앙화

---

## Server Actions 패턴

- 모든 데이터 변경은 `app/**/actions.ts`의 Server Actions로 처리 (별도 API route 없음)
- 변경 후 반드시 `revalidatePath()` 호출 + `redirect()`로 응답
- 에러는 `redirect("/path?error=메시지")`, 성공은 `redirect("/path?message=코드")`

---

## 데이터 스코핑

- 모든 DB 쿼리에 `userId` 조건 포함 필수 (Supabase RLS + 앱 레이어 이중 보호)
- `updateMany` / `deleteMany` 사용 시 반드시 `{ id, userId }` 조건 — 타인 데이터 보호

---

## 대회 세션 (TournamentSession)

- `eventCategory`가 `shop`이면 `TournamentSession`이 자동 생성/연결
- `tournamentSessionId` URL 파라미터로 기존 세션에 연결하거나 없으면 신규 생성
- 종료(`endedAt` != null)된 세션에는 새 라운드 추가 불가
- 대회 종료 후 `/matches/tournaments/[id]/result` 페이지에서 성적 요약 확인 + PNG 스코어카드 저장 가능
- `scorecardUrl` — Supabase Storage에 업로드된 PNG URL (`tournament-scorecards/{userId}/{sessionId}.png`). 인증 유저만 저장 가능.

---

## PNG / OG 이미지 생성

- Satori 기반 PNG 생성: `lib/og/render-scorecard.ts` (대회 스코어카드), `lib/og/render-daily-summary.ts` (일일 요약)
- `next/og`의 `ImageResponse`는 **Node.js runtime** API route에서만 사용. Server Action에서는 파일 다운로드에 부적합.
- 응답으로 반환 시 `Buffer` → `new Uint8Array(buffer)` 변환 필요 (직접 `Buffer`를 `Response`에 전달하면 타입 오류)
- 한글 렌더링: `public/fonts/NotoSansKR-Regular.woff2` + `NotoSansKR-Bold.woff2`를 `fs.readFile`로 로드, `react.cache()`로 메모이제이션
- **iOS Safari 제약**: `Content-Disposition: attachment` 무시 — 이미지가 새 탭에서 열림. 저장은 롱프레스(사진에 추가)로만 가능.

---

## Dashboard 집계

- `lib/dashboard.ts` — Prisma `$queryRaw`로 직접 SQL 집계 (ORM 집계 대신)
- `bigint` → `number` 변환 필요 (`bigintToNumber()` 헬퍼 사용)

---

## Prisma 스키마 주요 모델

```
User → Game → Deck → MatchResult
                   ↘ TournamentSession ← MatchResult
```

- `MatchResult.wins` / `losses` — BO1은 1/0, BO3은 2/1 or 1/2 (자동 계산)
- `MatchResult.isMatchWin` — 매치 승패 (games 기준 아님)
- `TournamentPhase`: `swiss` | `elimination`
- `TournamentSession.scorecardUrl` — 생성된 PNG 스코어카드 Supabase Storage URL (nullable)

---

## 디렉토리 구조

```
world-break/
├── app/                   # Next.js App Router
│   ├── dashboard/
│   ├── matches/
│   │   ├── [id]/edit/
│   │   ├── new/
│   │   ├── export/
│   │   └── tournaments/
│   │       ├── end/
│   │       └── [id]/result/
│   ├── settings/
│   │   ├── export/
│   │   ├── games/
│   │   └── profile/
│   ├── login/
│   └── offline/
├── components/            # 재사용 UI 컴포넌트
├── lib/                   # auth, prisma, supabase, dashboard, validation
├── prisma/                # schema.prisma + migrations
├── public/                # 정적 에셋 (icons, manifest, sw.js)
├── supabase/              # RLS SQL
├── types/
├── middleware.ts
├── docs/                  # 운영 문서
│   ├── ARCHITECTURE.md    # 이 문서
│   ├── DEPLOYMENT.md
│   └── SUPABASE_SETUP.md
├── .ai/                   # Multi-CLI 협업 시스템
│   ├── TASKS.md
│   ├── handoffs/
│   └── daily/
├── CLAUDE.md
└── AGENTS.md
```



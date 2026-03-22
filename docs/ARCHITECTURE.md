# Architecture — World Break

> 이 문서는 앱의 아키텍처 패턴, 데이터 모델, 디렉토리 구조를 설명합니다.
> 행동 지침과 협업 규칙은 `CLAUDE.md`를 참조하세요.

---

## 인증 흐름

- Supabase Auth (Google OAuth) → `middleware.ts`가 모든 요청에서 세션 갱신
- `requireUser()` (`lib/auth.ts`) — `react.cache()` 래핑으로 렌더 트리 내 1회만 실행. Supabase 세션 우선 → 게스트 쿠키(`wb_guest_token`) fallback → 미인증 시 `/login` redirect. Supabase user는 Prisma `users` 테이블에 upsert 동기화.
- **게스트 모드** (`lib/guest.ts`): Supabase 환경 변수 없이 쿠키 기반으로 동작. 게스트 세션은 `/matches/export`, `/matches/tournaments/end` 접근 불가 (미들웨어 차단). Google OAuth 성공 후에만 게스트 쿠키 삭제.
- 모든 페이지 컴포넌트는 서버 컴포넌트로 작성, 상단에서 `await requireUser()` 호출.

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
│   │   └── tournaments/end/
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



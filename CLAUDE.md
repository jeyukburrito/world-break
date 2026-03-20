# CLAUDE.md — World Break

World Break는 TCG 전적 기록 모바일 PWA입니다.

---

## Claude↔Codex 협업 규칙

Webapp 개발은 **파일 기반 핸드오프**로 운영합니다. 상세 규칙: `.ai/PROJECT_RULES.md`

- **Claude 역할**: PM + QA — spec 작성 (`handoffs/T-xxx-spec.md`), 리뷰 (`reviews/T-xxx-review.md`). 직접 구현 금지.
- **Codex 역할**: 구현 담당 — spec 기준으로만 코드 작성, result 작성 (`handoffs/T-xxx-result.md`). 범위 임의 확장 금지.
- **티켓 흐름**: spec → 구현 → result → review → 승인
- **티켓 현황**: `.ai/TASKS.md`
- **핸드오프 파일**: `.ai/handoffs/`, `.ai/reviews/`

---

## 기술 스택

- **Framework**: Next.js 15 App Router + TypeScript
- **Auth**: Supabase Auth (Google OAuth)
- **DB**: Supabase Postgres — Prisma 6 ORM
- **UI**: Tailwind CSS + Recharts
- **Hosting**: Vercel

---

## 개발 명령어 (루트 디렉토리에서 실행)

```bash
npm run dev            # 개발 서버 (localhost:3000)
npm run build          # 프로덕션 빌드 (배포 전 반드시 확인)
npm run lint           # ESLint 검사

# Prisma
npm run prisma:migrate  # 스키마 변경 → 마이그레이션 생성 + 적용 (DIRECT_URL 필요)
npm run prisma:generate # Prisma Client 재생성 (postinstall에서 자동 실행)
npm run prisma:seed     # 개발용 시드 데이터 삽입
```

---

## 환경 변수 설정 (`.env.local`)

`.env.local.example` 참고. 필수 값:

| 변수 | 용도 |
|------|------|
| `DATABASE_URL` | Transaction Pooler (pgbouncer, port 6543) — 앱 런타임 쿼리 |
| `DIRECT_URL` | Direct Connection (port 5432) — Prisma 마이그레이션 전용 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 계정 삭제 등 admin 작업 (optional) |

> `DATABASE_URL`과 `DIRECT_URL` 둘 다 없으면 Prisma 마이그레이션 실패.

---

## 아키텍처 핵심 패턴

**인증 흐름**
- Supabase Auth (Google OAuth) → `middleware.ts`가 모든 요청에서 세션 갱신
- `requireUser()` (`lib/auth.ts`) — `react.cache()` 래핑으로 렌더 트리 내 1회만 실행. 미인증 시 `/login` redirect. Supabase user를 Prisma `users` 테이블에 upsert 동기화.
- 모든 페이지 컴포넌트는 서버 컴포넌트로 작성, 상단에서 `await requireUser()` 호출.

**Server Actions 패턴**
- 모든 데이터 변경은 `app/**/actions.ts`의 Server Actions로 처리 (별도 API route 없음)
- 변경 후 반드시 `revalidatePath()` 호출 + `redirect()`로 응답
- 에러는 `redirect("/path?error=메시지")`, 성공은 `redirect("/path?message=코드")`

**데이터 스코핑**
- 모든 DB 쿼리에 `userId` 조건 포함 필수 (Supabase RLS + 앱 레이어 이중 보호)
- `updateMany` / `deleteMany` 사용 시 반드시 `{ id, userId }` 조건 — 타인 데이터 보호

**대회 세션 (TournamentSession)**
- `eventCategory`가 `shop` 또는 `cs`이면 `TournamentSession`이 자동 생성/연결
- `tournamentSessionId` URL 파라미터로 기존 세션에 연결하거나 없으면 신규 생성
- 종료(`endedAt` != null)된 세션에는 새 라운드 추가 불가

**Dashboard 집계**
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
│   │   ├── decks/
│   │   ├── export/
│   │   ├── games/
│   │   ├── profile/
│   │   └── tags/
│   ├── login/
│   └── offline/
├── components/            # 재사용 UI 컴포넌트
├── lib/                   # auth, prisma, supabase, dashboard, validation
├── prisma/                # schema.prisma + migrations
├── public/                # 정적 에셋 (icons, manifest, sw.js)
├── supabase/              # RLS SQL
├── types/
├── middleware.ts
├── .ai/                   # Claude↔Codex 핸드오프 시스템
│   ├── TASKS.md
│   ├── handoffs/
│   ├── reviews/
│   └── release/
├── CLAUDE.md
├── AGENTS.md
└── DEPLOYMENT.md
```

---

## 운영 원칙

### Plan Node Default
- 3단계 이상 또는 아키텍처 결정이 필요한 작업은 plan mode 진입
- 막히면 즉시 STOP → 재계획

### Subagent Strategy
- 리서치·탐색·병렬 분석은 subagent에게 위임해 메인 컨텍스트 보존

### Verification Before Done
- 작업 완료 전 반드시 동작 증명 (`npm run build` 통과 등)

### Core Principles
- **Simplicity First**: 변경 범위 최소화
- **No Laziness**: 근본 원인 해결, 임시방편 금지

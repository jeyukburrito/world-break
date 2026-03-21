# CLAUDE.md — World Break

World Break는 TCG 전적 기록 모바일 PWA입니다.

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /browse, /qa, /qa-only, /design-review,
/setup-browser-cookies, /retro, /investigate, /document-release, /codex, /careful,
/freeze, /guard, /unfreeze, /gstack-upgrade.

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)  
- If something goes sideways, STOP and re-plan immediately - don't keep pushing  
- Use plan mode for verification steps, not just building  
- Write detailed specs upfront to reduce ambiguity  

---

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean  
- Offload research, exploration, and parallel analysis to subagents  
- For complex problems, throw more compute at it via subagents  
- One task per subagent for focused execution  

---

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern  
- Write rules for yourself that prevent the same mistake  
- Ruthlessly iterate on these lessons until mistake rate drops  
- Review lessons at session start for relevant project  

---

### 4. Verification Before Done
- Never mark a task complete without proving it works  
- Diff behavior between main and your changes when relevant  
- Ask yourself: "Would a staff engineer approve this?"  
- Run tests, check logs, demonstrate correctness  

---

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"  
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"  
- Skip this for simple, obvious fixes - don't over-engineer  
- Challenge your own work before presenting it  

---

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding  
- Point at logs, errors, failing tests - then resolve them  
- Zero context switching required from the user  
- Go fix failing CI tests without being told how  

---

## Task Management
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items  
2. **Verify Plan**: Check in before starting implementation  
3. **Track Progress**: Mark items complete as you go  
4. **Explain Changes**: High-level summary at each step  
5. **Document Results**: Add review section to `tasks/todo.md`  
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections  

---

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code  
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards



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
- `requireUser()` (`lib/auth.ts`) — `react.cache()` 래핑으로 렌더 트리 내 1회만 실행. Supabase 세션 우선 → 게스트 쿠키(`wb_guest_token`) fallback → 미인증 시 `/login` redirect. Supabase user는 Prisma `users` 테이블에 upsert 동기화.
- **게스트 모드** (`lib/guest.ts`): Supabase 환경 변수 없이 쿠키 기반으로 동작. 게스트 세션은 `/matches/export`, `/matches/tournaments/end` 접근 불가 (미들웨어 차단). Google OAuth 성공 후에만 게스트 쿠키 삭제.
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

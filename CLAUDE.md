# CLAUDE.md — World Break

World Break는 TCG 전적 기록 모바일 PWA입니다.
아키텍처 상세: `docs/ARCHITECTURE.md`

## gstack
Use /browse from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /browse, /qa, /qa-only, /design-review,
/setup-browser-cookies, /retro, /investigate, /document-release, /codex, /careful,
/freeze, /guard, /unfreeze, /gstack-upgrade.

---

## 행동 지침

### 1. Plan Node Default
- 3단계 이상 또는 아키텍처 결정이 필요한 작업은 plan mode 진입
- 막히면 즉시 STOP → 재계획
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- 리서치·탐색·병렬 분석은 subagent에게 위임해 메인 컨텍스트 보존
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Review lessons at session start for relevant project

### 4. Verification Before Done
- 작업 완료 전 반드시 동작 증명 (`npm run build` 통과 등)
- Ask yourself: "Would a staff engineer approve this?"

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes - don't over-engineer

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Zero context switching required from the user

---

## Core Principles
- **Simplicity First**: 변경 범위 최소화. Impact minimal code
- **No Laziness**: 근본 원인 해결, 임시방편 금지

---

## Task Management
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## 세션 프로토콜

### 세션 시작 시
1. `.ai/TASKS.md` 상단 "현재 상태" 블록 읽기 (진행 중 티켓, 다음 우선순위 확인)
2. 마지막 완료 티켓의 result에 "Next Agent Context" 섹션이 있으면 읽기

### 세션 종료 시 (TASKS.md 헤더 업데이트)
`.ai/TASKS.md` 상단 "현재 상태" 블록을 현재 상태로 업데이트:
- Last Updated 날짜
- 마지막 완료 티켓
- 다음 우선순위

### SessionEnd Hook (자동 로깅)
`.claude/hooks/session-end.sh`가 매 세션 종료 시 자동 실행:
- git branch, 마지막 커밋, uncommitted 변경 파일을 `.ai/daily/session-log.md`에 기록
- 설정: `.claude/settings.json` → `hooks.SessionEnd`

---

## AI AGENT 간 협업 규칙

Webapp 개발은 **파일 기반 핸드오프**로 운영합니다. 상세 규칙: `.ai/PROJECT_RULES.md`

- **Claude 역할**: PM + 최종 승인 — spec 작성 (`handoffs/T-xxx-spec.md`), Gemini 리뷰 확인 후 최종 승인. 직접 구현 금지.
- **Codex 역할**: 구현 담당 — spec 기준으로만 코드 작성, result 작성 (`handoffs/T-xxx-result.md`). 범위 임의 확장 금지.
- **Gemini 역할**: 코드 리뷰 — 구현 결과 리뷰 (`daily/T-xxx-review-gemini.md`). 코드 직접 수정 금지.
- **티켓 흐름**: spec → 구현 → result → review → 승인
- **티켓 현황**: `.ai/TASKS.md`
- **협업 문서 허브**: `.ai/handoffs/`, `.ai/daily/`

---

## 기술 스택

- **Framework**: Next.js 15 App Router + TypeScript
- **Auth**: Supabase Auth (Google OAuth)
- **DB**: Supabase Postgres — Prisma 6 ORM
- **UI**: Tailwind CSS (Material You tokens) + Recharts
- **Validation**: Zod
- **Hosting**: Vercel

---

## 개발 명령어 (루트 디렉토리에서 실행)

```bash
npm run dev            # 개발 서버 (localhost:3000)
npm run build          # 프로덕션 빌드 (배포 전 반드시 확인)
npm start              # 프로덕션 서버 (빌드 후 실행)
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
| `DEV_SEED_USER_ID` | 시드 데이터용 사용자 UUID (optional, dev only) |
| `DEV_SEED_USER_EMAIL` | 시드 데이터용 이메일 (optional, dev only) |

> `DATABASE_URL`과 `DIRECT_URL` 둘 다 없으면 Prisma 마이그레이션 실패.

---

## 참고 사항

- **테스트**: 테스트 프레임워크 미설정. 빌드(`npm run build`) 통과가 현재 유일한 검증 수단
- **Middleware**: `middleware.ts`에서 게스트/인증 세션 분기 처리. PUBLIC_PATHS: `/`, `/login`, `/auth/callback`, `/api/og`. SUPABASE_ONLY_PATHS: `/matches/export` (게스트 모드 미지원).
- **Path alias**: `@/*` → 프로젝트 루트 (tsconfig.json)


## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

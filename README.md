# World Break

TCG 전적 기록 모바일 PWA — 덱별 승률, 상성 분석, 대회 세션을 한 곳에서 관리합니다.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 15 App Router + TypeScript |
| Auth | Supabase Auth (Google OAuth) |
| DB / ORM | Supabase Postgres + Prisma 6 |
| UI | Tailwind CSS + Recharts |
| Hosting | Vercel |

## 빠른 시작

### 1. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`에 다음 값을 채워넣습니다:

| 변수 | 용도 |
|------|------|
| `DATABASE_URL` | Transaction Pooler (port 6543) — 앱 런타임 |
| `DIRECT_URL` | Direct Connection (port 5432) — Prisma 마이그레이션 전용 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 계정 삭제 등 admin 작업 (optional) |

Supabase 설정 상세는 [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)를 참고하세요.

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev   # http://localhost:3000
```

## 개발 명령어

```bash
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드 (배포 전 필수 확인)
npm run lint             # ESLint 검사

# Prisma
npm run prisma:generate  # Prisma Client 재생성
npm run prisma:migrate   # 스키마 변경 → 마이그레이션 생성 + 적용
npm run prisma:seed      # 개발용 시드 데이터 삽입
```

## 아키텍처

```
app/                     # Next.js App Router 페이지 + Server Actions
components/              # 재사용 UI 컴포넌트
lib/                     # auth, prisma, supabase, dashboard, validation
prisma/                  # schema.prisma + migrations
supabase/                # RLS 정책 SQL
```

**주요 패턴:**

- **인증** — `requireUser()` (`lib/auth.ts`)가 모든 서버 컴포넌트 상단에서 Supabase 세션 검증 + Prisma `users` upsert 동기화
- **데이터 변경** — 별도 API route 없이 `app/**/actions.ts` Server Actions로 처리, 변경 후 `revalidatePath()` + `redirect()`
- **데이터 스코핑** — 모든 DB 쿼리에 `userId` 조건 포함 (Supabase RLS + 앱 레이어 이중 보호)
- **대시보드 집계** — `lib/dashboard.ts`에서 Prisma `$queryRaw`로 직접 SQL 집계

**데이터 모델:**
```
User → Game → Deck → MatchResult
                   ↘ TournamentSession ← MatchResult
```

## 배포

Vercel + Supabase 조합으로 배포합니다. 상세 절차는 [DEPLOYMENT.md](./docs/DEPLOYMENT.md)를 참고하세요.

## 개발 협업 (Multi-CLI)

기능 개발은 파일 기반 핸드오프로 운영합니다.

- 티켓 현황: [`.ai/TASKS.md`](./.ai/TASKS.md)
- 협업 규칙: [`.ai/PROJECT_RULES.md`](./.ai/PROJECT_RULES.md)
- 리뷰 / 일일 로그 / 릴리스 문서: [`.ai/daily/`](./.ai/daily/)
- Spec / Result 문서: [`.ai/handoffs/`](./.ai/handoffs/)




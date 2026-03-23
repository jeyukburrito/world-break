Author: Gemini (Code Reviewer)

# STANDARDS.md — Technical Implementation Standards

본 문서는 World Break 프로젝트의 코드 작성 및 리뷰의 절대적인 기준을 정의한다. 모든 CLI 에이전트(Claude, Codex, Gemini)는 본 가이드를 준수하여 코드를 생성하고 검증해야 한다.

## 1. Documentation & Metadata

### 1-1. Mandatory Author Header
- 모든 `.md` 파일(특히 `.ai/` 폴더 내)은 반드시 첫 줄에 `Author: [Role/Name]` 형식을 포함해야 한다.
- 예: `Author: Codex (Implementer)`, `Author: Gemini (Code Reviewer)`

### 1-2. Session Logging
- 모든 작업 세션은 `.ai/daily/` 폴더에 `YYYY-MM-DD-{name}.md` 형식으로 기록한다.
- 세션 로그에는 변경 파일, 수행 내용, 검증 결과(lint/build), 리스크를 상세히 기술한다.

## 2. Backend & Data Layer (Next.js + Prisma)

### 2-1. Data Isolation (Strict Scoping)
- **requireUser()**: 모든 데이터 관련 Server Action 및 Server Component는 `lib/auth.ts`의 `requireUser()`를 통해 세션을 확인한다.
- **userId Scoping**: 모든 Prisma 쿼리(find, updateMany, deleteMany)는 반드시 `where: { userId: user.id }` 조건을 포함해야 한다. 
- 단일 `update` 또는 `delete` 대신 `updateMany`/`deleteMany`를 사용하여 권한 없는 접근을 원천 차단한다.

### 2-2. Server Action Workflow
- **Flow**: `Input Validation (Zod) -> Multi-model Transaction -> revalidatePath() -> redirect()`.
- **Atomic Transaction**: 2개 이상의 테이블을 수정하는 작업은 반드시 `prisma.$transaction`으로 묶어야 한다.
- **Error Handling**: 에러 발생 시 `redirect`를 통해 `?error=code` 파라미터를 전달하며, 성공 시 `?message=code`를 전달한다.

### 2-3. Validation (Zod)
- 모든 입력값 검증은 `lib/validation/` 내의 공통 스키마를 사용한다.
- ID는 `z.string().uuid()`, 날짜는 `YYYY-MM-DD` 포맷 정규식(`^\d{4}-\d{2}-\d{2}$`)을 엄격히 준수한다.

### 2-4. Performance & Caching
- **Raw SQL**: 복잡한 집계(대시보드 통계 등)는 Prisma ORM 대신 `prisma.$queryRaw`를 사용한다.
- **Caching**: 읽기 집약적인 데이터는 `unstable_cache`를 사용하고, 데이터 변경 시 관련 태그를 명시적으로 `revalidateTag` 처리한다.

## 3. Frontend & UI System (Tactical Editorial)

### 3-1. Design Tokens & Semantic Colors
- `tailwind.config.ts`에 정의된 Semantic Tokens만 사용한다.
  - `ink`: 기본 텍스트
  - `paper`: 페이지 배경
  - `surface`: 카드/컨테이너 배경
  - `accent`: 브랜드/포인트 색상
- 하드코딩된 Hex 값은 금지되며, 색상 투명도는 `bg-accent/10` 형식을 권장한다.

### 3-2. Layout & Components
- **AppShell**: 모든 페이지는 `components/app-shell.tsx`를 최상위 컨테이너로 사용하여 헤더와 네비게이션 일관성을 유지한다.
- **Radius**: 카드/섹션 컨테이너는 `rounded-[32px]`, 버튼 및 필터 칩은 `rounded-full`을 표준으로 한다.
- **Optimized Assets**: 외부 이미지(Google Avatar 등)는 `next/image`를 사용하고, `unoptimized` 속성을 적절히 활용한다.
- **Next/Dynamic**: Recharts와 같은 대형 클라이언트 컴포넌트는 `next/dynamic`으로 Lazy Loading 한다.

## 4. Code Quality & Linting
- **Lint First**: 모든 PRD/결과 제출 전 `npm run lint`를 통과해야 한다.
- **Build Verification**: 스키마 변경이 포함된 경우 `prisma generate` 후 `npm run build`를 통해 타입 안정성을 검증한다.

---
*최종 업데이트: 2026-03-22*

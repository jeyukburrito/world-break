Author: Claude (PM/QA)

# T-012 Spec — 게스트 모드 (비회원 체험 + 개발 편의)

## 목적

Supabase 계정 없이 앱을 사용할 수 있는 게스트 모드를 추가한다.

**해결하는 문제:**
1. **사용자**: 구글 로그인 없이 앱을 바로 체험하고 싶다
2. **개발자**: Supabase 환경변수 없이 로컬에서 앱을 실행하고 싶다

**설계 원칙:**
- 기존 Server Actions / Server Components 구조 유지 (localStorage 전환 없음)
- 게스트 유저도 Prisma `users` 테이블에 저장 → 기존 쿼리 무수정
- 게스트 세션은 서버가 읽을 수 있는 **쿠키**로 관리

---

## 아키텍처 개요

```
요청 도착
  └─ middleware.ts
       ├─ Supabase 세션 있음 → 기존 플로우
       └─ Supabase 세션 없음
            ├─ guest_token 쿠키 있음 → 게스트 플로우
            └─ guest_token 쿠키 없음 → /login으로 (게스트 옵션 포함)

requireUser() (lib/auth.ts)
  ├─ Supabase 유저 → Prisma users upsert (기존)
  └─ 게스트 토큰 → Prisma users에서 게스트 유저 조회/생성
```

---

## 1. Prisma 스키마 변경

`prisma/schema.prisma`의 `User` 모델에 필드 2개 추가:

```prisma
model User {
  id        String   @id @default(cuid())
  // ... 기존 필드 ...
  isGuest   Boolean  @default(false)
  guestToken String? @unique
}
```

마이그레이션 이름: `add_guest_mode`

---

## 2. `lib/auth.ts` — `requireUser()` 확장

### 2-1. 게스트 유저 생성/조회 헬퍼

```ts
// lib/guest.ts (신규)
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const GUEST_COOKIE = "wb_guest_token";
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일

export async function getOrCreateGuestUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE)?.value;

  if (token) {
    const user = await prisma.user.findUnique({ where: { guestToken: token } });
    if (user) return user;
  }

  // 새 게스트 유저 생성
  const newToken = randomUUID();
  const user = await prisma.user.create({
    data: {
      id: `guest_${newToken.replace(/-/g, "").slice(0, 16)}`,
      email: `guest_${newToken}@local.guest`,
      name: "게스트",
      isGuest: true,
      guestToken: newToken,
    },
  });

  return { user, newToken };
}
```

### 2-2. `requireUser()` 수정

```ts
// lib/auth.ts
export const requireUser = cache(async () => {
  // 1. Supabase 세션 시도
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (supabaseUser) {
    // 기존 플로우: Supabase → Prisma upsert
    return upsertSupabaseUser(supabaseUser);
  }

  // 2. 게스트 세션 시도
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_COOKIE)?.value;

  if (guestToken) {
    const guestUser = await prisma.user.findUnique({
      where: { guestToken },
    });
    if (guestUser) return guestUser;
  }

  // 3. 인증 없음 → 로그인 페이지로
  redirect("/login");
});
```

---

## 3. `middleware.ts` — 게스트 쿠키 처리

미들웨어에서 게스트 토큰이 있는 경우 Supabase 세션 갱신을 건너뛰고 통과:

```ts
// middleware.ts 수정
export async function middleware(request: NextRequest) {
  // 게스트 쿠키 있으면 미들웨어 통과 (Supabase 불필요)
  const guestToken = request.cookies.get(GUEST_COOKIE)?.value;
  if (guestToken) {
    return NextResponse.next();
  }

  // Supabase 환경변수 없으면 게스트 자동 생성 후 통과
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next(); // requireUser()에서 게스트 처리
  }

  // 기존 Supabase 세션 갱신 플로우
  return await updateSession(request);
}
```

---

## 4. `app/login/page.tsx` — 게스트 시작 버튼 추가

### 4-1. 게스트 시작 Server Action

```ts
// app/login/actions.ts에 추가
export async function startAsGuest() {
  const result = await getOrCreateGuestUser();
  const token = "newToken" in result ? result.newToken : result.guestToken!;

  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE, token, {
    maxAge: GUEST_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/matches/new");
}
```

### 4-2. 로그인 페이지 UI 변경

기존 "Google로 로그인" 버튼 아래에 구분선과 게스트 버튼 추가:

```tsx
{/* 구분선 */}
<div className="flex items-center gap-3">
  <div className="flex-1 border-t border-line" />
  <span className="text-xs text-muted">또는</span>
  <div className="flex-1 border-t border-line" />
</div>

{/* 게스트 버튼 */}
<form action={startAsGuest}>
  <button
    type="submit"
    className="w-full rounded-2xl border border-line bg-paper py-3 text-sm font-semibold text-muted transition-colors hover:bg-surface"
  >
    로그인 없이 체험하기
  </button>
</form>
```

### 4-3. Supabase 미설정 시 UI 처리

`NEXT_PUBLIC_SUPABASE_URL`이 없으면 Google 로그인 버튼을 숨기고 게스트 버튼만 표시:

```tsx
const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

{supabaseConfigured ? (
  <GoogleLoginButton />
) : (
  <p className="text-center text-xs text-muted">
    개발 모드 — Supabase 미설정
  </p>
)}
```

---

## 5. 게스트 배너 컴포넌트 (선택사항 — 구현 권장)

로그인된 게스트에게 상단 또는 설정 페이지에 배너 표시:

```tsx
// components/guest-banner.tsx
// isGuest가 true인 유저에게만 표시
export function GuestBanner() {
  return (
    <div className="bg-accent/10 px-4 py-2 text-center text-xs text-accent">
      게스트 모드 — 데이터는 이 기기에만 저장됩니다.{" "}
      <Link href="/login" className="font-bold underline">
        계정 연동
      </Link>
    </div>
  );
}
```

`app-shell.tsx`에서 `isGuest` prop으로 표시 여부 제어.

---

## 6. 개발 모드 가이드

`.env.local.example`에 게스트 모드 개발 방법 추가:

```bash
# 게스트 모드로 Supabase 없이 실행하려면:
# DATABASE_URL만 설정하고 Supabase 변수는 비워두세요.
# 앱이 자동으로 게스트 모드로 동작합니다.
DATABASE_URL="file:./dev.db"   # SQLite (개발용)
# NEXT_PUBLIC_SUPABASE_URL=   # 비워두면 게스트 전용 모드
```

SQLite 사용 시 Prisma 스키마 provider도 env var로 분기:

```prisma
datasource db {
  provider = env("DB_PROVIDER")  // "postgresql" or "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## 파일 변경 요약

| 파일 | 변경 내용 |
|------|----------|
| `prisma/schema.prisma` | `isGuest`, `guestToken` 필드 추가 |
| `prisma/migrations/` | `add_guest_mode` 마이그레이션 |
| `lib/guest.ts` | 신규 — 게스트 세션 헬퍼 |
| `lib/auth.ts` | `requireUser()` 게스트 분기 추가 |
| `middleware.ts` | 게스트 쿠키 통과 처리 |
| `app/login/page.tsx` | "로그인 없이 체험하기" 버튼 추가 |
| `app/login/actions.ts` | `startAsGuest()` 액션 추가 |
| `components/guest-banner.tsx` | 신규 — 게스트 배너 |
| `components/app-shell.tsx` | 게스트 배너 통합 |
| `.env.local.example` | SQLite 게스트 모드 가이드 추가 |

---

## 비기능 요건

- TypeScript 오류 0, ESLint 오류 0
- `npm run build` 통과
- 기존 Google OAuth 플로우 변경 없음
- 게스트 유저의 모든 기존 기능 동작 (매치 기록, 대시보드, 덱 관리)

---

## 범위 외 (Out of Scope)

- 게스트 → 실계정 데이터 마이그레이션 (계정 연동 시 데이터 이전)
- 게스트 데이터 자동 만료/삭제 cron
- 게스트 계정 간 데이터 공유
- SQLite ↔ Postgres 자동 전환 (개발자가 env var로 수동 설정)


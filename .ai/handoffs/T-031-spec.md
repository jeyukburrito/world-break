Author: Claude (PM)

# T-031 Spec — 대회 성적표 이미지 영구 보관

## 배경

대회(TournamentSession)가 종료된 후 결과를 PNG 이미지로 영구 보관하는 기능.
기존 Satori OG 인프라를 확장해 서버사이드 성적표 PNG를 생성, Supabase Storage에 저장.

설계 근거: `.gstack/projects/jeyukburrito-world-break/Yoo-main-design-20260331-220306.md` (APPROVED, 8.5/10)
테스트 플랜: `.gstack/projects/jeyukburisto-world-break/Yoo-main-test-plan-20260331-222432.md`

---

## 변경 파일 목록

### 신규 파일

| 파일 | 역할 |
|------|------|
| `components/tournament-scorecard-card.tsx` | Satori 성적표 컴포넌트 (500×700 세로형) |
| `lib/og/render-scorecard.ts` | `renderTournamentScorecard(session)` → Buffer |
| `app/api/og/tournament-scorecard/route.ts` | 외부/소셜 OG 라우트 (stub) |
| `app/matches/tournaments/[id]/result/page.tsx` | 대회 결과 요약 + 저장 버튼 페이지 |
| `app/matches/tournaments/[id]/result/actions.ts` | `saveTournamentScorecard` Server Action |

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `prisma/schema.prisma` | `TournamentSession`에 `scorecardUrl String?` 추가 |
| `prisma/migrations/YYYYMMDDHHMMSS_add_scorecard_url/migration.sql` | `ALTER TABLE tournament_sessions ADD COLUMN scorecard_url TEXT;` |
| `app/matches/tournaments/end/route.ts` | redirect 목적지 `/matches` → `/matches/tournaments/{sessionId}/result` |

---

## 상세 구현 명세

### 1. `prisma/schema.prisma`

`TournamentSession` 모델에 필드 추가:

```prisma
model TournamentSession {
  // 기존 필드들 그대로 유지...
  scorecardUrl  String?   // 신규 — Supabase Storage public URL

  @@map("tournament_sessions")
}
```

마이그레이션 SQL:
```sql
ALTER TABLE tournament_sessions ADD COLUMN scorecard_url TEXT;
```

---

### 2. `lib/og/render-scorecard.ts`

Server Action에서 직접 호출하는 렌더 유틸.
**중요: HTTP fetch 금지 — fs.promises.readFile로 폰트 로드 (Server Action에 request.url 없음)**

```typescript
import fs from "fs/promises";
import path from "path";

import { createElement } from "react";

import { ImageResponse } from "next/og";

import { TournamentScorecardCard, type ScorecardSession } from "@/components/tournament-scorecard-card";

async function loadScorecardFonts() {
  const [regular, bold] = await Promise.all([
    fs.readFile(path.join(process.cwd(), "public/fonts/NotoSansKR-Regular.woff2")),
    fs.readFile(path.join(process.cwd(), "public/fonts/NotoSansKR-Bold.woff2")),
  ]);
  return [
    { name: "Noto Sans KR", data: regular.buffer as ArrayBuffer, style: "normal" as const, weight: 400 as const },
    { name: "Noto Sans KR", data: bold.buffer as ArrayBuffer, style: "normal" as const, weight: 700 as const },
  ];
}

export async function renderTournamentScorecard(session: ScorecardSession): Promise<Buffer> {
  const fonts = await loadScorecardFonts();
  const response = new ImageResponse(
    createElement(TournamentScorecardCard, { session }),
    { width: 500, height: 700, fonts }
  );
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

---

### 3. `components/tournament-scorecard-card.tsx`

500×700 세로형 Satori 컴포넌트. **Tailwind CSS 사용 금지 — 모든 스타일은 inline style 객체.**

```typescript
export type ScorecardSession = {
  name: string | null;
  playedOn: Date;
  myDeck: { name: string; game: { name: string } };
  matches: Array<{
    opponentDeckName: string | null;
    wins: number;
    losses: number;
    isMatchWin: boolean;
  }>;
};
```

레이아웃 (디자인 스펙):
```
┌─────────────────────────────┐
│  WORLD BREAK                │  ← 브랜드 마크 (기존 StormMark 패턴 참고)
│                             │
│  [덱 이름]                  │  ← 큰 글씨, fontWeight: 800
│  [게임] · [날짜]            │  ← 서브텍스트 color: "#9899b8"
│                             │
│  ┌─────────────────────┐   │
│  │ ROUND 1  vs [상대덱] │   │  ← 라운드별 블록
│  │ ● ● ○           WIN │   │    최대 8라운드 표시
│  ├─────────────────────┤   │    8 초과 시 "외 N라운드" 축약
│  │ ROUND 2  vs [상대덱] │   │
│  │ ○ ●             LOSS│   │
│  └─────────────────────┘   │
│                             │
│  ┌──────────────────────┐  │
│  │  3승 1패  승률 75%   │  │  ← 최종 성적 요약
│  └──────────────────────┘  │
└─────────────────────────────┘
```

디자인 토큰 (기존 OG 카드와 일치):
- 배경: `#12131d`
- 카드 배경: `rgba(26, 27, 38, 0.94)`
- 보더: `rgba(90, 91, 122, 0.3)`
- 텍스트: `#e4e5f0`
- 서브텍스트: `#9899b8`
- WIN 색: `#30d158`
- LOSS 색: `#ff6b6b`

날짜 포맷: `playedOn.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })`

라운드 게임 점수 표시: wins개 ● + losses개 ○ (예: "● ● ○")

`opponentDeckName`이 null인 경우: `"상대 덱 미입력"` (color: "#9899b8")

**8라운드 초과 처리:**
```
표시되는 8라운드 + "외 N라운드" 요약 행
```

승률 계산:
```typescript
const totalMatches = matches.length;
const wins = matches.filter(m => m.isMatchWin).length;
const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
```

---

### 4. `app/api/og/tournament-scorecard/route.ts`

외부/소셜 크롤러 전용 stub. 이번 티켓에서는 placeholder만 구현.

```typescript
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#12131d", color: "#e4e5f0", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
      World Break
    </div>,
    { width: 500, height: 700 }
  );
}
```

---

### 5. `app/matches/tournaments/[id]/result/actions.ts`

```typescript
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";  // 기존 패턴 사용
import { renderTournamentScorecard } from "@/lib/og/render-scorecard";

export async function saveTournamentScorecard(sessionId: string): Promise<{ scorecardUrl: string }> {
  const user = await requireUser();  // 미인증 시 throw

  // 본인 세션만 접근 가능 (userId 검증 필수)
  const session = await prisma.tournamentSession.findUnique({
    where: { id: sessionId, userId: user.id },
    include: {
      myDeck: { include: { game: true } },
      matches: { orderBy: { playedAt: "asc" } },
    },
  });

  if (!session) {
    throw new Error("대회를 찾을 수 없습니다");
  }

  // PNG 생성
  const pngBuffer = await renderTournamentScorecard({
    name: session.name,
    playedOn: session.playedOn,
    myDeck: { name: session.myDeck.name, game: { name: session.myDeck.game.name } },
    matches: session.matches.map((m) => ({
      opponentDeckName: m.opponentDeckName,
      wins: m.wins,
      losses: m.losses,
      isMatchWin: m.isMatchWin,
    })),
  });

  // Supabase Storage 업로드
  const supabase = createAdminClient();
  const filePath = `${user.id}/${sessionId}.png`;

  const { error: uploadError } = await supabase.storage
    .from("tournament-scorecards")
    .upload(filePath, pngBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    throw new Error("이미지 저장에 실패했습니다");
  }

  const { data: { publicUrl } } = supabase.storage
    .from("tournament-scorecards")
    .getPublicUrl(filePath);

  // DB 업데이트
  await prisma.tournamentSession.update({
    where: { id: sessionId, userId: user.id },
    data: { scorecardUrl: publicUrl },
  });

  return { scorecardUrl: publicUrl };
}
```

**`requireUser()` 패턴 확인 필요:**
기존 코드베이스에서 `requireUser()` 또는 동등한 패턴을 찾아서 사용.
없으면 직접 구현:
```typescript
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");
  return user;
}
```

**MatchResult 모델 필드 확인:**
`session.matches`의 필드명은 Prisma 스키마에서 확인 후 사용.
예상 필드: `opponentDeckName`, `wins`, `losses`, `isMatchWin`, `playedAt`
실제 스키마 확인 필수: `prisma/schema.prisma`의 `MatchResult` 모델

---

### 6. `app/matches/tournaments/[id]/result/page.tsx`

서버 컴포넌트. 인증 유저/게스트 분기.

```typescript
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SaveScorecardButton } from "./save-scorecard-button";  // Client Component

interface Props {
  params: Promise<{ id: string }>;
}

async function resolveUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export default async function TournamentResultPage({ params }: Props) {
  const { id: sessionId } = await params;
  const userId = await resolveUserId();

  // 인증 유저: 본인 세션 조회
  // 게스트: userId가 null이지만 게스트 세션 조회 필요
  // → 기존 end/route.ts의 resolveUserId 패턴 참고해서 게스트 지원

  const session = await prisma.tournamentSession.findFirst({
    where: userId ? { id: sessionId, userId } : { id: sessionId },
    include: {
      myDeck: { include: { game: true } },
      matches: { orderBy: { playedAt: "asc" } },
    },
  });

  if (!session) notFound();

  const totalMatches = session.matches.length;
  const wins = session.matches.filter((m) => m.isMatchWin).length;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const isAuthUser = !!userId;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{session.myDeck.game.name}</p>
          <h1 className="mt-1 text-2xl font-bold">{session.name ?? session.eventCategory}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.playedOn.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* 덱 */}
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">사용한 덱</p>
          <p className="mt-1 text-xl font-bold">{session.myDeck.name}</p>
        </div>

        {/* 성적 요약 */}
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold">
            <span className="text-success">{wins}승</span>
            {" "}
            <span className="text-danger">{losses}패</span>
          </p>
          <p className="mt-1 text-muted-foreground">승률 {winRate}% · {totalMatches}라운드</p>
        </div>

        {/* 라운드 목록 */}
        <div className="space-y-2">
          {session.matches.map((match, i) => (
            <div key={match.id} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">ROUND {i + 1}</p>
                <p className="font-medium">{match.opponentDeckName ?? "상대 덱 미입력"}</p>
              </div>
              <span className={`text-sm font-bold ${match.isMatchWin ? "text-success" : "text-danger"}`}>
                {match.isMatchWin ? "WIN" : "LOSS"}
              </span>
            </div>
          ))}
        </div>

        {/* 성적표 저장 버튼 — 인증 유저만 */}
        {isAuthUser && (
          <SaveScorecardButton
            sessionId={sessionId}
            existingUrl={session.scorecardUrl ?? null}
          />
        )}

        {/* 홈으로 */}
        <Link href="/matches" className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
```

**`SaveScorecardButton` — Client Component (같은 디렉토리에 분리)**
`app/matches/tournaments/[id]/result/save-scorecard-button.tsx`:

```typescript
"use client";

import { useState } from "react";
import { saveTournamentScorecard } from "./actions";

interface Props {
  sessionId: string;
  existingUrl: string | null;
}

export function SaveScorecardButton({ sessionId, existingUrl }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(existingUrl);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsPending(true);
    setError(null);
    try {
      const { scorecardUrl } = await saveTournamentScorecard(sessionId);
      setSavedUrl(scorecardUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다");
    } finally {
      setIsPending(false);
    }
  }

  if (savedUrl) {
    return (
      <div className="space-y-2">
        <p className="text-center text-sm text-success">성적표가 저장되었습니다</p>
        <div className="flex gap-2">
          <a
            href={savedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl border bg-card px-4 py-3 text-center text-sm font-medium hover:bg-accent"
          >
            PNG 다운로드
          </a>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl border px-4 py-3 text-sm text-muted-foreground hover:bg-accent disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "재저장"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-center text-sm text-danger">{error}</p>}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "성적표 저장 중..." : "성적표 저장"}
      </button>
    </div>
  );
}
```

---

### 7. `app/matches/tournaments/end/route.ts` 수정

`POST` 핸들러 마지막 부분의 redirect 목적지만 변경.

**변경 전:**
```typescript
const redirectUrl = new URL("/matches", request.url);
redirectUrl.searchParams.set("message", "tournament_ended");
redirectUrl.searchParams.set("ep", ep);

return NextResponse.redirect(redirectUrl, 303);
```

**변경 후:**
```typescript
return NextResponse.redirect(
  new URL(`/matches/tournaments/${tournamentSessionId}/result`, request.url),
  303
);
```

GA4 `ep` 파라미터 및 `message` 파라미터는 제거 (result 페이지에서 불필요).
`encodeJsonBase64Url` import 및 `ep` 계산 코드도 제거.

---

## 제약 사항

- **npm 패키지 추가 금지** — html2canvas, canvas 등 신규 패키지 도입 금지. 기존 `next/og` Satori 인프라만 사용.
- **Tailwind CSS 금지** (Satori 컴포넌트) — `components/tournament-scorecard-card.tsx`는 모든 스타일을 inline style 객체로 작성. className 사용 금지.
- **HTTP fetch 금지** (font 로딩) — `lib/og/render-scorecard.ts`에서 폰트 로딩은 `fs.promises.readFile`만 사용.
- **Supabase Storage 버킷** — 버킷 `tournament-scorecards`는 사전에 Supabase 대시보드에서 생성해야 함. 코드에서 버킷 생성 금지.
- **게스트 저장 불가** — `saveTournamentScorecard` Server Action은 인증 유저만 허용. 게스트에게 저장 버튼 미표시 (UI 레벨) + requireUser() (서버 레벨) 이중 차단.

---

## 완료 기준 (Done Definition)

- [ ] `npm run build` 오류 없음
- [ ] Prisma 스키마 변경 + 마이그레이션 파일 생성
- [ ] `renderTournamentScorecard()` 함수 구현 (filesystem 폰트 로딩)
- [ ] `TournamentScorecardCard` Satori 컴포넌트 구현 (500×700, 라운드별 데이터 포함)
- [ ] `saveTournamentScorecard` Server Action 구현 (requireUser + Storage upload + DB update)
- [ ] `/matches/tournaments/[id]/result` 페이지 구현 (결과 요약 + 조건부 저장 버튼)
- [ ] `end/route.ts` redirect 목적지 변경
- [ ] OG stub route 생성

---

## 참고 파일

구현 시 반드시 읽어야 할 파일:
- `prisma/schema.prisma` — TournamentSession, MatchResult 모델 확인
- `lib/supabase/admin.ts` — `createAdminClient()` 사용법
- `lib/share/og-font.ts` — 기존 폰트 로딩 패턴 (HTTP 버전 — 파일시스템으로 교체)
- `components/tournament-share-og-card.tsx` — Satori 컴포넌트 스타일 패턴
- `app/api/og/tournament/route.ts` — OG route 패턴
- `app/matches/tournaments/end/route.ts` — 수정 대상 파일 전체
- `middleware.ts` — PUBLIC_PATHS 확인 (result 페이지 접근 허용 여부)

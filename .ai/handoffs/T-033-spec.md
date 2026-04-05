# T-033 Spec: PC/태블릿 Adaptive Shell UI

**작성:** Claude (PM)  
**상태:** ready (T-032 완료 후 진행)  
**브랜치:** feat/T-033-adaptive-shell (T-032 머지 후 main에서)

---

## 배경

앱이 모바일 PWA로 설계되어 `max-w-md`(448px) 하드코딩. PC/태블릿에서 열면 콘텐츠가 왼쪽에 붙어 나쁜 경험. `md:` breakpoint(768px) 이상에서 사이드바 내비게이션 + 넓어진 콘텐츠 영역으로 전환.

---

## 레이아웃 명세

### 모바일 (< 768px) — 현재와 동일

```
┌─────────────────────┐
│  TopAppBar (sticky) │  ← 유지
├─────────────────────┤
│                     │
│  Content (max-w-md) │
│                     │
├─────────────────────┤
│  BottomNav (fixed)  │  ← 유지
└─────────────────────┘
```

### 데스크톱/태블릿 (≥ 768px) — 신규

```
┌────────────────────────────────────────────┐
│  SideNav (fixed, w-56)  │  Content         │
│  bg-surface-container-low│  ml-56           │
│                          │  max-w-3xl       │
│  WORLD BREAK [로고]      │  px-8 py-6       │
│                          │                  │
│  ● 대시보드              │  [페이지 콘텐츠]  │
│  ○ 기록                  │                  │
│                          │                  │
│  ┌──────────────────┐   │                  │
│  │  + 새 매치 입력   │   │                  │
│  └──────────────────┘   │                  │
│                          │                  │
│  ○ 설정  [하단 고정]     │                  │
└────────────────────────────────────────────┘
```

---

## 구현 명세

### 1. 신규: `components/side-nav.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/lib/navigation";

export function SideNav() {
  // 기존 BottomNav의 isActive 로직 동일하게 재사용
  // ...
}
```

**SideNav 구조:**
- 최상단: `WORLD BREAK` 브랜드 텍스트 (`text-[10px] font-black uppercase tracking-[0.32em] text-primary`)
- 내비게이션 항목:
  - `/dashboard` → 대시보드 (dashboard 아이콘)
  - `/matches` → 기록 (history 아이콘)
  - `/settings` → 설정 (settings 아이콘, `mt-auto`로 하단 고정)
- "새 매치 입력" 버튼 (`/matches/new`):
  - 일반 nav item이 아닌 **filled 버튼**으로 강조
  - 스타일: `w-full rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-white`
  - `+ 새 매치 입력` 텍스트
- Active 상태: `bg-indigo-950/50 text-primary rounded-xl` (다크모드 기준)
- 아이콘: `material-symbols-outlined text-[20px]` (기존 BottomNav와 동일)
- 접근성: `<nav aria-label="사이드 내비게이션">`

**SideNav 크기:**
- `w-56` (224px) fixed
- 높이: `min-h-dvh` 전체
- padding: `px-3 py-6`
- `flex flex-col gap-1`

### 2. 수정: `components/app-shell.tsx`

**변경 전:**
```tsx
export async function AppShell({ title, headerRight, children }) {
  return (
    <div className="min-h-dvh bg-paper text-on-surface">
      <TopAppBar title={title} right={headerRight} />
      <main className="mx-auto w-full max-w-md px-4 py-5 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
```

**변경 후:**
```tsx
export async function AppShell({ title, headerRight, children }) {
  return (
    <div className="min-h-dvh bg-paper text-on-surface md:flex">
      {/* 데스크톱: SideNav */}
      <SideNav />

      {/* 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col">
        {/* 모바일 전용 TopAppBar */}
        <TopAppBar title={title} right={headerRight} />

        <main className="mx-auto w-full max-w-md px-4 py-5 pb-28 md:max-w-3xl md:px-8 md:pb-6">
          {children}
        </main>

        {/* 모바일 전용 BottomNav */}
        <BottomNav />
      </div>
    </div>
  );
}
```

### 3. 수정: `components/side-nav.tsx` (신규이므로 위와 동일)

### 4. 수정: `components/top-app-bar.tsx`

현재: className 없음 → className prop 추가 후 `md:hidden` 적용.

```tsx
type TopAppBarProps = {
  title?: string;
  right?: ReactNode;
  className?: string;  // 추가
};

export function TopAppBar({ right, className }: TopAppBarProps) {
  return (
    <header className={`sticky top-0 z-50 bg-surface/70 shadow-soft backdrop-blur-xl md:hidden ${className ?? ""}`}>
      ...
    </header>
  );
}
```

또는 className prop 없이 직접 `md:hidden` 추가:
```tsx
<header className="sticky top-0 z-50 bg-surface/70 shadow-soft backdrop-blur-xl md:hidden">
```

### 5. 수정: `components/bottom-nav.tsx`

현재 `<nav className="fixed inset-x-0 bottom-0 z-50 h-20 ...">` → `md:hidden` 추가:

```tsx
<nav className="fixed inset-x-0 bottom-0 z-50 h-20 bg-surface/80 backdrop-blur-xl md:hidden">
```

내부 `<div className="mx-auto grid h-full max-w-md ...">` → `max-w-md` 유지 (mobile only이므로 OK).

### 6. SideNav import 추가

`components/app-shell.tsx`에 `SideNav` import 추가:
```tsx
import { SideNav } from "@/components/side-nav";
```

---

## Tailwind 클래스 참조

기존 토큰 사용 (변경 없음):
- `bg-surface-container-low` = `#1a1b26`
- `bg-paper` = `#12131d`
- `text-primary` = indigo
- `text-on-surface-variant` = muted text
- `material-symbols-outlined` 아이콘

---

## 주의사항

- `SideNav`는 Client Component (`"use client"`) — `usePathname` 사용
- `AppShell`은 현재 `async function` (Server Component) — SideNav import 문제 없음
- `BottomNav`도 Client Component — 이미 `"use client"`
- `md:flex`는 AppShell 최상단 div에만 — 하위 flex 구조 주의
- content의 `pb-28`은 mobile BottomNav 공간. desktop에서 `md:pb-6`으로 오버라이드.

---

## 검증

```bash
npm run build   # 타입 에러 없이 통과
npm run lint
```

검증 포인트:
- 768px 미만: 기존 TopAppBar + BottomNav 표시, SideNav 없음
- 768px 이상: SideNav 표시, TopAppBar/BottomNav 없음
- 모든 4개 페이지(dashboard, matches, settings, matches/new) 정상 동작
- SideNav active state — 현재 페이지 강조
- "새 매치 입력" 버튼 클릭 → `/matches/new` 이동

---

## 완료 조건 체크리스트

- [ ] `components/side-nav.tsx` 신규 생성 (SideNav 컴포넌트)
- [ ] `components/app-shell.tsx` 반응형 레이아웃으로 수정
- [ ] `components/top-app-bar.tsx` `md:hidden` 추가
- [ ] `components/bottom-nav.tsx` `md:hidden` 추가
- [ ] `npm run build` 통과
- [ ] `npm run lint` 통과

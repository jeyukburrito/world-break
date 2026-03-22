Author: Claude (PM/QA)

# T-011 Spec — PWA start_url 수정 + UI 중복 제목 제거

## 목적

두 가지 독립적인 버그를 수정한다:
1. `manifest.json`의 `start_url`이 실제 앱 진입점과 불일치 → PWA 설치 안정성 저하
2. `TopAppBar`가 이미 페이지 제목을 표시하는데, 각 페이지 본문에 동일 제목 `<h2>`가 중복 렌더링됨

---

## 1. `manifest.json` — `start_url` 수정

**파일:** `public/manifest.json`

**현재:**
```json
"start_url": "/"
```

**변경 후:**
```json
"start_url": "/matches/new"
```

**이유:** 루트 `/`는 즉시 `/matches/new`로 redirect한다. 브라우저는 `start_url`이 실제로 열리지 않는다고 인식할 수 있어 PWA installability 판정에 부정적 영향을 준다.

---

## 2. `app/dashboard/page.tsx` — 중복 제목 섹션 제거

**현재:** `AppShell title="대시보드"` + 본문에 아래 섹션 존재

```tsx
{/* 컴팩트 헤더: 라벨 + 제목 + 기간 필터 인라인 배치 */}
<section className="mb-5 flex items-end justify-between gap-4">
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Overview</p>
    <h2 className="text-2xl font-bold tracking-tight text-ink">대시보드</h2>
  </div>
  <Suspense fallback={null}>
    <PeriodFilter activePeriod={period} defaultFrom={from} defaultTo={to} />
  </Suspense>
</section>
```

**변경 후:** 제목 `<div>` 제거, `PeriodFilter`는 `AppShell`의 `headerRight`로 이동

`headerRight`에 `HeaderActions`와 `PeriodFilter`를 함께 배치:

```tsx
// DashboardPage 반환부
<AppShell
  title="대시보드"
  headerRight={
    <div className="flex items-center gap-2">
      <Suspense fallback={null}>
        <PeriodFilter activePeriod={period} defaultFrom={from} defaultTo={to} />
      </Suspense>
      <HeaderActions avatarUrl={display.avatarUrl} name={display.name} />
    </div>
  }
>
  {/* 카테고리 필터: 카드 없이 pill 행만 */}
  <div className="mb-5">
    ...
  </div>
  ...
</AppShell>
```

**결과 레이아웃:**
```
┌──────────────────────────────────────────────┐
│ ⚡ World Break      [기간 필터 ▾] [avatar]   │  ← sticky TopAppBar
│ 대시보드                                      │
└──────────────────────────────────────────────┘
│ [카테고리 칩들...]                             │
│ [차트...]                                      │
```

PeriodFilter가 TopAppBar와 시각적으로 연결되어 "전역 맥락 필터"임이 명확해짐.

---

## 3. `app/matches/page.tsx` — 중복 제목 `<h2>` 제거

**현재:**
```tsx
<section className="mb-5 flex items-center justify-between">
  <h2 className="text-2xl font-bold tracking-tight text-ink">기록 목록</h2>
  <div className="flex items-center gap-2">
    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
      {formatNumber(totalCount)} 경기
    </span>
    <Link href="/matches/new" ...>새 기록</Link>
  </div>
</section>
```

**변경 후:** `<h2>` 제거, 카운트 배지 + "새 기록" 버튼은 유지

```tsx
<div className="mb-5 flex items-center justify-end gap-2">
  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
    {formatNumber(totalCount)} 경기
  </span>
  <Link
    href="/matches/new"
    className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink"
  >
    새 기록
  </Link>
</div>
```

---

## 4. `app/settings/page.tsx` — 중복 제목 섹션 제거

**현재:**
```tsx
<section>
  <h2 className="text-2xl font-bold tracking-tight text-ink">설정</h2>
</section>
```

**변경 후:** 해당 `<section>` 블록 전체 제거

---

## 파일 변경 요약

| 파일 | 변경 내용 |
|------|----------|
| `public/manifest.json` | `start_url` → `"/matches/new"` |
| `app/dashboard/page.tsx` | 본문 제목 섹션 제거, PeriodFilter 단독 배치 |
| `app/matches/page.tsx` | `<h2>기록 목록</h2>` 제거, 카운트+버튼 유지 |
| `app/settings/page.tsx` | 중복 제목 `<section>` 제거 |

---

## 접근성 (Accessibility)

### Heading 계층 변경 영향

제거 전: `h1` (TopAppBar) → `h2` (페이지 제목) → `h2` (카드 내부)
제거 후: `h1` (TopAppBar) → `h2` (카드 내부) — 스킵 없이 연속적

h2 제거는 heading 계층을 **개선**합니다. 기존 구조에서 동일 레벨(h2)이 두 개 연속으로 같은 텍스트를 표시하는 것이 더 문제였음.

matches/page.tsx 내 카드의 `h2` (`{match.myDeck.name} vs {match.opponentDeckName}`)는 유지 — 이것은 실제 콘텐츠 제목이므로 제거 대상이 아님.

---

## 디자인 시스템 참고

- DESIGN.md 없음 — `/design-consultation` 실행 권장 (별도 티켓)
- TopAppBar `h1`: `text-lg font-black` — 이것이 제거 후 페이지 내 최상위 제목이 됨
- 제거되는 인페이지 h2들: `text-2xl font-bold` — TopAppBar h1보다 컸으므로 시각적 계층이 반전되지 않도록 주의. TopAppBar title이 충분한 앵커 역할을 함 (sticky이기 때문)

---

## 비기능 요건

- TypeScript 오류 0, ESLint 오류 0
- `npm run build` 통과
- 기존 기능 변경 없음
- DB 마이그레이션 없음
- 외부 라이브러리 추가 없음

---

## 범위 외 (Out of Scope)

- `matches/new`, `matches/[id]/edit` 등 다른 페이지 제목 변경
- TopAppBar 디자인 변경
- iOS/Android PWA 설치 프로세스 안내 UI


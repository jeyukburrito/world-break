Author: Claude (PM)

# T-015 — UI 마이크로카피 & 정보 설계 정비

## 배경

세부 UX 품질 개선. 중복 정보, 불필요한 텍스트, 비일관적 날짜 표기를 정리한다.

## 변경사항

### 1. 날짜 표기 — 절대 날짜로 전환

**파일:** `lib/format-date.ts`

`formatRelativeDate()` 함수를 절대 날짜 포맷으로 변경한다.

- "오늘", "어제", "n일 전" 상대 표현 전부 제거
- 올해: `3월 20일` (월·일만)
- 작년 이전: `2025.12.15` (년.월.일)

함수명은 `formatDate()`로 변경하고, 기존 `formatRelativeDate` import를 사용하는 모든 파일 업데이트.

**사용처:** `app/matches/page.tsx` (SingleMatchCard, TournamentMatchCard 내부)

### 2. 기록 목록 헤더 정리

**파일:** `app/matches/page.tsx`

상단의 중복 헤더 제거:
```
현재:
  [{totalCount} 경기] [새 기록]     ← 이 줄 전체 삭제
  총 {totalCount}경기    1/1 페이지  ← 이 줄만 유지
```

- 254-264행의 `div.mb-5` 블록 전체 삭제
- 경기 수는 267행 `총 {totalCount}경기`에서 이미 표시 중
- 새 기록 버튼은 하단 네비게이션 (+) 아이콘으로 접근 가능

### 3. 입력 페이지 중복 라벨 제거

**파일:** `app/matches/new/page.tsx`

폼 상단의 "New Record" + "결과 입력" 섹션 전체 제거:
```
현재:
  New Record          ← 영문 소문자 라벨 (123-125행)
  결과 입력            ← 한글 제목 (127행)
```

- 123-128행의 `<section>` 블록 전체 삭제
- AppShell title이 이미 "경기 입력"으로 설정되어 있으므로 중복

### 4. 대시보드 스탯 카드 차별화

**파일:** `components/dashboard-charts.tsx`

두 StatCard의 정보 중복 제거:

**현재:**
- Card1: 승률 `88%` / subtext "7승 포함"
- Card2: 총 전적 `8` / subtext "7승 · 1패"

**변경 후:**
- Card1 (승률): value `88%` / subtext 제거 (퍼센트만으로 충분)
- Card2 (전적): value `7승 1패` / subtext `총 8경기`

구체적 변경:
```typescript
// Card1 — 승률
<StatCard
  label="승률"
  value={`${winRate}%`}
  subtext={undefined}
/>

// Card2 — 전적
<StatCard
  label="전적"
  value={totalMatches > 0 ? `${formatNumber(totalWins)}승 ${formatNumber(totalMatches - totalWins)}패` : "0승 0패"}
  subtext={totalMatches > 0 ? `총 ${formatNumber(totalMatches)}경기` : "기록 없음"}
/>
```

## Done Definition

- [ ] `formatRelativeDate()` → `formatDate()` 변경, 절대 날짜 표시 (올해 "M월 D일", 작년 이전 "YYYY.M.D")
- [ ] 모든 import/사용처에서 함수명 업데이트
- [ ] 기록 목록 상단 `[N 경기] [새 기록]` 줄 삭제
- [ ] 입력 페이지 "New Record" / "결과 입력" 섹션 삭제
- [ ] 대시보드 Card1: 승률 % only (subtext 없음), Card2: "N승 M패" + "총 N경기"
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과 (또는 환경 제약 시 lint로 대체, 사유 기록)

## 영향 범위

| 파일 | 변경 유형 |
|------|-----------|
| `lib/format-date.ts` | 함수 교체 |
| `app/matches/page.tsx` | 헤더 블록 삭제, import 변경 |
| `app/matches/new/page.tsx` | 섹션 삭제 |
| `components/dashboard-charts.tsx` | StatCard props 변경 |

4개 파일, 모두 삭제 또는 축소 방향. 신규 코드 최소.

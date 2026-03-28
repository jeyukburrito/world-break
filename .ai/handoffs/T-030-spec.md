Author: Claude (PM)

# T-030 Spec — 기록 카드 승/패 시각화 강화

## 배경

기록 탭의 매치 카드에서 승리/패배 구분이 시각적으로 약함:
- 승리/패배 배지(pill)가 `text-xs`로 작고, 배경 opacity 10%로 희미함
- 카드 전체 배경이 승리/패배 무관하게 동일하여 한눈에 구분이 어려움

## 변경 범위: `app/matches/page.tsx`

### 1. MatchStatusPill — 크기 + 색상 강화

```tsx
// 변경 전
<span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
  isWin ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
}`}>

// 변경 후
<span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
  isWin ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
}`}>
```

변경 요소:
- `text-xs` → `text-sm` (폰트 크기 확대)
- `px-3 py-1` → `px-4 py-1.5` (패딩 소폭 확대)
- `bg-success/10` → `bg-success/20` (배경 opacity 2배)
- `bg-danger/10` → `bg-danger/20` (배경 opacity 2배)

### 2. SingleMatchCard — 카드 배경 조건부 tint

```tsx
// 변경 전
<article className="rounded-[32px] bg-surface-container-low p-5 shadow-sm">

// 변경 후
<article className={`rounded-[32px] p-5 shadow-sm ${
  match.isMatchWin
    ? "bg-success/[0.07] ring-1 ring-success/20"
    : "bg-danger/[0.04] ring-1 ring-danger/15"
}`}>
```

승리: 미세한 초록 tint + 얇은 초록 테두리
패배: 미세한 빨간 tint + 얇은 빨간 테두리

> 강도는 구현 중 시각적으로 조정 가능. 핵심 원칙: 이전 경기를 스크롤할 때 승/패 패턴이
> 색상만으로 즉시 인식되어야 함. bg opacity는 5~10% 범위에서 조정.

### 3. TournamentMatchCard 내 라운드 행 — 색상 강화

현재: `match.isMatchWin ? "bg-success/5" : "bg-paper"` (패배는 배경 없음)

변경:
```tsx
className={`rounded-[24px] px-4 py-4 ${
  match.isMatchWin
    ? "bg-success/[0.07] ring-1 ring-success/20"
    : "bg-danger/[0.04] ring-1 ring-danger/15"
}`}
```

패배도 명시적인 빨간 tint로 표시 (현재는 중립 배경).

## 범위 밖

- 대회 카드(TournamentMatchCard) 외부 컨테이너 배경 변경 없음
- 승률 수치/통계 표시 추가 없음
- 다크모드 대응 (Tailwind opacity 방식이므로 자동 처리됨)

## 검증

- 승리 카드와 패배 카드가 색상만으로 즉시 구분 가능한지 육안 확인
- 승리/패배 배지 크기 적절성 확인
- 대회 카드 내 라운드 행 구분 확인
- `npm run build` 통과

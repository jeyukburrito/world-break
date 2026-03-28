Author: Claude (PM)

# T-029 Spec — 선후공 선택 주체 용어 개선 + 기록 표시 수정

## 배경

두 가지 문제:

1. **용어 비직관성**: `MatchDetailControls`의 "결정 방식" 레이블과 "자신" / "상대" 옵션이 의미 전달 불명확.
   "내가 선후공 순서를 선택했나 vs 상대가 선택했나"를 표현하려는데 "결정 방식"은 방법(coin flip vs 주사위 등)으로 오해 가능.

2. **기록 표시 버그**: `matches/page.tsx`에서 `didChoosePlayOrder = false` (상대가 선택)일 때 아무것도 표시 안 됨.
   현재: `"선공(선택)"` (내가 선택) 또는 `"선공"` (상대 선택 — 아무 표시 없음)
   원하는: 양쪽 케이스 모두 명시적으로 표시.

## 변경 1: `components/match-detail-controls.tsx`

### 레이블 변경

```
변경 전: "결정 방식"
변경 후: "선택 주체"
```

### 옵션 변경

```ts
const DECISION_OPTIONS = [
  { value: "true",  label: "내가 선택" },   // 기존 "자신"
  { value: "false", label: "상대 선택" },   // 기존 "상대"
] as const;
```

## 변경 2: `app/matches/page.tsx`

### playOrder 표시 헬퍼 추가

파일 상단 (또는 SingleMatchCard/TournamentMatchCard 위):

```ts
function formatPlayOrderLabel(playOrder: string, didChoosePlayOrder: boolean): string {
  const order = playOrder === "first" ? "선공" : "후공";
  const chooser = didChoosePlayOrder ? " · 내가 선택" : " · 상대 선택";
  return order + chooser;
}
```

### SingleMatchCard 적용 (현재 line ~94)

```tsx
// 변경 전
{match.playOrder === "first" ? "선공" : "후공"}{match.didChoosePlayOrder ? "(선택)" : ""}

// 변경 후
{formatPlayOrderLabel(match.playOrder, match.didChoosePlayOrder)}
```

### TournamentMatchCard 내 라운드 행 적용 (현재 line ~227)

동일하게 `formatPlayOrderLabel` 적용.

## 변경 3: `app/matches/[id]/edit/page.tsx`

`MatchDetailControls`는 props를 그대로 받으므로 별도 수정 불필요.
(레이블/옵션은 컴포넌트 내부에서 변경됨)

## 표시 결과 예시

```
변경 전:
  "선공(선택)"   ← 내가 선택했을 때
  "선공"         ← 상대가 선택했을 때 (아무 표시 없음)

변경 후:
  "선공 · 내가 선택"
  "선공 · 상대 선택"
```

## 검증

- 경기 입력 폼에서 레이블이 "선택 주체"로 표시되는지 확인
- "내가 선택" / "상대 선택" 옵션 선택 후 저장
- 기록 페이지에서 양쪽 케이스 모두 올바른 텍스트 표시 확인
- `npm run build` 통과

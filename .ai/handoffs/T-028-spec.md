Author: Claude (PM)

# T-028 Spec — BO3 게임별 선후공 시퀀스 기록

## 배경

BO3 매치에서 TCG 플레이어들은 "선후선", "후후", "선선후" 처럼 게임별 선후공 패턴을 기록하고 싶어 함.
현재는 매치 전체의 단일 `playOrder` (선공/후공)만 저장되어 실제 패턴 추적 불가.

## DB 스키마 변경

### `prisma/schema.prisma`

`MatchResult` 모델에 nullable 필드 추가:

```prisma
bo3PlaySequence  String?   // BO3 전용: "FF", "FS", "SF", "SS" (2게임) 또는 "FFF".."SSS" (3게임)
                           // F = 선공, S = 후공. BO1 또는 미입력 시 null
```

마이그레이션 생성 후 적용. 기존 데이터는 모두 null (하위 호환).

## UI 변경

### `components/match-result-input.tsx`

**BO3 세부 점수 입력 섹션 아래에** 게임별 선후공 토글 추가.

표시 조건: `format === "bo3"` AND `totalGames >= 2` (myWins + myLosses가 유효한 BO3 점수일 때)

유효한 BO3 점수 조합:
- 2-0, 0-2 → 2게임 → 토글 2개
- 2-1, 1-2 → 3게임 → 토글 3개
- 그 외 → 토글 미표시 (incomplete score)

```
[세부 점수 입력 영역]

게임별 선후공          ← 섹션 레이블
[ Game 1 ]  [ Game 2 ]  [ Game 3 ]  ← 게임 수만큼만 표시
  [선] [후]    [선] [후]    [선] [후]
```

토글 UI:
- 각 게임: 선 / 후 두 버튼 (기존 SegmentedControl과 동일한 pill 스타일)
- 기본값: 선공 (F)
- 점수 변경 시 시퀀스 초기화

숨김 필드:
```html
<input type="hidden" name="bo3PlaySequence" value="FSF" />  <!-- 입력된 시퀀스 -->
<input type="hidden" name="playOrder" value="first" />      <!-- 시퀀스[0]에서 파생 -->
```

`playOrder` 파생 규칙: `sequence[0] === "F" ? "first" : "second"`

> **중요:** BO3 시퀀스 입력 시 `MatchDetailControls`의 선후공 세그먼트 컨트롤과 충돌 방지를 위해,
> `MatchResultInput`에서 `playOrder` hidden input을 emit하면 form submission 시 두 값이 중복됨.
> 구현 시 `MatchDetailControls`의 playOrder hidden field가 BO3 시 무시되도록 처리 필요.
> (방법: MatchDetailControls에 `format` prop 추가, BO3 시 선후공 섹션 숨김)

### `MatchResultInput` props 추가

```ts
type MatchResultInputProps = {
  defaultFormat?: string;
  defaultResult?: string;
  defaultWins?: number;
  defaultLosses?: number;
  defaultBo3PlaySequence?: string;  // 추가: 편집 시 프리필용
};
```

### `MatchDetailControls` props 추가

```ts
type MatchDetailControlsProps = {
  defaultPlayOrder?: "first" | "second";
  defaultDidChoosePlayOrder?: boolean;
  format?: string;  // 추가: "bo3" 시 선후공 세그먼트 숨김
};
```

BO3일 때 선후공 SegmentedControl은 렌더링하지 않음.
`didChoosePlayOrder` (선택 주체)는 BO3에서도 계속 표시.

## 기록 페이지 (`app/matches/page.tsx`)

`bo3PlaySequence` 필드를 listMatchesForUser 쿼리에 포함 (select 추가).

표시 방식:

```tsx
// 기존
{match.matchFormat === "bo3" ? `BO3 ${match.wins}-${match.losses}` : ...}

// 변경 후
{match.matchFormat === "bo3"
  ? `BO3 ${match.wins}-${match.losses}${match.bo3PlaySequence ? ` · ${formatPlaySequence(match.bo3PlaySequence)}` : ""}`
  : ...}
```

`formatPlaySequence` 헬퍼:
```ts
function formatPlaySequence(seq: string): string {
  return seq.split("").map(c => c === "F" ? "선" : "후").join("");
  // "FSF" → "선후선", "FF" → "선선"
}
```

SingleMatchCard와 TournamentMatchCard 내 라운드 행 양쪽 모두 적용.

## 편집 페이지 (`app/matches/[id]/edit/page.tsx`)

Prisma 쿼리에 `bo3PlaySequence` 추가 (`select` 확장).

```tsx
<MatchResultInput
  defaultFormat={match.matchFormat}
  defaultResult={match.isMatchWin ? "win" : "lose"}
  defaultWins={match.wins}
  defaultLosses={match.losses}
  defaultBo3PlaySequence={match.bo3PlaySequence ?? undefined}  // 추가
/>
```

## Server Action (`app/matches/actions.ts`)

`createMatchResult` / `updateMatchResult`:

```ts
const bo3PlaySequence = matchFormat === "bo3"
  ? (formData.get("bo3PlaySequence") as string | null) ?? null
  : null;
```

Prisma upsert에 `bo3PlaySequence` 포함.

## 데이터 흐름

```
[폼 입력]
  BO3 선택 → 점수 입력 (2-1) → 게임별 토글 3개 표시
    → Game1: 선, Game2: 후, Game3: 선 선택
    → hidden: bo3PlaySequence="FSF", playOrder="first"
    → Server Action: bo3PlaySequence="FSF" 저장

[기록 표시]
  "BO3 2-1 · 선후선"
```

## 검증

- 2-0 점수 입력 시 토글 2개 표시 확인
- 2-1 점수 입력 시 토글 3개 표시 확인
- DB에 bo3PlaySequence 저장 확인
- 기록 페이지에서 "선선", "선후선" 등 표시 확인
- 편집 페이지에서 기존 시퀀스 프리필 확인
- BO1 매치에서 bo3PlaySequence null 저장 확인
- `npm run build` 통과

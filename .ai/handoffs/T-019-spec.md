Author: Claude (PM)
Status: ready

# T-019: 공유 기능 재설계 + BO3 입력 UX + 대회 계속 폼 보존 버그

## 목적

T-017/T-018 배포 후 발견된 3가지 이슈 수정.

## 제약사항

- DB 스키마(Prisma) 변경 금지
- 기존 인증 흐름 변경 금지
- 매치 기록 Server Action의 핵심 로직(트랜잭션 구조) 변경 금지
- `app/matches/actions.ts`의 `createMatchResult`, `updateMatchResult`, `deleteMatchResult` 함수 변경 금지

## 구현 범위

### Task 1: 공유 기능 재설계 — 대회 전체 공유

현재 라운드마다 개별 공유 버튼이 있고 친선 매치에도 공유 버튼이 있음. 라운드별 공유는 의미 없고 친선은 공유 불필요.

**변경 방향**: 친선 공유 제거, 대회는 전체 결과 단위로 공유.

- `app/matches/page.tsx`:
  - `SingleMatchCard`에서 `<ShareButton>` 완전 제거
  - `TournamentMatchCard` 내 개별 라운드의 `<ShareButton>` 제거 (각 `match` 순회 내부)
  - `TournamentMatchCard` 헤더 영역(종료 뱃지 옆 또는 하단)에 대회 전체 공유 버튼 추가
  - `createMatchSharePayload` 함수 제거 (더 이상 사용하지 않음)
  - 대회 공유 payload 생성 함수 새로 작성: `createTournamentSharePayload(group: TournamentGroup)`
    - `game`: `group.gameName`
    - `myDeck`: `group.deckName`
    - `result`: 전체 승수 > 패수이면 `"win"`, 아니면 `"lose"`
    - `format`: 가장 많이 쓰인 matchFormat (all bo3 → `"bo3"`, else `"bo1"`)
    - `wins`: 전체 매치 승수
    - `losses`: 전체 매치 패수
    - `rounds`: 총 라운드 수
    - `date`: `group.date`
  - import 정리: 미사용 `MatchSharePayload` 타입 등 제거

- `lib/share/match-share.ts`:
  - 기존 개별 매치용 스키마(`matchShareParamsSchema`)는 유지하되, 대회 전체용 스키마 추가:
    ```
    tournamentShareParamsSchema = z.object({
      game, myDeck, result, format,
      wins: z.coerce.number().int().min(0),
      losses: z.coerce.number().int().min(0),
      rounds: z.coerce.number().int().min(1),
      date: z.string().regex(...)
    })
    ```
  - `parseTournamentShareParams`, `buildTournamentSharePath`, `buildTournamentShareSearchParams` 함수 추가
  - `buildTournamentShareTitle`: 예) `"Charizard ex — 5승 2패 (7 Rounds)"`
  - `buildTournamentShareDescription`: 예) `"World Break · Pokemon · 2026-03-23"`
  - `buildTournamentOgFontText`: OG 이미지용 폰트 텍스트

- `components/match-share-og-card.tsx`:
  - 대회 전체 공유 카드 레이아웃 추가 (또는 기존 카드를 조건 분기):
    - 중앙: 덱 이름 (큰 글씨)
    - 결과: `5W - 2L` 형태의 전적 (크고 컬러풀)
    - 하단: Game · Format · Rounds · Date
  - 기존 개별 매치 카드도 유지 (향후 필요 시)

- `app/api/og/match/route.ts`:
  - 대회 공유 파라미터도 처리할 수 있도록 분기 추가
  - 또는 별도 `app/api/og/tournament/route.ts` 생성 (선호)

- `app/share/match/page.tsx`:
  - 대회 공유 URL도 처리하도록 확장
  - 또는 별도 `app/share/tournament/page.tsx` 생성 (선호)
  - 새 공유 페이지 생성 시 `middleware.ts`, `lib/supabase/middleware.ts`의 `PUBLIC_PATHS`에 이미 `/share`가 포함되어 있으므로 추가 변경 불필요

### Task 2: BO3 세부 점수 입력 UX 수정

현재 `type="number"` 입력에 초기값 `2`/`0`이 바인딩됨. 모바일에서 `01-02` 같은 표시 발생.

- `components/match-result-input.tsx`:
  - `myWins`, `myLosses` 초기 state를 `""` (빈 문자열)로 변경
  - 편집 페이지(`defaultWins`/`defaultLosses` 제공 시)만 숫자 기본값 표시
  - `<input type="number">` 대신 `<input type="text" inputMode="numeric" pattern="[0-2]">` 사용
    - 모바일에서 숫자 키패드 표시되면서 leading zero 문제 회피
  - placeholder: 빈 상태에서 `0` 표시 (placeholder 속성 사용)
  - hidden input `bo3Score` 값 생성: 빈 값이면 기본값 처리
    - 승리 선택 + 빈칸 → `"2-0"` (기본값)
    - 패배 선택 + 빈칸 → `"0-2"` (기본값)
  - 승리/패배 전환 시 입력값 초기화 (빈칸으로)

### Task 3: 대회 계속 시 폼 보존 버그 수정

기록 목록의 "다음 라운드 추가" 링크(`nextHref`)가 잘못된 파라미터를 전달.

- `app/matches/page.tsx`의 `TournamentMatchCard`:
  - `nextHref` URL 파라미터 수정:
    - `deckId` → `deckName` (값: `group.deckName`)
    - `gameId` → `gameName` (값: `group.gameName`)
    - `matchFormat` 추가: 마지막 매치의 `matchFormat` 값
    - `playOrder` 추가: 마지막 매치의 `playOrder` 값
  - 수정 전:
    ```
    deckId: group.firstDeckId,
    gameId: group.firstGameId,
    ```
  - 수정 후:
    ```
    deckName: group.deckName,
    gameName: group.gameName,
    matchFormat: lastMatch.matchFormat,
    playOrder: lastMatch.playOrder,
    ```
  - `lastMatch`는 `group.matches[group.matches.length - 1]`

## 건드리지 말 것

- `app/matches/actions.ts` — createMatchResult, updateMatchResult, deleteMatchResult 변경 금지
- Prisma 스키마 — 변경 금지
- 기존 인증 흐름 — 변경 금지
- 대시보드 쿼리 — 변경 금지
- `components/toast.tsx`, `lib/toast.ts` — 변경 금지
- `ShareButton` 컴포넌트 자체 (`components/share-button.tsx`) — 변경 금지 (호출부만 변경)

## 완료 조건

- [ ] 친선 매치에 공유 버튼 없음
- [ ] 대회 라운드 개별 공유 버튼 없음
- [ ] 대회 카드 헤더에 전체 결과 공유 버튼 있음
- [ ] 대회 공유 링크 클릭 시 전체 전적 표시 (OG 이미지 포함)
- [ ] BO3 세부 점수 입력이 빈칸 `[] - []` 상태로 시작
- [ ] 편집 페이지에서는 기존 점수가 기본값으로 표시
- [ ] 모바일에서 `01-02` 같은 이상 표시 없음
- [ ] 기록 목록의 "다음 라운드 추가" 클릭 시 gameName, deckName, matchFormat, playOrder 유지
- [ ] `npm run build` 통과 (기존 gstack/browse 에러 제외)
- [ ] `npm run lint` 통과

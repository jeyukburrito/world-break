Author: Claude (PM)
Status: done

# T-018: 사용자 피드백 반영 — BO3 세부 점수, 선후결정 표시, 대회 종료 버그, 폼 상태 보존

## 목적

실제 사용자 4명의 피드백을 반영한 UX 개선 + 버그 수정 모음.

## 제약사항

- DB 스키마(Prisma) 변경 금지 — 기존 `wins`/`losses` Int 필드 활용
- 기존 인증 흐름 변경 금지
- 매치 기록 Server Action의 핵심 로직(트랜잭션 구조) 변경 금지

## 구현 범위

### Task 1: BO3 세부 승패 점수

BO3 매치에서 2-0 vs 2-1 (승리), 0-2 vs 1-2 (패배) 세부 점수 기록 지원.

- `lib/validation/match.ts`: `bo3Score` optional enum 필드 추가 (`"2-0" | "2-1" | "0-2" | "1-2"`)
- `app/matches/actions.ts`: `deriveScore()`에 bo3Score 파라미터 추가, `parseMatchForm`에서 전달
- `components/match-result-input.tsx`: BO3 선택 시 세부 스코어 셀렉터 UI 추가
  - BO3+승리 → [2-0, 2-1] 버튼
  - BO3+패배 → [0-2, 1-2] 버튼
  - hidden input `bo3Score` 출력
- `app/matches/page.tsx`: 매치 목록에 `{wins}-{losses}` 점수 표시 (BO3만)
- `lib/group-matches.ts`: `MatchRow` 타입에 `wins`/`losses` 필드 추가
- `app/matches/[id]/edit/page.tsx`: 편집 시 기존 wins/losses로 bo3Score 기본값 전달

### Task 2: didChoosePlayOrder 기록 목록 표시

선후공 결정 방식(자신/상대)이 저장되지만 기록 목록에 미표시 → 표시 추가.

- `app/matches/page.tsx`: SingleMatchCard, TournamentMatchCard에서 선공/후공 텍스트 뒤에 "(선택)" 접미사 추가 (didChoosePlayOrder가 true일 때)

### Task 3: 대회 종료 버그 수정

대회 종료 버튼 클릭 후 기록 목록에서 여전히 "진행 중" 표시되는 버그.

- `app/matches/tournaments/end/route.ts`:
  - 게스트 유저 인증 지원 추가 (기존은 Supabase auth만 체크)
  - `NextResponse.redirect(url, 303)` 사용 (기존 307 → POST→GET 정상화)

### Task 4: 대회 계속 시 폼 설정 보존

대회 R1 기록 후 R2 입력 화면으로 리다이렉트될 때 matchFormat, playOrder가 기본값으로 리셋되는 문제.

- `app/matches/actions.ts`: `buildNextTournamentRedirect`에 matchFormat, playOrder URL 파라미터 추가
- `app/matches/new/page.tsx`: URL params에서 matchFormat, playOrder 읽어 컴포넌트에 전달

## 건드리지 말 것

- Prisma 스키마 — 변경 금지
- 매치 삭제 로직 — 변경 금지
- 대시보드 쿼리 — 변경 금지
- 기존 인증 흐름 — 변경 금지

## 완료 조건

- [ ] BO3 매치 기록 시 세부 점수(2-0/2-1/0-2/1-2) 선택 가능
- [ ] 기록 목록에서 BO3 세부 점수 표시
- [ ] 기록 목록에서 선후공 결정자 표시 ("선공(선택)" 등)
- [ ] 대회 종료 버튼 클릭 후 "종료" 상태 정상 반영
- [ ] 대회 계속 시 matchFormat, playOrder 유지
- [ ] 편집 페이지에서 기존 BO3 세부 점수 기본값 표시
- [ ] `npm run build` 통과

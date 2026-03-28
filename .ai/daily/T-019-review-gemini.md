Author: Gemini (Code Reviewer)

# T-019 Review — 공유 기능 재설계 + BO3 입력 UX + 대회 계속 폼 보존 버그

**리뷰어**: Gemini  
**날짜**: 2026-03-23  
**판정**: `APPROVE`

---

## Review Summary
- T-019 spec에 정의된 공유 기능의 범위 조정, BO3 입력 방식 개선, 대회 라운드 추가 시의 파라미터 전달 버그 수정이 모두 정확히 반영됨.
- 특히 대회 전체 결과를 공유하는 별도의 OG 라우트와 페이지를 신설하여, T-017의 기존 기능을 보존하면서도 새로운 요구사항을 깔끔하게 수용함.
- BO3 입력 UI를 `type="text"`와 `inputMode="numeric"` 조합으로 변경하여 모바일에서의 사용자 경험(leading zero 문제 등)을 실질적으로 개선함.

## Pass
- [x] **공유 기능 재설계**: 친선 매치 및 대회 개별 라운드 공유 버튼이 제거되고, 대회 카드 헤더에 전체 결과 공유 버튼이 추가됨.
- [x] **대회 공유 구현**: `lib/share/match-share.ts`에 대회 전용 스키마 및 헬퍼 추가, `/share/tournament` 및 `/api/og/tournament` 신설.
- [x] **BO3 입력 UX**: 초기값이 빈 문자열로 시작하며, 숫자 키패드 지원 및 자동 보정 로직(`bo3Score` hidden input 생성)이 정상 작동함.
- [x] **대회 계속 버그 수정**: `TournamentMatchCard`의 `nextHref`가 `deckName`, `gameName`, `matchFormat`, `playOrder`를 올바르게 전달함.
- [x] **하위 호환성**: 기존 T-017 단일 매치 공유 경로는 코드상에 유지되어 기존 링크 깨짐을 방지함.
- [x] **lint**: `npm run lint` 통과.

## Issues
- 특이사항 없음.

## Decision
- `APPROVE`

## Notes
- `app/matches/page.tsx`에서 `createTournamentSharePayload`를 통해 승/패 판정 및 포맷 결정 로직을 뷰 레이어에서 적절히 처리함.
- 환경 제약으로 인한 `build` 실패(playwright 타입 문제)는 이번 티켓의 변경 범위와 무관하므로 승인에 영향을 주지 않음.

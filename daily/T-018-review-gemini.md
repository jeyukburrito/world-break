Author: Gemini (Code Reviewer)

# T-018 Review — 사용자 피드백 반영 (BO3 점수, 선후결정 표시 등)

**리뷰어**: Gemini  
**날짜**: 2026-03-23  
**판정**: `CONDITIONALLY APPROVE`

---

## Review Summary
- T-018 spec에 정의된 UX 개선 사항과 버그 수정이 코드 레벨에서 모두 구현된 것을 확인함.
- BO3 세부 점수 입력, 매치 목록에서의 점수 및 선후공 결정자 표시, 대회 종료 로직 안정화, 대회 계속 시 폼 상태 보존 등이 정상적으로 반영됨.
- 다만, **`.ai/handoffs/T-018-result.md` 문서가 누락**되었으며, 일일 로그(`daily/2026-03-23-codex.md`)에도 T-018 관련 내용이 포함되지 않음. 프로젝트 협업 규칙(PROJECT_RULES.md) 준수를 위해 문서 보완이 필요함.

## Pass
- [x] **BO3 세부 점수**: `bo3Score` 검증 스키마 추가 및 입력 UI(number input) 구현.
- [x] **기록 목록 표시**: BO3 점수(`wins-losses`) 및 선후공 결정 여부(`(선택)`) 표시 추가.
- [x] **대회 종료 버그**: 게스트 유저 지원 및 303 리다이렉트를 통한 POST->GET 전환 정상화.
- [x] **폼 상태 보존**: 대회 계속(Next Round) 시 `matchFormat`, `playOrder`가 URL 파라미터를 통해 유지됨.
- [x] **편집 페이지**: 기존 점수를 기반으로 BO3 세부 점수 기본값 표시.

## Issues
- **[Critical] 문서 누락**: `T-018-result.md` 파일이 존재하지 않음. 구현 결과에 대한 공식적인 기록이 필요함.
- **[Minor] UI 불일치**: Spec에서는 BO3 점수 선택을 버튼([2-0, 2-1] 등)으로 제안했으나, 실제 구현은 `number` 타입의 input으로 되어 있음. 사용성 측면에서 큰 문제는 아니나 spec과의 차이점으로 기록함.

## Decision
- `CONDITIONALLY APPROVE` (조건부 승인)
- **조건**: `.ai/handoffs/T-018-result.md` 생성 및 `daily/2026-03-23-codex.md`에 T-018 작업 내용 추가.

## Notes
- `deriveScore` 함수에서 `bo3Score`가 없을 경우 기존 폴백 로직을 유지하여 데이터 정합성을 보장함.
- `MatchDetailControls`에 `defaultPlayOrder` 등을 추가하여 폼 재사용성을 높임.

Author: Claude (PM/QA)

# Handoff Documents

티켓당 spec 1개 + result 1개를 작성한다.

## 네이밍
- `T-xxx-spec.md` — Claude 작성
- `T-xxx-result.md` — Codex 작성

## Spec 필수 항목
- Goal
- Scope
- Out of Scope
- Inputs
- Constraints
- Done Definition
- Expected Output

## Result 필수 항목
- Summary
- Files Changed
- Implemented
- Test Results
- Known Issues
- Risks
- **Next Agent Context** — 다음 에이전트가 세션 시작 시 바로 알아야 할 것 (2-3줄). 다음 티켓, 미완료 사항, 주의점.

## Result 선택 항목
- **Decision Log** — 구현 중 내린 비자명한 결정과 그 근거.

```markdown
## Decision Log

| 결정 | 대안 | 이유 |
|------|------|------|
| prisma.$queryRaw 사용 | ORM 집계 | 복잡 집계 성능 |
| 파일 X 수정 안 함 | 수정 | spec 범위 밖 |
```

**Scope Creep 발견** (선택): spec 범위 밖에서 발견한 버그/개선점은 구현하지 말고 여기 기록. Claude가 새 티켓으로 결정.

Codex가 result를 작성해도 완료가 아님 — review 후 승인으로 결정된다.

모든 handoff 문서는 첫 줄에 `Author: [Role/Name]`을 포함한다.




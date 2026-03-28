Author: Claude (PM/QA)

# CODEX_GUIDE.md — Codex Sub-Agent 호출 지침

Codex가 구현 작업 중 sub-agent를 활용할 때의 규칙.

## 기본 원칙

- Codex는 구현 작업 중 필요하다고 판단되면 sub-agent를 자율적으로 호출할 수 있다.
- 단, 구현 기준은 항상 해당 티켓의 `handoffs/T-xxx-spec.md` 하나만 사용한다.
- Codex가 리뷰 작업을 수행할 때는 반드시 review 전용 sub-agent를 먼저 호출하고, 메인 Codex가 최종 판정과 문서 작성을 통합한다.

## 컨텍스트 드리프트 방지

세션이 길어지거나 여러 티켓을 연속으로 처리할 때 컨텍스트 drift를 방지하는 규칙.

- **spec 불명확 시 즉시 중단**: 구현 중 spec이 모호하면 구현을 멈추고 result에 `BLOCKED: spec 질문 — [질문 내용]` 기록. 임의 해석 금지.
- **범위 이탈 발견 시 기록만**: spec 범위 밖에서 버그나 개선 사항을 발견해도 직접 수정하지 말 것. result의 `Scope Creep 발견` 섹션에만 기록하고 Claude가 새 티켓으로 결정.
- **세션 중 spec 재확인**: 3개 이상 파일을 수정한 뒤, 또는 여러 티켓을 연속 처리한 후에는 spec의 Done Definition을 다시 읽고 방향 확인.
- **sub-agent 호출 시 컨텍스트 전달**: sub-agent에게는 반드시 **티켓 ID + 소유 파일 범위 + TASKS.md 현재 상태 요약**을 포함해서 전달.
- **Next Agent Context 작성**: result 완료 시 반드시 `Next Agent Context` 섹션에 다음 에이전트가 바로 알아야 할 것을 2-3줄로 기록.

## 호출 조건

sub-agent는 아래 조건에서만 호출한다:
- 파일 범위를 명확히 분리할 수 있을 때
- 병렬로 처리해도 충돌이 없을 때
- 탐색, 구현, 검증 중 하나를 분리했을 때 실질적으로 속도나 정확도가 좋아질 때

## 파일 소유권

- 같은 파일을 여러 agent에게 동시에 맡기지 않는다.
- 각 sub-agent에게는 반드시 아래를 명시한다:
  - 티켓 ID
  - 소유 파일 범위
  - 범위 밖 수정 금지
  - 기존 변경 되돌리기 금지
  - 결과 문서 작성 책임 여부

## 리뷰 sub-agent

- review sub-agent를 호출할 때는 읽기 전용 검토인지, 수정 권한이 있는 재작업 검토인지 명시한다.
- 보조 탐색 agent는 읽기 전용으로 사용하고, 구현 agent와 파일 소유권을 겹치게 두지 않는다.
- sub-agent를 호출했더라도 최종 통합 책임은 메인 Codex에게 있다.

Author: Claude (PM/QA)

# CODEX_GUIDE.md — Codex Sub-Agent 호출 지침

Codex가 구현 작업 중 sub-agent를 활용할 때의 규칙.

## 기본 원칙

- Codex는 구현 작업 중 필요하다고 판단되면 sub-agent를 자율적으로 호출할 수 있다.
- 단, 구현 기준은 항상 해당 티켓의 `handoffs/T-xxx-spec.md` 하나만 사용한다.
- Codex가 리뷰 작업을 수행할 때는 반드시 review 전용 sub-agent를 먼저 호출하고, 메인 Codex가 최종 판정과 문서 작성을 통합한다.

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

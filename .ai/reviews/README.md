# Review Documents

기본적으로 Claude가 구현 완료 후 티켓당 리뷰 1개를 작성한다.
단, 원격 환경에서 Claude가 직접 수행한 구현 작업은 Codex가 리뷰를 작성한다.

## 네이밍
- `T-xxx-review.md`

## 필수 항목
- Review Summary
- Pass (충족된 Done Definition)
- Issues (발견된 문제)
- Decision (승인 / 조건부 승인 / 재작업)

## 리뷰 범위
- spec 충족 여부
- 버그
- 누락
- 배포 리스크

새 기능 요청이나 범위 확장은 반드시 새 티켓으로 분리한다.

## Codex Review Rule
- Codex가 리뷰를 맡을 때는 review sub-agent를 먼저 호출해 독립 검토를 받은 뒤 최종 리뷰 문서를 작성한다.
- review sub-agent 결과는 보조 판단이며, 최종 판정과 문서 책임은 메인 Codex에게 있다.

Author: Claude (PM/QA)

# Daily Documents

`.ai/daily/`는 협업 로그 허브다. 기존의 리뷰, 세션 회고, 릴리스 로그, 체크리스트를 모두 이 디렉터리에서 관리한다.

## 포함 문서
- `YYYY-MM-DD.md` — 일일 작업 로그
- `T-xxx-review.md` 또는 `T-xxx-[agent]-review.md` — 티켓 리뷰
- `YYYY-MM-DD-<topic>.md` — 세션 회고, 릴리스 로그 등 날짜 기반 보조 문서
- `RELEASE_CHECKLIST.md` — 릴리스 공통 체크리스트

## 공통 규칙
- 모든 문서는 첫 줄에 `Author: [Role/Name]`을 포함한다.
- 새 리뷰 문서는 더 이상 별도 `reviews/` 폴더를 만들지 않고 여기서 직접 관리한다.
- 새 릴리스 회고나 세션 회고도 별도 `release/` 폴더를 만들지 않고 여기서 직접 관리한다.

## 리뷰 기본 원칙
- 기본적으로 Claude가 구현 완료 후 티켓당 리뷰 1개를 작성한다.
- 원격 환경에서 Claude가 직접 수행한 구현 작업은 Codex가 리뷰를 작성한다.
- Codex가 리뷰를 맡을 때는 review sub-agent를 먼저 호출한 뒤 최종 리뷰 문서를 작성한다.

새 기능 요청이나 범위 확장은 반드시 새 티켓으로 분리한다.

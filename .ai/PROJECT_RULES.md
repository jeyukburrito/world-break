Author: Claude (PM/QA)

# PROJECT_RULES.md — Webapp 협업 운영 규칙

## 역할 분담

### 라우팅 원칙: 작업 유형 기반

구현 담당을 파일 수가 아닌 **작업 유형**으로 결정한다. 모든 프로젝트 문서는 상단에 `Author: [Role/Name]` 형식을 필수로 포함한다.

```
작업 유형                        Claude 직접   Codex 위임
────────────────────────────     ──────────    ──────────
Config/Infra (.gitignore 등)        ✓
문서 (README, CLAUDE.md, .ai/)      ✓
Spec / Review / QA                  ✓
대화 중 발생한 즉각적 소규모 수정    ✓  (≤3파일)
디버깅 / 좁은 범위 정밀 수정        ✓  (≤3파일)
아키텍처 결정 + 코드 동시 적용      ✓  (≤3파일)
Feature 구현 (spec 기반)                           ✓
Scaffolding / 보일러플레이트                       ✓
테스트 작성                                        ✓
대규모 리팩터링                                    ✓
```

**에스컬레이션:** Claude가 시작했다가 3파일 초과 또는 50줄 초과 예상 시 → spec 작성 후 Codex에 위임.

---

### Claude (PM + 최종 승인)

**책임:**
- 요구사항 정리 및 MVP 범위 확정
- 작업 분해 (티켓 단위)
- Done Definition이 포함된 spec 작성 (`handoffs/T-xxx-spec.md`)
- Gemini 리뷰 결과 확인 및 최종 승인/반려
- 배포 전 체크리스트 작성
- 위 라우팅 원칙에 따른 직접 구현 (Config, Docs, 소규모 즉각 수정)

**금지:**
- 4파일 이상 Feature 구현을 직접 담당
- spec 없이 Codex에 구현 지시
- 리뷰 단계에서 새 요구사항 추가
- 같은 티켓의 코드와 리뷰를 동시에 소유

### Codex (Frontend + Backend + Data 구현)

**책임:**
- `T-xxx-spec.md`만 기준으로 구현
- 구현 후 lint/test/build 결과 기록 (`handoffs/T-xxx-result.md`)
- 수정 파일 목록, 미완료 항목, 리스크를 솔직히 기록
- 범위 외 개선은 제안만 (자동 반영 금지)

**금지:**
- PRD를 임의 재해석하여 기능 추가
- spec에 없는 라이브러리 도입
- 대규모 리팩터링을 몰래 수행
- 실패한 테스트 숨기기
- Gemini 리뷰 없이 "완료" 선언

### Gemini (Code Reviewer)

**책임:**
- Codex 구현 결과 코드 리뷰 (`daily/T-xxx-review-gemini.md`)
- spec 대비 구현 충족도 검증
- 코드 품질, 보안, 성능 관점 검토
- 버그 및 누락 사항 식별
- 원격 환경에서 Claude가 직접 수행한 구현 작업의 리뷰 담당

**금지:**
- 리뷰 중 새 요구사항 추가
- 코드 직접 수정 (리뷰만 담당)
- spec에 없는 기준으로 구현 거부
- 리뷰 결과를 Claude 승인 없이 최종 확정

### Orchestrator (사용자)

**책임:**
- 티켓 우선순위 결정
- Claude↔Codex 핸드오프 관리
- 최종 승인/반려, merge 결정
- 범위 변경 결정

**금지:**
- spec 없이 Codex를 바로 돌리기
- Claude와 Codex에게 같은 파일을 동시에 맡기기
- 리뷰 없이 merge
- 구두 요구사항 변경 후 파일 미반영

---

## 소통 방식

**핵심 원칙: 여러 CLI가 서로 직접 대화하지 않고, 반드시 파일을 통해 구조화된 방식으로만 소통한다.**

- MCP 사용하지 않음
- 맥락 드리프트 방지, 책임 추적 가능, 리뷰 가능, 재현 가능
- 리뷰, 세션 회고, 릴리스 로그/체크리스트는 모두 `.ai/daily/` 아래에 둔다.

### 파일 소유권

| 담당 | 파일 |
|------|------|
| Claude | `PRD.md`, `TASKS.md`, `handoffs/T-xxx-spec.md` |
| Codex | `app/*`, `lib/*`, `components/*`, `prisma/*`, `handoffs/T-xxx-result.md` |
| Gemini | `daily/T-xxx-review-gemini.md` |

---

## 티켓 라이프사이클

```
1. Claude  → spec 작성       (handoffs/T-xxx-spec.md)
2. 사용자  → spec 승인 후 Codex에 구현 지시
3. Codex   → 구현 + result 작성 (handoffs/T-xxx-result.md)
4. Gemini  → 코드 리뷰 작성     (daily/T-xxx-review-gemini.md)
5. Claude  → 최종 승인/반려
6. 사용자  → merge 결정
```

**완료 = "코드 작성"이 아니라 "검수 통과"**

### 리뷰 라우팅

- 기본적으로 Gemini가 Codex 구현 결과를 리뷰한다.
- 원격 환경에서 Claude가 직접 수행한 구현 작업도 Gemini가 리뷰한다.
- Gemini 리뷰 후 Claude가 최종 승인/반려를 결정한다.
- 리뷰 기준 문서는 해당 티켓의 spec/result와 실제 diff이며, 새 요구사항 추가는 금지한다.

---

## 운영 규칙

1. **한 티켓에는 하나의 기준 문서만** — 기준이 여러 개면 안 됨
2. **Claude는 명세·리뷰, Codex는 구현** — 역할 혼합 금지
3. **같은 파일을 두 CLI가 동시에 수정하지 않음** — 충돌 방지
4. **spec에는 Done Definition 필수** — 없으면 완료 판단 불가
5. **result에는 실패/리스크 필수** — 성공만 적는 문서는 무의미
6. **review는 새 요구사항 추가 문서가 아님** — 스펙 충족, 버그, 누락만
7. **범위 변경은 새 티켓으로 분리** — 기존 티켓에 끼워넣지 않음
8. **브랜치는 티켓 중심** — `feat/T-001-login-page` 형태 권장
9. **말로 한 변경도 파일에 반영** — 구두 변경 후 문서 업데이트 필수
10. **webapp 스코프 격리** — 관련 없는 저장소 영역으로 작업 확산 금지. 예외는 별도 티켓으로 명시

---

## 파일 네이밍 규칙

리뷰 문서와 일일 작업 로그는 파일 이름에 작성자 이름을 포함한다.

| 문서 유형 | 네이밍 패턴 | 예시 |
|-----------|------------|------|
| 리뷰 | `T-xxx-review-{작성자}.md` | `T-014-review-gemini.md`, `T-014-review-claude.md` |
| 일일 로그 | `YYYY-MM-DD-{작성자}.md` | `2026-03-22-codex.md`, `2026-03-22-claude.md` |
| Spec / Result | 변경 없음 (작성자 고정) | `T-014-spec.md`, `T-014-result.md` |

여러 AI가 같은 날 작업하면 각자의 로그 파일을 따로 작성한다.

---

## 작성 원칙
- 구체적으로 쓸 것 — "적당히", "잘 처리" 같은 모호한 표현 금지
- 완료 기준은 관찰 가능한 형태로 정의
- 완료와 추정을 구분
- 실패와 리스크를 명시적으로 기록
- 재현 가능한 명령어와 안정적 파일 경로 사용

---

## 인코딩 규칙

→ `.ai/STANDARDS.md` 섹션 5 참조.

## Sub-Agent 호출 지침 (Codex 전용)

→ `.ai/CODEX_GUIDE.md` 참조.




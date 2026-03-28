Author: Claude (PM/QA)

# TASKS.md — 티켓 목록 및 상태

## 상태 정의

| 상태 | 의미 |
|------|------|
| `draft` | spec 미승인 |
| `ready` | spec 승인, 구현 대기 |
| `in-progress` | Codex 구현 중 |
| `review` | 리뷰 요청 상태 |
| `done` | 리뷰 통과 + 승인 완료 |
| `blocked` | 의사결정 또는 의존성 대기 |

## 티켓 목록

| ID | 제목 | 상태 | Spec | Result | Review | 비고 |
|----|------|------|------|--------|--------|------|
| T-001 | Tag 연동 | `done` | [spec](handoffs/T-001-spec.md) | [result](handoffs/T-001-result.md) | [review](daily/T-001-review.md) | 설정 CRUD + 매치 폼 연동 + 목록 표시 |
| T-002 | 대시보드 개선 | `done` | [spec](handoffs/T-002-spec.md) | [result](handoffs/T-002-result.md) | [review](daily/T-002-review.md) | 이벤트 카테고리 필터 + 상성 매트릭스 (모바일 우선) |
| T-003 | UI 일관성 개선 | `done` | [spec](handoffs/T-003-spec.md) | [result](handoffs/T-003-result.md) | [review](daily/T-003-review.md) | Radius 통일, 배지 spacing, 접근성, 빈 상태, Bottom Nav 아이콘 |
| T-004 | 기록 페이지 버그·UIUX 개선 | `done` | [spec](handoffs/T-004-spec.md) | [result](handoffs/T-004-result.md) | [review](daily/T-004-review.md) | 설정 아이콘 버그, 괄호 텍스트, 선후공 제거, 아이콘 버튼, 필터 2x2, 빈 상태 CTA |
| T-005 | 프로필 페이지 개선 | `done` | [spec](handoffs/T-005-spec.md) | [result](handoffs/T-005-result.md) | [review](daily/T-005-review.md) | 아바타 확대, 통계 그리드, 관리 링크, Danger Zone 분리 |
| T-006 | 백엔드 안전성 개선 | `done` | [spec](handoffs/T-006-spec.md) | [result](handoffs/T-006-result.md) | [review](daily/T-006-review.md) | 계정 삭제 순서, playedAt 검증, tournament end 결과 확인 |
| T-007 | 앱 성능 최적화 | `done` | [spec](handoffs/T-007-spec.md) | [result](handoffs/T-007-result.md) | [review](daily/T-007-review.md) | force-dynamic 제거, Recharts dynamic import, next/image 적용 |
| T-008 | PWA 적용 | `done` | [spec](handoffs/T-008-spec.md) | | | manifest, SW, 오프라인 페이지, 앱 아이콘 — 이미 구현 완료 확인 |
| T-009 | Tactical Editorial UI 전면 개편 | `done` | [spec](handoffs/T-009-spec.md) | [result](handoffs/T-009-result.md) | [review](daily/T-009-review.md) | Material You 디자인 시스템, 4개 주요 페이지 UI 개편 |
| T-010 | GA4 이벤트 택소노미 설계 | `done` | [spec](handoffs/T-010-spec.md) | | | Claude 직접 구현 완료 (2162f66) |
| T-011 | PWA start_url 수정 + UI 중복 제목 제거 | `done` | [spec](handoffs/T-011-spec.md) | [result](handoffs/T-011-result.md) | [review](daily/T-011-review.md) | manifest start_url 수정, dashboard/matches/settings 페이지 h2 중복 제거 |
| T-012 | 게스트 모드 (비회원 체험 + 개발 편의) | `done` | [spec](handoffs/T-012-spec.md) | [result](handoffs/T-012-result.md) | | 쿠키 기반 게스트 세션, Supabase 없이 로컬 실행 가능 |
| T-013 | 백엔드 & DB 전수 검수 (Audit) | `done` | [spec](handoffs/T-013-spec.md) | [result](handoffs/T-013-result.md) | | 읽기 전용 검수 — 스키마·액션·인증·SQL 정합성 점검 |
| T-014 | 프로필+설정 페이지 통합 | `done` | [spec](handoffs/T-014-spec.md) | [result](handoffs/T-014-result.md) | | 프로필→설정 통합, 게임 관리·마지막 경기 삭제 |
| T-015 | UI 마이크로카피 & 정보 설계 정비 | `done` | [spec](handoffs/T-015-spec.md) | [result](handoffs/T-015-result.md) | [review](daily/T-015-review-gemini.md) | 날짜 절대표기, 중복 텍스트 제거, 스탯카드 차별화 |
| T-016 | UI 정리: 게스트 문구·배너·헤더 링크·아바타 | `done` | [spec](handoffs/T-016-spec.md) | [result](handoffs/T-016-result.md) | [review](daily/T-016-review-gemini.md) | 게스트 버튼 문구, 배너 삭제, 헤더 홈링크, 아바타 제거 |
| T-017 | 매치 공유 카드 — Stateless OG Image | `done` | [spec](handoffs/T-017-spec.md) | [result](handoffs/T-017-result.md) | [review](daily/T-017-review-gemini.md) | Discord/Slack 링크 프리뷰 + Web Share API, DB 변경 없음 |
| T-018 | 사용자 피드백: BO3 점수·선후결정 표시·대회종료·폼보존 | `done` | [spec](handoffs/T-018-spec.md) | | [review](daily/T-018-review-gemini.md) | BO3 세부점수, didChoosePlayOrder 표시, 대회종료 버그, 폼상태 보존 |
| T-019 | 공유 재설계 + BO3 입력 UX + 폼 보존 버그 | `done` | [spec](handoffs/T-019-spec.md) | [result](handoffs/T-019-result.md) | [review](daily/T-019-review-gemini.md) | 대회 전체 공유, BO3 빈칸 입력, nextHref 파라미터 수정 |
| T-020 | QA Fix — Share OG·로그인 리다이렉트·대회 종료 | `done` | [spec](handoffs/T-020-spec.md) | | | OG 에러 방어, 공유페이지 리다이렉트 수정, 대회종료 복구 |
| T-021 | OG 이미지 폰트 번들링 | `done` | [spec](handoffs/T-021-spec.md) | [result](handoffs/T-021-result.md) | [review](daily/T-021-review-subagent.md) | Subset (114KB) 최적화 및 코드 수정 완료 |
| T-022 | 커스텀 도메인 설정 + Supabase Redirect URL 정비 | `done` | [spec](handoffs/T-022-spec.md) | [result](handoffs/T-022-result.md) | | OAuth 콜백 canonical origin 고정 완료 |
| T-023 | Server Action 통합 테스트 도입 | `done` | [spec](handoffs/T-023-spec.md) | [result](handoffs/T-023-result.md) | | Vitest + DB 연동 테스트 인프라 구축 |
| T-024 | 게스트 orphan 데이터 정리 | `done` | [spec](handoffs/T-024-spec.md) | [result](handoffs/T-024-result.md) | | 만료 게스트 데이터 주기적 자동 삭제 |
| T-025 | 미사용 Tag/MatchResultTag 테이블 정리 | `done` | [spec](handoffs/T-025-spec.md) | [result](handoffs/T-025-result.md) | | Prisma 스키마에서 Tag 모델 제거 + DROP TABLE 마이그레이션 |
| T-026 | 게임별 마지막 덱 자동 프리필 | `draft` | | | | Server-side 프리필 — 이전 매치 기반 게임/덱/포맷 자동 채우기 |
| T-027 | 상단 바 아이콘 제거 | `done` | [spec](handoffs/T-027-spec.md) | [result](handoffs/T-027-result.md) | | top-app-bar.tsx에서 icon-192.png 제거 |
| T-028 | BO3 게임별 선후공 시퀀스 기록 | `done` | [spec](handoffs/T-028-spec.md) | [result](handoffs/T-028-result.md) | | 선후선/선선/후후 등 게임별 시퀀스 — schema 추가 + 폼/기록 표시 |
| T-029 | 선후공 선택 주체 용어 개선 + 표시 수정 | `done` | [spec](handoffs/T-029-spec.md) | [result](handoffs/T-029-result.md) | | "결정 방식"→"선택 주체", 기록 페이지 상대 선택 미표시 버그 수정 |
| T-030 | 기록 카드 승/패 시각화 강화 | `done` | [spec](handoffs/T-030-spec.md) | [result](handoffs/T-030-result.md) | | 승리/패배 배지 크기·색상 강화, 카드 배경 조건부 tint |


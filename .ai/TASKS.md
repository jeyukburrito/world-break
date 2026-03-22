Author: Claude (PM/QA)

# TASKS.md — 티켓 목록 및 상태

## 상태 정의

| 상태 | 의미 |
|------|------|
| `draft` | spec 미승인 |
| `ready` | spec 승인, 구현 대기 |
| `in-progress` | Codex 구현 중 |
| `review` | Claude 리뷰 중 |
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
| T-012 | 게스트 모드 (비회원 체험 + 개발 편의) | `ready` | [spec](handoffs/T-012-spec.md) | | | 쿠키 기반 게스트 세션, Supabase 없이 로컬 실행 가능 |
| T-013 | 백엔드 & DB 전수 검수 (Audit) | `ready` | [spec](handoffs/T-013-spec.md) | | | 읽기 전용 검수 — 스키마·액션·인증·SQL 정합성 점검 |
| T-014 | 프로필+설정 페이지 통합 | `done` | [spec](handoffs/T-014-spec.md) | [result](handoffs/T-014-result.md) | | 프로필→설정 통합, 게임 관리·마지막 경기 삭제 |
| T-015 | UI 마이크로카피 & 정보 설계 정비 | `done` | [spec](handoffs/T-015-spec.md) | [result](handoffs/T-015-result.md) | | 날짜 절대표기, 중복 텍스트 제거, 스탯카드 차별화 |


# TODOS.md

## Server Action 통합 테스트 도입

**Priority:** P2
**Effort:** human: ~1일 / CC: ~30min

현재 프로젝트에 테스트 인프라가 없음. T-013 리팩터링에서 순수 함수 테스트(Zod, CSV)는 추가되었지만,
Server Action의 DB 연동 테스트는 별도 설정이 필요함.

- Vitest 설정 + Next.js Server Action 테스트 환경
- 테스트용 DB 연결 (Supabase test project 또는 로컬 Postgres)
- 핵심 경로: createMatchResult, updateMatchResult, deleteMatchResult, deleteAccount
- 트랜잭션 롤백 동작 검증
- userId 스코핑이 실제로 타인 데이터를 차단하는지 검증

**Depends on:** T-013 리팩터링 완료 후 진행

---

## 게스트 orphan 데이터 정리

**Priority:** P3
**Effort:** human: ~4h / CC: ~30min

게스트 쿠키(`wb_guest_token`)는 30일 후 만료되지만, DB의 게스트 유저 레코드와 관련 데이터
(games, decks, matches, tags, tournament sessions)는 영구히 남음.

- Supabase pg_cron 또는 Edge Function으로 주기적 정리
- 조건: `guestTokenHash IS NOT NULL` AND `updatedAt < NOW() - INTERVAL '60 days'`
- 60일 유예 (쿠키 30일 + 30일 버퍼)
- CASCADE 삭제로 관련 데이터 자동 정리

**Depends on:** 없음 (독립 작업)

---

## getLastDeckForGame 실패 시 UX 피드백

**Priority:** P3
**Effort:** human: ~1h / CC: ~10min

'게임별 마지막 덱 프리필' 기능(T-026 예정) 구현 시, 게임 변경 → Server Action 호출 중
네트워크 지연 또는 실패 시 덱 필드가 조용히 업데이트 안 됨. 유저는 왜 덱이 안 채워지는지 알 수 없음.

- `useTransition`의 `isPending`을 덱 필드 placeholder 또는 스피너로 표시
- 실패 시 덱 필드를 비워두거나 이전 값 유지 (UX 블로커 아님, 유저는 직접 입력 가능)
- 구현 예시: `isPending && "덱 불러오는 중..."` placeholder

**Depends on:** 이전 설정 저장 기능 구현 완료 후 폴리싱 단계에서 처리

---

## 미사용 Tag/MatchResultTag 테이블 정리

**Priority:** P3
**Effort:** human: ~2h / CC: ~15min

T-012 리팩터링으로 태그 관련 UI(settings/tags, tag-selector)가 제거되었지만,
Prisma 스키마에 `Tag`, `MatchResultTag` 모델과 DB 테이블이 남아있음.

- Prisma 스키마에서 `Tag`, `MatchResultTag` 모델 삭제
- 마이그레이션 생성 (`DROP TABLE`)
- 시드 데이터에서 태그 관련 코드 제거
- AGENTS.md Prisma Models 섹션에서 Tag/MatchResultTag 항목 제거

**Depends on:** 없음 (독립 작업)


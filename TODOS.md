Author: Legacy / Unknown

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


Author: Claude (PM/QA)

# T-013 Spec — 백엔드 & DB 전수 검수 (Audit)

## 목적

현재 운영 중인 모든 Server Actions, API Routes, 인증 흐름, DB 스키마를 **Codex가 독립적으로 검수**한다.
새 기능 구현 없이, 기존 코드의 정합성·안전성·일관성을 확인하고 발견된 이슈를 보고한다.

> Codex가 리뷰를 맡을 때의 규칙을 따른다 (PROJECT_RULES.md §리뷰 라우팅).
> 새 요구사항 추가 금지. 발견 사항만 보고.

---

## 검수 범위

### A. Prisma 스키마 정합성

**파일:** `prisma/schema.prisma`

| 점검 항목 | 세부 |
|-----------|------|
| A-1 | `EventCategory` enum에 `cs` 값이 남아 있음. UI에서 CS는 이미 제거됨. **enum 값 잔존이 DB 마이그레이션 없이 안전한지**, 기존 CS 데이터가 올바르게 조회/수정되는지 확인 |
| A-2 | `TournamentSession` — `myDeckId`+`playedOn`+`eventCategory`+`userId` 조합에 unique constraint 없음. 같은 날 같은 덱·같은 카테고리로 중복 세션 생성 가능한지 의도된 것인지 확인 |
| A-3 | `Deck.game` relation — `onDelete: Restrict`. Game 삭제 시 연결된 Deck이 있으면 Prisma 에러 발생 → `deleteGame` action에서 이 케이스를 사전 차단하는지 검증 |
| A-4 | `MatchResult.tournamentSession` — `onDelete: SetNull`. TournamentSession 삭제 시 MatchResult의 `tournamentSessionId`가 null이 됨. 현재 TournamentSession 삭제 경로가 존재하는지 확인 |
| A-5 | `User.id` — `@db.Uuid` 타입이지만, 게스트 유저는 `crypto.randomUUID()`로 생성. Supabase 유저 ID도 UUID. 양쪽 형식이 호환되는지 확인 |
| A-6 | 인덱스 커버리지 — 현재 `MatchResult` 인덱스 7개가 dashboard raw SQL의 WHERE/JOIN/GROUP BY를 커버하는지 확인. 불필요한 인덱스 또는 누락된 인덱스 식별 |

### B. Server Actions 안전성

**파일:** `app/matches/actions.ts`, `app/settings/*/actions.ts`, `app/login/actions.ts`

| 점검 항목 | 세부 |
|-----------|------|
| B-1 | **userId 스코핑**: 모든 DB 쿼리(create/update/delete/read)에 `userId` 조건이 포함되어 타인 데이터 접근이 불가능한지 전수 확인 |
| B-2 | **Zod 검증 완전성**: 모든 FormData 필드가 Zod 스키마를 통해 검증되는지 확인. 특히 `matchId`(updateMatchResult), `tournamentSessionId` 등 ID 필드의 UUID 검증 여부 |
| B-3 | **updateMany/deleteMany 결과 확인**: `result.count === 0` 처리가 모든 updateMany/deleteMany에 일관적으로 적용되는지 확인 |
| B-4 | **트랜잭션 경계**: `updateMatchResult`의 `$transaction` 내에서 tag 삭제+재생성이 안전한지. 다른 action에서 트랜잭션이 필요하지만 빠져있는 곳이 있는지 확인 |
| B-5 | **redirect 패턴 일관성**: 에러는 `?error=`, 성공은 `?message=` 패턴이 모든 action에서 일관되게 사용되는지 확인 |
| B-6 | **deleteMatchResult** — deleteMany 후 `result.count` 미확인. 존재하지 않는 매치 삭제 시에도 성공 메시지 표시. 이 패턴이 의도된 것인지 확인 |
| B-7 | **createMatchResult** — `resolveGameAndDeck`에서 game/deck upsert 후 바로 match create. 이 과정이 트랜잭션으로 묶이지 않음. 경쟁 조건(race condition) 가능성 확인 |
| B-8 | **게스트 유저 제한**: 게스트(`isGuest: true`)가 접근하면 안 되는 action이 있는지 확인. 현재 middleware에서 `/matches/export`, `/matches/tournaments/end`만 차단 중 |

### C. API Routes 검수

**파일:** `app/matches/tournaments/end/route.ts`, `app/matches/export/route.ts`, `app/auth/callback/route.ts`

| 점검 항목 | 세부 |
|-----------|------|
| C-1 | `tournaments/end` — `requireUser()` 대신 직접 Supabase auth 호출. 게스트 경로와 불일치. 이유가 있는지 (middleware에서 게스트 차단하므로) 확인 |
| C-2 | `tournaments/end` — `tournamentSessionId`에 UUID 검증 없음. 임의 문자열이 Prisma `updateMany`로 전달될 때 에러 발생 여부 확인 |
| C-3 | `export/route.ts` — 대량 데이터 export 시 메모리/타임아웃 리스크. 현재 row 제한이 없음. 실제 위험 수준 평가 |
| C-4 | `export/route.ts` — CSV injection 방어 여부 확인. `memo` 등 사용자 입력 필드에 `=`, `+`, `-`, `@` 등이 포함될 때 처리 |
| C-5 | `auth/callback` — OAuth callback 후 redirect URL 검증이 올바른지 확인 |

### D. 인증 & 게스트 모드

**파일:** `lib/auth.ts`, `lib/guest.ts`, `middleware.ts`

| 점검 항목 | 세부 |
|-----------|------|
| D-1 | `requireUser()` — Supabase 오류 시 catch 후 게스트 fallback. 네트워크 일시 장애 시 인증된 유저가 게스트로 전환되는 시나리오가 안전한지 확인 |
| D-2 | `ensureGuestUserByToken` — upsert 사용으로 경쟁 조건 방어. 실제 pgbouncer Transaction Pooler 환경에서 upsert가 안전한지 확인 |
| D-3 | `guestTokenHash` — SHA-256 해시 저장. 원본 토큰은 쿠키에만 존재. 보안적으로 충분한지 확인 |
| D-4 | 미들웨어 matcher — 정적 파일 제외 패턴이 모든 필요한 경로를 커버하는지 확인 |
| D-5 | 게스트 쿠키 30일 만료 — 만료 후 기존 게스트 데이터가 orphan이 됨. 현재 정리 전략 확인 |
| D-6 | `deleteAccount` (게스트) — 쿠키 삭제 → DB 삭제 순서. DB 삭제 실패 시 쿠키는 이미 삭제됨. cascade로 관련 데이터 삭제 확인 |

### E. Dashboard Raw SQL

**파일:** `lib/dashboard.ts`

| 점검 항목 | 세부 |
|-----------|------|
| E-1 | SQL injection 방어: `Prisma.sql` 템플릿 리터럴 사용이 모든 동적 값에 적용되는지 확인 |
| E-2 | `buildWhereSql` — `category` 값이 `"friendly"`, `"shop"`, `"cs"` 외의 값일 때 필터 무시. 이 동작이 안전한지 확인 |
| E-3 | `unstable_cache` — 캐시 키에 userId가 포함되어 유저 간 데이터 격리가 보장되는지 확인 |
| E-4 | `bigintToNumber` — `Number.MAX_SAFE_INTEGER` 초과 시 정밀도 손실. 현실적 위험도 평가 |
| E-5 | `from`/`to` 파라미터 — 날짜 문자열을 `new Date()`로 직접 파싱. 잘못된 값이 들어올 때 동작 확인 |

---

## 파일 변경 요약

| 파일 | 변경 내용 |
|------|----------|
| `.ai/handoffs/T-013-result.md` | 검수 결과 보고서 (신규) |

**코드 변경 없음.** 이 티켓은 순수 검수(audit) 티켓으로, 발견 사항만 보고한다.

---

## Done Definition

1. 위 A~E 항목을 모두 점검하고, 각 항목에 대해 **PASS / WARN / FAIL** 판정을 내린다
2. FAIL 항목이 있으면 재현 시나리오와 영향도를 기술한다
3. WARN 항목에는 개선 제안을 포함한다
4. 결과를 `handoffs/T-013-result.md`에 작성한다
5. 점검 과정에서 실제 코드를 읽고, 추정이 아닌 사실 기반으로 판정한다

---

## 비기능 요건

- 코드 수정 없음
- DB 마이그레이션 없음
- 읽기 전용 검토

---

## 범위 외 (Out of Scope)

- 발견된 이슈의 수정 (별도 티켓으로 분리)
- UI/UX 검수 (이 티켓은 백엔드 전용)
- 성능 벤치마크 (정성적 평가만)
- 테스트 코드 작성


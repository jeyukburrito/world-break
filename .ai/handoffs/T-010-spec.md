# T-010: GA4 이벤트 택소노미 설계

## 담당
- **Claude**: 택소노미 설계 + 구현 spec
- **진행 방식**: 사용자와 협의 후 확정

---

## 배경

현재 GA4 이벤트가 `analytics.tsx`에 flash message 기반으로 산발적 구현되어 있음:
- `page_view` (라우트 변경 시)
- `match_create` / `match_update` / `match_delete` (flash message 매핑)
- `deck_create` / `deck_toggle` / `game_create` / `game_update` / `game_delete`
- `match_filter` (필터 변경)
- `match_delete_confirm` (삭제 확인)
- `dashboard_filter` (기간 필터)

### 문제점
1. **네이밍 불일치**: `match_create` vs `match_delete_confirm` (동사 위치, confirm 접미사)
2. **파라미터 미정의**: 대부분 이벤트에 파라미터 없음 → GA4에서 분석 불가
3. **핵심 이벤트 누락**: 로그인, 대회 시작/종료, 태그 CRUD, CSV 내보내기
4. **사용자 속성 미설정**: 총 기록 수, 덱 수 등 코호트 분석 불가
5. **전환 이벤트 미정의**: 퍼널 분석 불가

---

## 택소노미 설계

### 네이밍 규칙
- `{object}_{action}` 형식 (GA4 권장)
- object: `match`, `deck`, `game`, `tag`, `tournament`, `filter`, `export`, `auth`
- action: `create`, `update`, `delete`, `view`, `start`, `end`, `apply`, `toggle`

### 1. 인증 이벤트

| 이벤트명 | 트리거 시점 | 파라미터 |
|---------|-----------|---------|
| `login` | Google OAuth 콜백 성공 | `method: "google"` |
| `sign_up` | 최초 로그인 (upsert에서 신규 생성) | `method: "google"` |
| `logout` | 로그아웃 액션 실행 | — |

> `login`과 `sign_up`은 GA4 추천 이벤트 (자동 보고서 활용 가능)

### 2. 경기 기록 이벤트

| 이벤트명 | 트리거 시점 | 파라미터 |
|---------|-----------|---------|
| `match_create` | 경기 저장 성공 | `event_category`, `match_format`, `result`, `play_order`, `has_memo`, `has_tags`, `is_tournament` |
| `match_update` | 경기 수정 성공 | `match_id` |
| `match_delete` | 경기 삭제 성공 | `match_id` |

### 3. 대회 이벤트

| 이벤트명 | 트리거 시점 | 파라미터 |
|---------|-----------|---------|
| `tournament_start` | 대회 첫 라운드 저장 (세션 생성) | `event_category`, `deck_name` |
| `tournament_round` | 대회 후속 라운드 저장 | `round_number`, `phase`, `result` |
| `tournament_end` | 대회 종료 | `total_rounds`, `wins`, `losses` |
| `tournament_to_elimination` | 본선 전환 | `swiss_rounds` |

### 4. 설정 이벤트

| 이벤트명 | 트리거 시점 | 파라미터 |
|---------|-----------|---------|
| `game_create` | 게임 추가 | `game_name` |
| `game_update` | 게임 수정 | — |
| `game_delete` | 게임 삭제 | — |
| `deck_create` | 덱 추가 | `game_name`, `has_color` |
| `deck_toggle` | 덱 활성/비활성 | `is_active` |
| `tag_create` | 태그 추가 | — |
| `tag_delete` | 태그 삭제 | — |

### 5. 탐색/필터 이벤트

| 이벤트명 | 트리거 시점 | 파라미터 |
|---------|-----------|---------|
| `dashboard_filter` | 대시보드 필터 변경 | `period`, `category` |
| `match_filter` | 기록 목록 필터 변경 | `filter_type`, `filter_value` |

### 6. 내보내기 이벤트

| 이벤트명 | 트리거 시점 | 파라미터 |
|---------|-----------|---------|
| `export_csv` | CSV 다운로드 실행 | `has_filters` |

### 7. 계정 이벤트

| 이벤트명 | 트리거 시점 | 파라미터 |
|---------|-----------|---------|
| `account_delete` | 계정 삭제 실행 | — |

---

## 사용자 속성 (User Properties)

| 속성명 | 설정 시점 | 값 |
|--------|---------|-----|
| `total_matches` | 로그인 시 | 누적 경기 수 (0/1-10/11-50/50+) 구간화 |
| `total_decks` | 로그인 시 | 등록 덱 수 |
| `primary_game` | 로그인 시 | 가장 많이 사용하는 게임명 |

---

## 전환 이벤트 (Conversions)

GA4 Admin에서 전환으로 마킹할 이벤트:

1. **`sign_up`** — 신규 가입
2. **`match_create`** — 핵심 가치 행동 (기록 저장)
3. **`tournament_start`** — 고급 기능 사용

---

## 구현 방식

### 현재 → 개선

**현재**: flash message 기반 (`?message=record_created` → `FLASH_EVENT_MAP` 매핑)
- 장점: Server Action 후 redirect에서 자연스럽게 동작
- 단점: 파라미터 전달 불가, 이벤트 범위 제한

**개선안**: 하이브리드 방식
1. **Server Action 이벤트**: flash message 방식 유지하되, 파라미터를 쿼리스트링으로 인코딩
   - `?message=match_create&ep=base64(JSON)` → `analytics.tsx`에서 디코딩
2. **클라이언트 이벤트**: `window.gtag()` 직접 호출 유지 (필터, 삭제 확인 등)
3. **인증 이벤트**: auth callback route에서 쿼리스트링으로 전달

### 파일 변경 범위

| 파일 | 변경 내용 |
|------|---------|
| `components/analytics.tsx` | FLASH_EVENT_MAP 확장, 파라미터 디코딩 로직, 사용자 속성 설정 |
| `app/matches/actions.ts` | redirect 시 이벤트 파라미터 추가 |
| `app/settings/*/actions.ts` | flash message 표준화 |
| `app/auth/callback/route.ts` | login/sign_up 이벤트 파라미터 |
| `app/matches/export/route.ts` | export 이벤트 |
| `lib/analytics.ts` (신규) | 이벤트명 상수, 파라미터 빌더 유틸리티 |

---

## 논의 필요 사항

1. **이벤트 세분화 수준**: `match_create` 하나로 할지, `friendly_match_create` / `tournament_match_create`로 나눌지? (파라미터로 구분 추천)
2. **대회 이벤트 범위**: `tournament_round`를 별도로 추적할지, `match_create`의 `is_tournament` 파라미터로 충분한지?
3. **사용자 속성 구간**: `total_matches` 구간화 기준 (0/1-10/11-50/50+) 적절한지?
4. **개인정보**: 덱명/게임명을 파라미터로 보내도 되는지? (GA4에 PII 전송 금지 원칙)
5. **커스텀 디멘션**: GA4 무료 계정 커스텀 디멘션 50개 제한 — 어떤 파라미터를 디멘션으로 등록할지?

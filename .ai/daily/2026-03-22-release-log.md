Author: Claude (PM/QA)

# 일일 작업 내역 — 2026-03-22

## 오늘의 커밋 (4건)

| # | Commit | 제목 |
|---|--------|------|
| 1 | `25e11e1` | feat(design): Storm 디자인 시스템 컬러 팔레트 적용 |
| 2 | `970323a` | feat(ui): 카드게임 선택 → 가로 스크롤 방식으로 변경 |
| 3 | `1ced224` | feat: 카드게임 드롭다운, 대회유형 2종(친선/대회), 대회 세부내용 필드 추가 |
| 4 | `3b098ac` | fix(qa): CS 카테고리 제거, 게스트 배너 축소, 카드게임 공식 명칭 반영 |

**총 변경:** 19 files, +335 / -208

---

## 1. Storm 디자인 시스템 컬러 팔레트 적용 (`25e11e1`)

- `globals.css`에 CSS 커스텀 프로퍼티 기반 색상 시스템 도입
- `tailwind.config.ts`에서 semantic 토큰으로 매핑 (`ink`, `muted`, `accent`, `surface`, `paper`, `line`, `success`, `danger`)
- `layout.tsx`에 `<body className="bg-paper text-ink">` 적용
- `top-app-bar.tsx` 배경색 디자인 토큰으로 변경

## 2. 카드게임 선택 UI 개선 (`970323a`)

- 기존 `<select>` 드롭다운 → 가로 스크롤 칩 방식으로 변경 (`game-name-field.tsx`)

## 3. 카드게임 드롭다운 + 대회유형 2종 + 대회 세부내용 (`1ced224`)

**핵심 변경 — 10 files, +166 / -64**

### 카드게임 선택: 바텀 시트 드롭다운
- `game-name-field.tsx`를 가로 스크롤에서 바텀 시트 방식으로 전면 재작성
- 프리셋 목록 + "직접 입력" 옵션 제공
- 선택 시 `hidden input`에 값 전달

### 대회 유형 2종으로 축소
- `event-category-select.tsx`: "친선" / "대회" 2개 세그먼트만 표시
- 기존 "CS" 카테고리는 UI에서 제거 (DB에는 하위 호환 유지)
- 기존 CS 데이터는 `"cs" → "shop"` 매핑으로 "대회"로 표시

### 대회 세부내용 필드
- 대회 선택 시 자유 텍스트 입력 필드 노출 (예: "카드냥 역삼 섀도우버스 이볼브 CS")
- `TournamentSession.name` 컬럼 추가 (nullable, `ALTER TABLE ADD COLUMN`)
- `resolveTournamentSession`에서 `name` 파라미터 저장
- 기록 목록에서 `group.name`이 있으면 대회명으로 표시, 없으면 덱명 fallback

### Zod 스키마
- `match.ts`에 `tournamentDetail` optional 필드 추가

## 4. QA 수정 (`3b098ac`)

**코드 리뷰 → QA → 수정 — 5 files, +20 / -39**

### CS 카테고리 완전 제거 (UI)
- `category-filter.tsx`: 대시보드 필터에서 CS 옵션 제거, "매장대회" → "대회"
- `settings/export/page.tsx`: CSV 내보내기 폼에서 CS 옵션 제거
- `tournament-timeline.tsx`: CS 라벨을 "대회"로 변경

### 게스트 배너 축소
- 기존: 4줄 텍스트 + 아이콘 + 그래디언트 배경 (과대)
- 변경: 1줄 인라인 배너 ("게스트 모드 · 로그인하면 데이터를 안전하게 보관할 수 있습니다" + 로그인 버튼)

### 카드게임 공식 명칭 반영
- `preset-games.ts`에서 5개 게임명을 공식 명칭으로 수정:

| 변경 전 | 변경 후 |
|---------|---------|
| 포켓몬 | 포켓몬 카드 게임 |
| 카드파이트 뱅가드 | 카드파이트!! 뱅가드 |
| 홀로라이브 OCG | 홀로라이브 오피셜 카드 게임 |
| 듀얼 마스터즈 | 듀얼마스터즈 |
| 러브라이브 OCG | 러브라이브! 시리즈 오피셜 카드게임 |

---

## 코드 리뷰 수행

- **`.ai/daily/T-012-codex-review.md`** 작성 (커밋 `1ced224` 대상)
- GATE: PASS (P1 이슈 없음)
- P2-2: 이어받기 시 대회 세부내용 수정 불가 (향후 개선 필요)
- P2-3: Edit 페이지에서 tournamentDetail 미연결 (인지 필요)
- P3: 클라이언트 검증, body 스크롤 차단, edit 기본값 등 경미한 이슈

---

## 잔여 사항 / 향후 과제

| 항목 | 우선순위 | 설명 |
|------|---------|------|
| P2-2 이어받기 시 name 업데이트 | 중간 | `resolveTournamentSession`에서 이어받기 모드 시 name 변경 반영 |
| P2-3 Edit 페이지 tournamentDetail | 낮음 | 수정 페이지에서 대회 세부내용을 편집할 수 있도록 |
| P3-2 게임명 클라이언트 검증 | 낮음 | 빈 게임명 입력 시 제출 전 피드백 |
| P3-3 바텀시트 body 스크롤 차단 | 낮음 | 모바일에서 시트 뒤 페이지 스크롤 방지 |
| T-010 GA4 이벤트 택소노미 | draft | 사용자와 협의 필요 |


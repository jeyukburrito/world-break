Author: Claude (PM)
Status: ready
Design: ~/.gstack/projects/jeyukburrito-world-break/Yoo-main-design-20260323-085700.md

# T-017: 매치 공유 카드 — Stateless OG Image

## 목적

대전 기록을 Discord/Slack/Twitter에서 링크 프리뷰로 공유할 수 있는 이미지 카드 시스템.
"덱 vs 덱, 선공/후공, 승/패, 포맷, 라운드" — 스포츠 박스 스코어처럼 한 매치의 내러티브를 시각화한다.

## 제약사항

- 새 npm 패키지 추가 금지 — `next/og`의 `ImageResponse`만 사용 (Next.js 15 내장)
- DB 스키마 변경 금지, 새 테이블 추가 금지
- OG 이미지 라우트 및 공유 페이지에 인증(auth) 적용 금지 — stateless
- 프라이버시 기본값은 비공개 — 유저가 명시적으로 공유 버튼을 눌러야만 URL 생성
- 모바일 (Web Share API) + 데스크톱 (클립보드 복사) 모두 지원

## 구현 범위

### Task 1: Font Spike (먼저 진행)

Satori에서 한국어(Noto Sans KR) 렌더링 테스트.

- `/api/og/test/route.ts` (임시) — 간단한 한국어 텍스트를 포함하는 `ImageResponse` 반환
- Noto Sans KR 폰트 파일을 fetch/buffer로 로드하여 Satori에 전달
- 렌더 시간 500ms 미만 확인
- **결과에 따라**:
  - 성공 → 본 작업에 Noto Sans KR 사용
  - 실패/느림 → Inter 폰트로 폴백, 한국어는 시스템 폰트에 위임
- spike 완료 후 테스트 라우트 삭제

### Task 2: OG 이미지 엔드포인트

`app/api/og/match/route.ts` 생성:

```
GET /api/og/match?game=Pokemon&myDeck=Charizard+ex&opponentDeck=Pikachu+ex
  &result=win&format=bo3&order=second&phase=swiss&round=3&date=2026-03-23
```

- `export const runtime = "edge"` 사용
- `ImageResponse` (from `next/og`)로 1200×630px PNG 반환
- 카드 레이아웃:
  - 좌측: "MY DECK" 라벨 + 덱 이름 (큰 글씨), 게임 이름 (작은 글씨)
  - 중앙: "VS" 구분자 + WIN/LOSE 배지 (크고 컬러)
  - 우측: "OPPONENT" 라벨 + 상대 덱 이름 (큰 글씨)
  - 하단 스트립: Game · Format · 선공/후공 · Round (대회 시만) · Date
  - 우상단: World Break 워드마크 + 토네이도 아이콘
- 디자인: Storm 디자인 시스템 컬러 팔레트 기본 적용
- 파라미터 검증: 필수값 누락 시 제네릭 "World Break" 폴백 카드 반환 (500 금지)
- 쿼리 파라미터 스키마:

| Param | 필수 | 설명 |
|-------|------|------|
| `game` | Y | 카드게임 이름 |
| `myDeck` | Y | 내 덱 이름 |
| `opponentDeck` | Y | 상대 덱 이름 |
| `result` | Y | `win` 또는 `lose` |
| `format` | Y | `bo1` 또는 `bo3` |
| `score` | N | BO3 세부 점수 (`2-0`, `2-1`, `0-2`, `1-2`) — T-018에서 추가 |
| `order` | Y | `first` 또는 `second` |
| `phase` | N | `swiss` 또는 `elimination` |
| `round` | N | 라운드 번호 (숫자) |
| `date` | N | 날짜 (`YYYY-MM-DD`) |

### Task 3: 공유 페이지

`app/share/match/page.tsx` 생성:

- `searchParams`에서 위 파라미터를 읽어 렌더링
- OG 메타 태그 설정:
  ```html
  <meta property="og:image" content="/api/og/match?..." />
  <meta property="og:title" content="{myDeck} beat/lost to {opponentDeck} ({format} · {order})" />
  <meta property="og:description" content="World Break · {phase} Round {round} · {date}" />
  <meta property="og:type" content="website" />
  ```
- 미인증 페이지 — `middleware.ts`의 `PUBLIC_PATHS`에 `/share` 추가
- 페이지 내용: 카드 이미지 표시 + 매치 정보 텍스트 + CTA ("나도 기록하기 → World Break")
- 파라미터 부족 시 `/matches`로 리다이렉트 (또는 홈으로)

### Task 4: 매치 목록에 공유 버튼

`app/matches/page.tsx`의 각 매치 행에 공유 아이콘(↗) 추가:

- 클릭 시:
  1. 매치 데이터로 `/share/match?...` URL 구성
  2. `navigator.share({ url })` 시도 (모바일 Web Share API)
  3. 실패 시 `navigator.clipboard.writeText(url)` + "복사됨!" 토스트 표시
- 클라이언트 컴포넌트로 분리 (`components/share-button.tsx`)
- 기존 매치 목록 레이아웃에 자연스럽게 녹아들어야 함

## 건드리지 말 것

- 매치 기록 Server Action (`app/matches/actions.ts`) — 변경 금지
- Prisma 스키마 — 변경 금지
- 기존 인증 흐름 — 변경 금지
- 기존 매치 목록의 다른 기능 — 변경 금지

## 완료 조건

- [ ] Satori 한국어 폰트 spike 완료, 결정 문서화
- [ ] `/api/og/match?...` → 1200×630 PNG 반환, 500ms 미만
- [ ] 필수 파라미터 누락 시 폴백 카드 반환 (500 에러 아님)
- [ ] `/share/match?...` → OG 메타 태그 포함된 공개 페이지
- [ ] Discord/Slack에서 링크 붙여넣기 시 카드 프리뷰 표시
- [ ] 매치 목록 공유 버튼 → Web Share API (모바일) + 클립보드 폴백 (데스크톱)
- [ ] `middleware.ts`에 `/share` public path 추가
- [ ] `npm run build` 통과

# T-032 Spec: 공유 이미지 기능 제거

**작성:** Claude (PM)  
**상태:** ready  
**브랜치:** feat/T-032-remove-share (main에서 새 브랜치)

---

## 배경

URL 기반 공유 기능(OG 이미지 + share 페이지)이 T-017~T-021에 걸쳐 반복적으로 문제를 일으켰다. 유저는 PNG 저장 방식(T-031)을 선호하며, URL 공유는 상대방이 앱을 모르면 의미 없다. 제거 결정.

**유지 대상 (삭제 금지):**
- `app/api/og/daily-summary/` — 일일 매치 요약 PNG 다운로드
- `app/api/og/tournament-scorecard/` — 대회 성적표 PNG
- `lib/og/` 전체 — render 함수들
- `components/daily-match-card.tsx`
- `components/tournament-scorecard-card.tsx`

---

## 제거 대상

### 파일 삭제
```
app/api/og/match/                    # route.ts 포함 디렉토리 전체
app/api/og/tournament/               # route.ts 포함 디렉토리 전체
app/share/match/                     # page.tsx 포함 디렉토리 전체
app/share/tournament/                # page.tsx 포함 디렉토리 전체
components/share-button.tsx
components/match-share-og-card.tsx
components/tournament-share-og-card.tsx
lib/share/                           # match-share.ts + og-font.ts 전체 디렉토리
```

### app/matches/page.tsx 수정

제거할 import 라인:
```tsx
// 제거
import { ShareButton } from "@/components/share-button";
import {
  buildTournamentSharePath,
  createTournamentSharePayload,  // 또는 해당 함수 이름 확인
} from "@/lib/share/match-share";
```

제거할 코드 블록 (line 179 근처):
```tsx
// 제거
const tournamentShareHref = buildTournamentSharePath(createTournamentSharePayload(group));
```

제거할 JSX (line 217 근처):
```tsx
// 제거
<ShareButton href={tournamentShareHref} />
```

`createTournamentSharePayload` 함수 정의도 page.tsx 안에 있으면 함께 제거 (line 76~).

### middleware.ts 확인

`/share` 경로가 `PUBLIC_PATHS`에 있으면 제거:
```ts
// 이런 항목이 있으면 제거
"/share",
```

---

## 검증

```bash
npm run build   # 타입 에러 없이 통과해야 함
npm run lint    # import 참조 없이 통과해야 함
```

빌드 통과가 완료 조건. `/share/match`, `/share/tournament`, `/api/og/match`, `/api/og/tournament` 라우트는 존재하지 않아야 함.

---

## 완료 조건 체크리스트

- [ ] 위 파일 전부 삭제
- [ ] `app/matches/page.tsx`에서 ShareButton, share 관련 import/코드 제거
- [ ] middleware.ts에서 `/share` PUBLIC_PATHS 항목 제거 (있다면)
- [ ] `npm run build` 통과
- [ ] `npm run lint` 통과

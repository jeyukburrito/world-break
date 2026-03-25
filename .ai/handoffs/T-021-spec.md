Author: Claude (PM)
Status: ready

# T-021: OG 이미지 폰트 번들링 — Google Fonts 네트워크 의존 제거

## 배경

공유 카드의 OG 이미지(`/api/og/match`, `/api/og/tournament`)가 프로덕션에서 간헐적으로 깨진다.
근본 원인: `og-font.ts`가 Google Fonts를 런타임에 네트워크로 불러오는데,
Vercel serverless 환경에서 타임아웃이 발생하면 fallback 카드(커스텀 폰트 없음)로 렌더링됨.

T-020에서 try/catch + fallback 카드로 증상을 가렸지만, 근본 해결이 필요하다.

## 해결 방향

Google Fonts 네트워크 의존을 완전히 제거하고, woff2 폰트 파일을 프로젝트에 번들한다.

## 수정 범위

### 1. 폰트 파일 추가

Noto Sans KR woff2 파일 2개를 프로젝트에 추가:
- `public/fonts/NotoSansKR-Regular.woff2` (400 weight)
- `public/fonts/NotoSansKR-Bold.woff2` (700 weight)

폰트 파일 확보 방법:
- Google Fonts에서 Noto Sans KR Regular/Bold woff2 다운로드
- 또는 `@fontsource/noto-sans-kr` 패키지에서 추출
- 한글 글리프 포함 필수 (덱 이름이 한글일 수 있음)

> 참고: Noto Sans KR 전체는 ~5MB이지만, Google Fonts가 제공하는 woff2는
> 이미 서브셋되어 있어 ~200-400KB 수준. 전체 폰트를 넣어도 OG route에서만
> 사용하므로 클라이언트 번들에는 영향 없음.

### 2. `lib/share/og-font.ts` 전면 교체

현재 (102줄): Google Fonts CSS fetch → 폰트 바이너리 fetch → Promise.race 타임아웃

교체 후 (~20줄):
```typescript
import { readFile } from "fs/promises";
import { join } from "path";

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: 400 | 700;
};

export async function loadMatchOgFonts(): Promise<LoadedFont[]> {
  try {
    const fontDir = join(process.cwd(), "public", "fonts");
    const [regular, bold] = await Promise.all([
      readFile(join(fontDir, "NotoSansKR-Regular.woff2")),
      readFile(join(fontDir, "NotoSansKR-Bold.woff2")),
    ]);

    return [
      { name: "Noto Sans KR", data: regular.buffer, style: "normal", weight: 400 },
      { name: "Noto Sans KR", data: bold.buffer, style: "normal", weight: 700 },
    ];
  } catch {
    return [];
  }
}
```

삭제 대상 (전부):
- `fetchGoogleFont()` 함수
- `loadFontFamily()` 함수
- `loadFontFallbackChain()` 함수
- `buildGoogleFontCssUrl()` 함수
- `fontCache` Map
- `FONT_USER_AGENT`, `FONT_BUDGET_MS`, `FETCH_TIMEOUT_MS` 상수

핵심: `loadMatchOgFonts()`의 시그니처가 `(text: string) → Promise<LoadedFont[]>`에서
`() → Promise<LoadedFont[]>`로 변경됨. 호출부도 수정 필요.

### 3. `lib/share/match-share.ts` — dead code 삭제

다음 함수 삭제 (Google Fonts `&text=` 파라미터용이었으므로 번들 폰트에서 불필요):
- `buildMatchOgFontText()` (225~255줄)
- `buildTournamentOgFontText()` (257~283줄)

export 구문에서도 제거.

### 4. OG route 호출부 수정

**`app/api/og/match/route.ts`**:
- Before: `const fonts = await loadMatchOgFonts(buildMatchOgFontText(share));`
- After: `const fonts = await loadMatchOgFonts();`
- `buildMatchOgFontText` import 제거

**`app/api/og/tournament/route.ts`**:
- Before: `const fonts = await loadMatchOgFonts(buildTournamentOgFontText(share));`
- After: `const fonts = await loadMatchOgFonts();`
- `buildTournamentOgFontText` import 제거

### 5. runtime 유지

OG routes의 `export const runtime = "nodejs"`는 그대로 유지.
(fs.readFile은 nodejs runtime에서만 동작하며, 현재 이미 nodejs로 설정됨)

## 수정하지 않는 것

- OG 카드 디자인 (match-share-og-card.tsx, tournament-share-og-card.tsx) — 변경 없음
- share page (app/share/*) — 변경 없음
- share button (components/share-button.tsx) — 변경 없음
- Zod 스키마 — 변경 없음
- try/catch fallback 로직 — 유지 (폰트 읽기 실패 대비)

## 검증

1. `npm run build` 통과
2. `npm run lint` 통과
3. 로컬 `npm run dev` 후 `/api/og/match?game=Pokemon&myDeck=리자몽ex&opponentDeck=피카츄ex&result=win&format=bo3&order=second` 접속하여 한글 폰트 렌더링 확인
4. 배포 후 Discord에 `/share/match?...` URL 붙여넣어 OG 프리뷰 확인

## 파일 목록 (4개 수정 + 2개 추가)

| 파일 | 작업 |
|------|------|
| `public/fonts/NotoSansKR-Regular.woff2` | **추가** |
| `public/fonts/NotoSansKR-Bold.woff2` | **추가** |
| `lib/share/og-font.ts` | **전면 교체** (102줄 → ~20줄) |
| `lib/share/match-share.ts` | **부분 삭제** (~60줄 제거) |
| `app/api/og/match/route.ts` | **수정** (import + 호출부) |
| `app/api/og/tournament/route.ts` | **수정** (import + 호출부) |

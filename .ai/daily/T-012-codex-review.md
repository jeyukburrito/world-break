Author: Claude (PM/QA)

# Code Review — feat: 카드게임 드롭다운, 대회유형 2종, 대회 세부내용 필드

**Commit:** `1ced224`
**Reviewer:** Claude Code (Sonnet 4.6)
**Date:** 2026-03-22
**Files changed:** 10 files, +166 / -64

---

## GATE: PASS

Critical(P1) 이슈 없음. 하위 호환성 유지. 아래 P2/P3 사항은 선택적 개선.

---

## P2 — 주의 필요

### [P2-1] `resolveTournamentSession` eventCategory 타입 미스매치

`actions.ts:103`

```ts
eventCategory: "shop" | "cs";
```

함수 시그니처에 `"cs"`가 여전히 포함되어 있지만, 실제 호출부(`createMatchResult`, `updateMatchResult`)에서는 `parsed.data.eventCategory === "shop" || parsed.data.eventCategory === "cs"` 조건으로 분기하며 두 값 모두 전달될 수 있음. UI에서는 CS가 제거됐지만, **기존 CS 데이터를 수정할 때** editRedirect 경로에서 `resolveTournamentSession`이 `"cs"` 값을 받을 수 있는 경로는 유지되어 있어 일관성 있음.

→ 실제 버그는 아님. 단, 향후 CS를 완전히 제거할 때 이 타입도 같이 정리 필요.

---

### [P2-2] 대회 세부내용이 기존 세션 이어받기 시 저장되지 않음

`actions.ts:111~136` — `resolveTournamentSession`에서 `tournamentSessionId`가 있으면 (이어받기 모드) `name` 파라미터를 무시하고 기존 세션을 그대로 반환.

```ts
if (tournamentSessionId) {
  // name을 저장하는 코드 없음 → 이어받기 시 세부내용 수정 불가
  return { ok: true, sessionId: existing.id };
}
```

**영향:** 대회 첫 라운드에서 세부내용을 입력한 경우 이후 라운드에서 수정할 방법이 없음. 첫 생성 시에만 name이 저장됨.

**개선안:** 이어받기 시에도 name이 변경되었으면 update 쿼리 추가.

```ts
if (tournamentSessionId) {
  const existing = await prisma.tournamentSession.findFirst({ ... });
  if (!existing) return { ok: false, error: "..." };
  if (existing.endedAt) return { ok: false, error: "..." };

  // name이 바뀐 경우 업데이트
  if (name !== undefined && name !== existing.name) {
    await prisma.tournamentSession.update({
      where: { id: existing.id },
      data: { name },
    });
  }

  return { ok: true, sessionId: existing.id };
}
```

---

### [P2-3] `tournamentDetail` 필드가 수정(edit) 흐름에 연결되지 않음

`app/matches/[id]/edit/` 페이지에서 tournament detail을 수정할 수 없음. `updateMatchResult` action에서 `tournamentDetail`을 읽어서 `resolveTournamentSession`에 `name`으로 전달하는 경로가 없음.

→ 현재 UX에서 수정 페이지는 existing session을 그대로 이어받으므로 크게 문제는 아니지만, name 수정 UI가 없다는 것을 인지해야 함.

---

## P3 — 경미한 이슈 / 개선 제안

### [P3-1] `buildNextTournamentRedirect` eventCategory 타입 하드코딩

```ts
async function buildNextTournamentRedirect(params: {
  eventCategory: "shop";  // "cs" 제거됨
  ...
})
```

CS 완전 제거에 맞게 타입이 이미 좁혀짐. 호출부 체크 필요:

`actions.ts:258`:
```ts
if (tournamentSessionId && parsed.data.eventCategory === "shop") {
```

CS는 더 이상 다음 라운드 redirect를 만들지 않음. 기존 CS 데이터는 단순 목록 표시만 됨. ✅

---

### [P3-2] `GameNameField` — 직접 입력 시 게임명 유효성 검사 없음

`components/game-name-field.tsx` — 직접 입력한 게임명에 대해 클라이언트 사이드 trim/min-length 검사가 없음. 서버 액션에서 `z.string().trim().min(1).max(60)` Zod 스키마로 잡히지만, UX 관점에서 빈 게임명 입력 시 제출 시점까지 피드백이 없음.

→ `required` attribute나 `minLength` 추가 고려.

---

### [P3-3] 바텀 시트가 열린 상태에서 스크롤 차단 없음

`components/game-name-field.tsx` — `open` 상태에서 `overflow-hidden` 처리를 body에 적용하지 않아, 모바일에서 시트 뒤 페이지가 스크롤될 수 있음. 기존 `SelectSheetField`에서도 동일 패턴이면 일관성은 있음.

---

### [P3-4] `defaultTournamentDetail` prop이 edit 페이지에서 사용되지 않음

`EventCategorySelect`에 `defaultTournamentDetail` prop이 추가됐지만, edit 페이지에서 기존 tournament session의 name을 불러와 전달하지 않음. 수정 시 세부내용 필드가 항상 비어있는 채로 렌더됨.

---

## 긍정적 관찰

- **하위 호환성 처리 정확함**: `defaultValue === "cs" ? "shop" : defaultValue` 매핑으로 기존 CS 데이터가 UI에서 "대회"로 자연스럽게 표시됨.
- **DB 마이그레이션 안전**: `ALTER TABLE ... ADD COLUMN "name" TEXT` — NOT NULL 없이 nullable로 추가. 기존 레코드에 영향 없음.
- **그룹 표시 로직 명확**: `TournamentMatchCard`에서 `group.name`이 있으면 이름으로, 없으면 덱 이름으로 fallback. 기존 데이터 표시 깨지지 않음.
- **Zod 스키마 확장 최소화**: `tournamentDetail`을 별도 optional 필드로 추가. 기존 스키마 변경 없음.

---

## 요약

| Priority | 항목 | 상태 |
|----------|------|------|
| P1 | Critical 버그 | 없음 ✅ |
| P2-1 | `eventCategory: "cs"` 타입 잔존 | 하위 호환 목적, 추후 정리 필요 |
| P2-2 | 이어받기 시 세부내용 수정 불가 | 수정 권장 |
| P2-3 | Edit 흐름에 tournamentDetail 미연결 | 인지 필요 |
| P3-1 | CS redirect 분기 제거 | 이미 올바르게 처리됨 ✅ |
| P3-2 | 직접 입력 게임명 클라이언트 검사 없음 | 선택적 개선 |
| P3-3 | 시트 열림 시 body 스크롤 차단 없음 | 선택적 개선 |
| P3-4 | edit 페이지 defaultTournamentDetail 미전달 | 선택적 개선 |


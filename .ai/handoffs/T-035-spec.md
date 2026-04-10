Author: Claude (PM)

# T-035 Spec — actions.ts 한국어 에러 메시지 뷁어 수정

## 배경

`app/matches/actions.ts`의 모든 한국어 에러 메시지 문자열이 Windows 터미널 인코딩 이슈(CP949 → UTF-8 변환 실패)로 인해 mojibake(뷁어)로 깨져 있음. 매치 생성/수정/삭제 중 에러가 발생하면 사용자에게 `"?섏젙??寃쎄린 ID媛 ?щ컮瑜댁? ?딆뒿?덈떎."` 같은 문자가 표시됨.

**근본 원인:** Codex가 Windows 환경에서 파일을 작성할 때 터미널 코드페이지(CP949)를 통해 한국어 UTF-8 바이트가 손상됨.

---

## 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `app/matches/actions.ts` | 모든 한국어 에러 문자열 교체 |

---

## 상세 수정 사항

### `app/matches/actions.ts`

아래 라인의 문자열을 정확히 교체. **다른 코드는 일절 수정하지 말 것.**

**Line 74 (deriveScore 함수 내 주석):**
```
// 기존 (깨진 상태):
// ?대갚: 湲곗〈 濡쒖쭅 (bo3Score 誘몄젣怨???

// 교체 후:
// 기본값: bo3Score 없을 때 2-1 / 1-2 기본 적용
```

**Line 124 (resolveTournamentSession — 세션 없음):**
```
// 기존 (깨진 상태):
return { ok: false as const, error: "?댁뼱吏??????몄뀡??李얠쓣 ???놁뒿?덈떎." as const };

// 교체 후:
return { ok: false as const, error: "대회 세션을 찾을 수 없습니다." as const };
```

**Line 129-132 (resolveTournamentSession — 대회 종료):**
```
// 기존 (깨진 상태):
return {
  ok: false as const,
  error: "醫낅즺????뚯엯?덈떎. 湲곗〈 湲곕줉? ?섏젙?????덉?留????쇱슫?쒕뒗 異붽??????놁뒿?덈떎." as const,
};

// 교체 후:
return {
  ok: false as const,
  error: "대회가 종료되었습니다. 현재 기록 수정 또는 해당 대회에 추가하는 것은 불가합니다." as const,
};
```

**Line 196 (createMatchResult — 유효성 검사 실패):**
```
// 기존 (깨진 상태):
redirect(newMatchRedirect("error", "?낅젰媛믪쓣 ?뺤씤??二쇱꽭??"));

// 교체 후:
redirect(newMatchRedirect("error", "입력값을 확인해 주세요."));
```

**Line 294 (updateMatchResult — matchId 유효성 실패):**
```
// 기존 (깨진 상태):
redirect(matchesRedirect("error", "?섏젙??寃쎄린 ID媛 ?щ컮瑜댁? ?딆뒿?덈떎."));

// 교체 후:
redirect(matchesRedirect("error", "수정할 올바른 ID가 필요합니다."));
```

**Line 298 (updateMatchResult — 폼 유효성 실패):**
```
// 기존 (깨진 상태):
redirect(editRedirect(matchId, "error", "?낅젰媛믪쓣 ?뺤씤??二쇱꽭??"));

// 교체 후:
redirect(editRedirect(matchId, "error", "입력값을 확인해 주세요."));
```

**Line 375-377 (updateMatchResult — 매치 없음):**
```
// 기존 (깨진 상태):
redirect(matchesRedirect("error", "?섏젙?????湲곕줉??李얠쓣 ???놁뒿?덈떎."));

// 교체 후:
redirect(matchesRedirect("error", "수정할 기록을 찾을 수 없습니다."));
```

**Line 384-386 (updateMatchResult — 권한 없음):**
```
// 기존 (깨진 상태):
redirect(matchesRedirect("error", "?섏젙 沅뚰븳???녾굅?????湲곕줉??李얠쓣 ???놁뒿?덈떎."));

// 교체 후:
redirect(matchesRedirect("error", "수정 권한이 없거나 기록을 찾을 수 없습니다."));
```

**Line 400 (deleteMatchResult — matchId 유효성 실패):**
```
// 기존 (깨진 상태):
redirect(matchesRedirect("error", "??젣??寃쎄린 ID媛 ?щ컮瑜댁? ?딆뒿?덈떎."));

// 교체 후:
redirect(matchesRedirect("error", "삭제할 올바른 ID가 필요합니다."));
```

**Line 410-412 (deleteMatchResult — 권한 없음):**
```
// 기존 (깨진 상태):
redirect(matchesRedirect("error", "??젣 沅뚰븳???녾굅?????湲곕줉??李얠쓣 ???놁뒿?덈떎."));

// 교체 후:
redirect(matchesRedirect("error", "삭제 권한이 없거나 기록을 찾을 수 없습니다."));
```

---

## 검증

```bash
npm run build   # 빌드 통과 확인
```

빌드 통과 후 result 파일 작성:
- 변경한 라인 번호 목록
- 변경 전/후 문자열 확인
- `npm run build` 통과 여부

---

## 주의사항

- 문자열 외의 로직(redirect 구조, 함수 시그니처 등) 절대 수정 금지
- 파일 인코딩을 UTF-8로 저장 (BOM 없이)
- 한국어 문자열을 터미널을 통해 echo/print하지 말고 에디터에서 직접 작성

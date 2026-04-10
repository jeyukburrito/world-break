Author: Claude (PM)

# T-036 Spec — 이미지 내보내기 버그 수정

## 배경

두 가지 이미지 내보내기 기능이 모두 동작하지 않음:

1. **오늘 저장 버튼** (`/matches` 페이지): 게스트가 클릭 시 401 텍스트가 다운로드됨. 로그인 사용자도 문제 가능성 있음.
2. **성적표 PNG 저장** (`/matches/tournaments/[id]/result`): Supabase Storage 설정 미비 또는 SERVICE_ROLE_KEY 미설정으로 저장 실패.

---

## 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `middleware.ts` | SUPABASE_ONLY_PATHS에 `/api/og/daily-summary` 추가 |
| `app/matches/page.tsx` | (선택) 게스트인 경우 오늘 저장 버튼 숨김 |

---

## 상세 구현 명세

### 1. `middleware.ts` — SUPABASE_ONLY_PATHS 추가

게스트가 `/api/og/daily-summary`에 접근하면 raw 401 응답 대신 `/login`으로 리다이렉트.

```typescript
// 기존:
const SUPABASE_ONLY_PATHS = ["/matches/export"];

// 교체 후:
const SUPABASE_ONLY_PATHS = ["/matches/export", "/api/og/daily-summary"];
```

### 2. 성적표 저장 실패 원인 진단 (Codex가 직접 수정하지 않음)

Codex는 다음을 확인하고 result에 기록:

**확인 항목:**
- `app/matches/tournaments/[id]/result/actions.ts`의 `saveTournamentScorecard` 로직 검토
- `createAdminClient()` 호출 시 `SUPABASE_SERVICE_ROLE_KEY` 없으면 throw — 이 케이스에 대한 에러 처리가 적절한지 확인
- `storage.upload` 실패 시 에러 메시지가 "성적표 저장에 실패했습니다"로 표시되는지 확인 (T-035 수정 후 한국어 정상 표시 전제)

**Supabase Storage 설정 (PM이 별도 수행):**
- Supabase Dashboard → Storage → `tournament-scorecards` 버킷 생성 필요
- 버킷 정책: Public 읽기 허용
- Vercel 환경변수: `SUPABASE_SERVICE_ROLE_KEY` 설정 확인

**만약 에러 처리 개선이 필요하다면:**
- `createAdminClient()`가 throw할 때 "성적표 저장 기능을 사용하려면 Supabase 설정이 필요합니다." 라는 명확한 에러 메시지 표시

---

## 검증

```bash
npm run build   # 빌드 통과 확인
```

검증 시나리오:
1. 게스트 상태에서 `/matches` → "오늘 저장" 클릭 → `/login` 리다이렉트 확인
2. 로그인 상태에서 "오늘 저장" 클릭 → PNG 다운로드 확인
3. 성적표 저장 에러 메시지가 한국어(뷁어 아님)로 표시 확인

---

## 주의사항

- middleware.ts 변경은 최소화 (SUPABASE_ONLY_PATHS 배열 한 줄만)
- `app/matches/page.tsx`에서 게스트 숨김 처리는 선택 (middleware에서 이미 막으므로)
- Supabase Storage 버킷 생성은 PM(Claude) 별도 수행 — Codex 담당 아님

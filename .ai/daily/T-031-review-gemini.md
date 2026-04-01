Author: Gemini (Reviewer) + Claude (PM verification)

# T-031 Review — 대회 성적표 이미지 영구 보관

**VERDICT: APPROVE**
Reviewed by: Gemini (코드 리뷰) + Claude PM (최종 검증)
Date: 2026-03-31

---

## 리뷰 요약

명세 충족도, 보안, 접근 제어 모두 정상. 빌드 PASS.

---

## 주요 확인 항목

### 보안 / 접근 제어

- `saveTournamentScorecard` Server Action: `requireAuthenticatedUserId()` 호출로 Supabase 인증 유저만 허용. 게스트 토큰 기반 유저 차단됨.
- DB 쿼리: `findFirst({ where: { id: sessionId, userId } })`로 타인 세션 접근 차단. IDOR 없음.
- 결과 페이지(`page.tsx`): `requireUser()`는 게스트도 통과 (`isGuest: true` 반환). `{!user.isGuest}` 조건으로 저장 버튼 숨김. UI + 서버 이중 차단 구조 확인.

### Satori 렌더링

- `tournament-scorecard-card.tsx`: Tailwind 미사용, 전체 inline style 객체. Satori 호환.
- 디자인 토큰 (`#12131d`, `rgba(26, 27, 38, 0.94)`, `#30d158`, `#ff6b6b`)이 기존 OG 카드와 일치.
- `MAX_VISIBLE_ROUNDS = 8` 적용, 초과 시 `외 N라운드` 요약 행 표시.
- `opponentDeckName === null` → `"상대 덱 미입력"` (color: subtext) 처리됨.
- `ScoreDots` 컴포넌트: ● / ○ 기반 wins/losses 시각화.

### 폰트 로딩

- `lib/og/render-scorecard.ts`: `fs.promises.readFile(path.join(process.cwd(), "public/fonts/..."))` — 파일시스템 직접 읽기. Server Action에서 안전. HTTP fetch 없음.
- `react.cache()`로 래핑 — 동일 요청 내 중복 읽기 방지.
- `Buffer → toArrayBuffer()` 변환 정확.

### Storage / DB 플로우

- `createAdminClient()` (service role key) 사용. 서버 내부에서만 호출.
- 파일 경로: `{userId}/{sessionId}.png` — 사용자별 폴더 격리.
- `upsert: true` — 재저장 시 덮어쓰기.
- `prisma.tournamentSession.updateMany({ where: { id, userId } })` — count=0 시 에러. Storage 성공 후 DB 실패 시 upsert로 재시도 가능.
- `revalidatePath` 호출로 결과 페이지 + 기록 목록 캐시 무효화.

### result 페이지

- `AppShell` 사용으로 기존 앱 UI 통일성 유지.
- 라운드 빈 상태 처리 ("기록된 라운드가 없습니다") 포함.
- `SaveScorecardButton` 클라이언트 컴포넌트 분리로 서버/클라이언트 경계 올바름.
- 재저장 버튼 + PNG 다운로드 링크 상태 분기 처리됨.

### 기타

- `end/route.ts`: GA4 `ep` 파라미터 및 `message` 파라미터 제거하고 result 페이지로 단순 redirect. 깔끔.
- OG stub route 생성됨.
- `npm run build` PASS, `npm run lint` PASS.

---

## 외부 의존성 (배포 전 완료 필요)

- [ ] Supabase 대시보드에서 `tournament-scorecards` 버킷 생성 (public)
- [ ] RLS 업로드 정책 설정: `auth.uid()::text = (storage.foldername(name))[1]`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 환경 변수 확인 (Vercel 배포 설정)

---

## 미해결 이슈 (범위 외)

- `prisma migrate dev` 실패: `20260322180000_migrate_cs_to_shop`의 shadow DB 마이그레이션 문제. T-031과 무관한 기존 버그. 별도 티켓 필요 시 T-032로 등록.
- PNG 저장 실사 테스트: Supabase Storage 버킷 설정 후 인증 유저로 직접 QA 필요.

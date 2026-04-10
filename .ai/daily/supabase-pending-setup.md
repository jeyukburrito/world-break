Author: Claude (PM)
Date: 2026-04-10

# Supabase 수동 설정 체크리스트

T-031 성적표 PNG 저장 기능이 실제로 작동하려면 아래 두 가지 수동 설정이 필요합니다.
코드 배포와 별개로 Supabase/Vercel 대시보드에서 직접 설정해야 합니다.

---

## 체크리스트

- [ ] **Supabase Dashboard → Storage → Buckets**
  - 버킷 이름: `tournament-scorecards`
  - 접근 권한: **Private** (Public 아님 — Signed URL 방식 사용)

- [ ] **Vercel Dashboard → Settings → Environment Variables**
  - 변수명: `SUPABASE_SERVICE_ROLE_KEY`
  - 값: Supabase 프로젝트 API 설정에서 `service_role` 키 복사
  - 적용 대상: Production + Preview

---

## 확인 방법

설정 후 대회 결과 페이지(`/matches/tournaments/[id]/result`)에서:
1. "성적표 저장" 버튼 클릭
2. "성적표가 저장되었습니다." 메시지 표시 확인
3. "PNG 열기" 클릭 → 이미지 로드 확인

실패 시: 브라우저 콘솔 또는 Vercel Logs에서 에러 메시지 확인

---

## 미설정 시 증상

- 성적표 저장 버튼 클릭 → "성적표 저장에 실패했습니다" 메시지
- Vercel 로그: `SUPABASE_SERVICE_ROLE_KEY is not set` 또는 `bucket not found`

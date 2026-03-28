Author: Claude (PM)

# T-024: 게스트 orphan 데이터 정리

## 배경

게스트 쿠키(`wb_guest_token`)는 30일 후 만료되지만, DB의 게스트 유저 레코드와 관련 데이터
(games, decks, matches, tags, tournament sessions)는 영구히 남음.
시간이 지날수록 사용되지 않는 게스트 데이터가 DB에 누적됨.

## 목표

만료된 게스트 세션의 DB 데이터를 주기적으로 자동 정리.

## 작업 항목

- [ ] 정리 대상 조건 정의: `guestTokenHash IS NOT NULL` AND `updatedAt < NOW() - INTERVAL '60 days'`
  - 60일 유예 (쿠키 30일 + 30일 버퍼)
- [ ] 정리 방법 선택 및 구현 (아래 옵션 중 택 1):
  - **옵션 A**: Supabase `pg_cron` 확장으로 DB 레벨 주기적 삭제 (추천)
  - **옵션 B**: Vercel Cron Job (`/api/cron/cleanup-guests`) + API route
  - **옵션 C**: 수동 실행 스크립트 (`npm run cleanup:guests`)
- [ ] CASCADE 삭제로 관련 데이터(games, decks, matches, tags, tournaments) 자동 정리 확인
- [ ] 정리 실행 로그 기록 (삭제된 유저 수)
- [ ] dry-run 모드 지원 (실제 삭제 없이 대상 확인)

## 영향 범위

- 신규: cron job 또는 cleanup 스크립트 1개
- 기존 스키마 변경 없음 (CASCADE 이미 설정됨)

## 수용 기준

- [ ] 60일 이상 미사용 게스트 데이터 자동 정리
- [ ] 정상 유저(guestTokenHash IS NULL) 데이터 절대 삭제 안 함
- [ ] dry-run으로 삭제 대상 사전 확인 가능
- [ ] 정리 실행 로그 확인 가능

## 비고

- Priority: P3
- Effort: human ~4h / CC ~30min
- 독립 작업 (의존성 없음)

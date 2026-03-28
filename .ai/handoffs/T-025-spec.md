Author: Claude (PM)

# T-025: 미사용 Tag/MatchResultTag 테이블 정리

## 배경

T-012 리팩터링으로 태그 관련 UI(settings/tags, tag-selector)가 제거되었지만,
Prisma 스키마에 `Tag`, `MatchResultTag` 모델과 DB 테이블이 남아있음.
사용되지 않는 테이블이 스키마를 복잡하게 만들고 혼란을 줄 수 있음.

## 목표

미사용 Tag 관련 모델과 테이블을 깔끔하게 제거.

## 작업 항목

- [ ] Prisma 스키마에서 `Tag`, `MatchResultTag` 모델 삭제
- [ ] `prisma migrate dev`로 마이그레이션 생성 (`DROP TABLE "MatchResultTag"`, `DROP TABLE "Tag"`)
- [ ] 시드 데이터(`prisma/seed.mjs`)에서 태그 관련 코드 제거
- [ ] 코드베이스에서 Tag/MatchResultTag 참조 전수 검색 및 제거
  - import, type 참조, 주석 등
- [ ] 문서 업데이트: ARCHITECTURE.md 등에서 Tag 관련 설명 제거

## 영향 범위

- `prisma/schema.prisma` — Tag, MatchResultTag 모델 삭제
- `prisma/seed.mjs` — 태그 시드 코드 제거
- 마이그레이션 1개 추가 (DROP TABLE)
- 문서 업데이트

## 수용 기준

- [ ] `Tag`, `MatchResultTag` 테이블이 DB에서 삭제됨
- [ ] Prisma 스키마에 Tag 관련 모델 없음
- [ ] `npm run build` 통과
- [ ] 코드베이스에 Tag/MatchResultTag 참조 없음 (grep 검증)

## 비고

- Priority: P3
- Effort: human ~2h / CC ~15min
- 독립 작업 (의존성 없음)
- DB 마이그레이션 필요 → DIRECT_URL 환경에서 실행

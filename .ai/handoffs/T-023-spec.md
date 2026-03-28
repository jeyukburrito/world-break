Author: Claude (PM)

# T-023: Server Action 통합 테스트 도입

## 배경

현재 프로젝트에 테스트 프레임워크가 없음. `npm run build` 통과가 유일한 검증 수단.
T-013 리팩터링에서 순수 함수(Zod, CSV) 테스트는 추가되었지만, Server Action의 DB 연동 테스트는 미설정.

## 목표

핵심 Server Action의 DB 연동 동작을 자동 검증할 수 있는 테스트 인프라 구축.

## 작업 항목

### 1단계: 테스트 인프라 설정

- [ ] Vitest 설치 + Next.js Server Action 테스트 환경 구성
- [ ] `vitest.config.ts` 생성 (path alias `@/*` 매핑)
- [ ] `package.json`에 `test` 스크립트 추가
- [ ] 테스트용 DB 연결 설정 (`.env.test` 또는 환경변수 분기)

### 2단계: 핵심 경로 테스트 작성

- [ ] `createMatchResult` — 정상 생성, 필수 필드 누락, 잘못된 userId
- [ ] `updateMatchResult` — 정상 수정, 타인 데이터 수정 시도 차단
- [ ] `deleteMatchResult` — 정상 삭제, 타인 데이터 삭제 시도 차단
- [ ] `deleteAccount` — CASCADE 삭제 동작 검증
- [ ] 트랜잭션 롤백 동작 검증 (부분 실패 시 전체 롤백)
- [ ] userId 스코핑이 실제로 타인 데이터를 차단하는지 검증

### 3단계: CI 연동

- [ ] CLAUDE.md 테스트 섹션 업데이트 (현재 "테스트 프레임워크 미설정" 삭제)
- [ ] `npm run test` 명령어 문서화

## 영향 범위

- 신규 파일: `vitest.config.ts`, `__tests__/` 디렉토리
- 기존 코드 변경 없음 (테스트만 추가)

## 수용 기준

- [ ] `npm run test` 로 테스트 실행 가능
- [ ] 핵심 Server Action 4개의 정상/비정상 경로 테스트 통과
- [ ] userId 스코핑 테스트가 타인 데이터 접근 차단 검증

## 비고

- Priority: P2
- Effort: human ~1일 / CC ~30min
- T-013 리팩터링 완료 상태이므로 바로 착수 가능

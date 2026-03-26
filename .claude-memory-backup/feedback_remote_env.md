---
name: 원격 환경 제약사항
description: 사용자가 원격 환경에서 작업할 때의 제약 — Codex 핸드오프 불가, DB 직접 접근 불가, Vercel 대시보드 확인 어려움
type: feedback
---

사용자가 원격 환경(밖)에서 작업할 때는:
- Codex CLI 핸드오프 불가 → Claude가 직접 구현
- DB 환경변수(DIRECT_URL) 없음 → Prisma migrate 로컬 실행 불가
- Vercel 대시보드 직접 확인 어려움

**Why:** 2026-03-22 세션에서 "현재 원격 환경이니 코덱스에게 티켓을 넘겨서 작업하긴 어려울 것 같아요" + "밖이라서 불가한데"라고 언급.

**How to apply:** 원격 환경임을 인지하면, Codex 핸드오프 대신 직접 구현하고, DB 명령은 Vercel 빌드 파이프라인에 위임하는 방식을 사용.

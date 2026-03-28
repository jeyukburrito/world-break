Author: Gemini (Code Reviewer)

# World Break — CLI Master Index

본 프로젝트는 여러 AI 에이전트(Claude, Codex, Gemini)가 협업하는 환경이다. 각 CLI는 작업 시작 전 이 인덱스를 참조하여 필요한 최신 컨텍스트를 확보해야 한다.

## 1. Documentation Map (문서 지도)

| 상황 | 참조 문서 |
|------|-----------|
| **최초 프로젝트 탐색** | `docs/ARCHITECTURE.md` (구조), `.ai/PRD.md` (목표) |
| **코드 구현 및 생성** | `.ai/STANDARDS.md` (필수 규칙), `prisma/schema.prisma` |
| **협업 및 워크플로우** | `.ai/PROJECT_RULES.md` (역할 및 통신 규약) |
| **현재 작업 상태 확인** | `.ai/TASKS.md` (티켓 목록) |
| **최근 작업 히스토리** | `.ai/daily/` (일일 로그 및 세션 보고서) |
| **Codex sub-agent 활용** | `.ai/CODEX_GUIDE.md` |

## 2. CLI Core Mandates

### 2-1. Data Privacy & Integrity
- **userId Isolation**: 모든 DB 접근 시 `userId` 필터링 필수.
- **Secrets Protection**: `.env` 파일 및 API Key 노출 절대 금지.

### 2-2. Communication Protocol
- 모든 CLI 간의 의사소통은 `.ai/` 내의 마크다운 파일을 통해 **비동기적**으로만 이루어진다.
- 파일 상단에 `Author: [Role/Name]` 기재 필수.

## 3. Tech Stack Reference
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase Postgres + Prisma 6
- **Auth**: Supabase Auth + Guest Mode (Cookie-based)
- **UI System**: Tactical Editorial (Material You Inspired)

---
*Last Updated: 2026-03-22*

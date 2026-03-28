Author: Claude (PM/QA)

# Plan: Agent 협업 문서 구조 강화 — Context & Collaboration

## 배경

현재 `.ai/` 디렉토리는 티켓 흐름(spec → result → review)은 잘 정의되어 있으나, 다음 두 가지 영역이 부족하다:

1. **Session Context Management**: 새 세션/에이전트가 시작할 때 "지금 어디까지 왔는가"를 즉시 파악하는 표준 진입점이 없음
2. **Agent-to-Agent Context Passing**: 각 에이전트가 다음 에이전트에게 필요한 컨텍스트를 어떻게 전달하는지 명확한 프로토콜 부재

---

## 목표

Agent(Claude, Codex, Gemini, 사용자)가 어느 세션에서든 최소한의 마찰로 컨텍스트를 로드하고, 작업을 이어받을 수 있도록 문서 구조를 개선한다.

---

## 현재 구조 (AS-IS)

```
.ai/
├── PRD.md               ← 제품 요구사항
├── TASKS.md             ← 티켓 상태 목록
├── PROJECT_RULES.md     ← 역할 분담 + 운영 규칙
├── STANDARDS.md         ← 기술 표준
├── CODEX_GUIDE.md       ← Codex sub-agent 지침
├── handoffs/
│   ├── README.md
│   └── T-xxx-spec.md / T-xxx-result.md
└── daily/
    ├── T-xxx-review-gemini.md
    └── YYYY-MM-DD-{agent}.md
```

**Pain Points:**
- 새 세션 시작 시 에이전트가 읽어야 할 파일이 명시되지 않음 (TASKS.md + PROJECT_RULES.md + 관련 spec 등 여러 파일 직접 파악 필요)
- 세션 종료 후 "다음 세션이 알아야 할 것"을 기록하는 표준 없음
- CODEX_GUIDE.md가 sub-agent 호출 규칙만 다루고, 컨텍스트 드리프트 방지 방법은 없음
- Gemini 리뷰 라우팅 조건이 PROJECT_RULES.md에 산재 (명확한 체크리스트 없음)
- 각 티켓 result가 완료되었어도 "이 결정이 왜 내려졌는지" 결정 로그가 없음

---

## 제안 구조 (TO-BE)

### 1. `.ai/CONTEXT.md` — Session Bootstrap Document (신규)

모든 에이전트가 새 세션 시작 시 **가장 먼저** 읽는 단일 진입점.

```markdown
# CONTEXT.md — 현재 프로젝트 상태 스냅샷

## Last Updated: YYYY-MM-DD (세션 종료 시 업데이트)

## 현재 상태 요약
- 마지막 완료 티켓: T-030
- 진행 중: (없음 or T-xxx)
- 다음 우선순위: T-026 (spec 작성 필요)
- 최근 주요 결정: (간단한 3줄 이하)

## 빠른 참조
- 티켓 목록: TASKS.md
- 역할 규칙: PROJECT_RULES.md
- 기술 표준: STANDARDS.md

## 이번 세션 시작 전 확인사항
- [ ] 진행 중인 티켓이 있으면 result 확인
- [ ] 막힌 티켓 있으면 blocked 사유 확인
- [ ] 최근 review 반영 여부 확인
```

### 2. `.ai/PROJECT_RULES.md` 개선 — 세션 프로토콜 섹션 추가

기존 내용 유지 + 다음 섹션 추가:

```markdown
## 세션 시작 프로토콜 (모든 에이전트 공통)

1. CONTEXT.md 읽기 (현재 상태 파악)
2. TASKS.md에서 in-progress/blocked 티켓 확인
3. 해당 티켓 spec + result 읽기
4. 작업 시작 전 계획 명시

## 세션 종료 프로토콜 (Claude 담당)

1. CONTEXT.md 업데이트 (Last Updated, 현재 상태)
2. TASKS.md 상태 동기화
3. 미완료 작업은 next 섹션에 기록
```

### 3. `.ai/CODEX_GUIDE.md` 개선 — Context Drift 방지 규칙 추가

```markdown
## 컨텍스트 드리프트 방지

- spec 내용이 불명확하면 구현 중단 → result에 "BLOCKED: spec 질문" 기록
- 범위를 벗어나는 발견 사항은 구현하지 말고 result의 "Scope Creep 발견" 섹션에만 기록
- 세션이 길어져 컨텍스트가 흐릿해지면 spec을 다시 읽고 재확인
- sub-agent에게 넘길 때는 반드시 티켓 ID + 소유 파일 범위 + CONTEXT.md 요약을 전달
```

### 4. `.ai/handoffs/README.md` 개선 — Decision Log 섹션 추가

result 파일에 선택적 섹션 추가:

```markdown
## Decision Log (선택)

| 결정 | 대안 | 이유 |
|------|------|------|
| Prisma $queryRaw 사용 | ORM 집계 | 복잡 집계 성능 |
```

### 5. `.ai/daily/README.md` 개선 — Gemini 리뷰 체크리스트 명확화

```markdown
## Gemini 리뷰 필수/선택 기준

| 조건 | 리뷰 필요? |
|------|----------|
| Codex 구현 (모든 feature) | 필수 |
| Claude 직접 구현 (원격 환경) | 필수 |
| Claude 직접 구현 (≤3파일, 즉각 수정) | 권장 (선택) |
| Config/문서 변경만 | 불필요 |
| 버그픽스 단독 | 권장 (선택) |
```

---

## 구현 범위

| 파일 | 변경 유형 | 담당 |
|------|----------|------|
| `.ai/CONTEXT.md` | 신규 생성 | Claude |
| `.ai/PROJECT_RULES.md` | 세션 프로토콜 섹션 추가 | Claude |
| `.ai/CODEX_GUIDE.md` | 컨텍스트 드리프트 방지 추가 | Claude |
| `.ai/handoffs/README.md` | Decision Log 섹션 추가 | Claude |
| `.ai/daily/README.md` | Gemini 리뷰 체크리스트 추가 | Claude |
| `CLAUDE.md` | 세션 시작 시 CONTEXT.md 읽기 추가 | Claude |

총 6개 파일, 모두 문서 변경 — Claude 직접 구현 범위 해당

---

## 범위 외

- 자동화 (cron, webhook 등으로 CONTEXT.md 자동 업데이트)
- 기존 티켓 히스토리에 소급 적용
- CLAUDE.md 행동 지침의 구현 규칙 변경

---

## Done Definition

- [ ] `.ai/CONTEXT.md` 존재하고 현재 상태 반영
- [ ] `.ai/PROJECT_RULES.md` 세션 시작/종료 프로토콜 포함
- [ ] `.ai/CODEX_GUIDE.md` 컨텍스트 드리프트 방지 규칙 포함
- [ ] `.ai/handoffs/README.md` Decision Log 포맷 포함
- [ ] `.ai/daily/README.md` Gemini 리뷰 기준 표 포함
- [ ] `CLAUDE.md` 세션 시작 체크에 CONTEXT.md 읽기 포함
- [ ] 모든 변경 파일 Author 헤더 유지

---

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | 결정 | 원칙 | 근거 | 기각 |
|---|-------|------|------|------|------|
| 1 | CEO | Approach C 선택 (AGENTS.md + CONTEXT.md 방식) | P4+P5 | AGENTS.md가 Codex 진입점으로 이미 사용 중; 중복 방지 | Approach B (PROJECT_RULES 6파일) |
| 2 | CEO | Expansion E1~E5 포함 (hook, DRY, Decision Log, drift, T-NEXT) | P1+P2 | blast radius 내 docs only, CC 비용 minimal | 일부만 포함 |
| 3 | CEO | AGENTS.md 강화 (Codex 진입점으로) | P5 | 기존 구조 활용, 새 파일 최소화 | 신규 파일 추가 |
| 4 | CEO | Gemini 라우팅 테이블 제거 | P4 | daily/README.md에 이미 존재; 중복 | 유지 |
| 5 | ENG | TASKS.md 헤더 + result "Next Agent Context" 체인 구조 확정 | P5+P1 | 자기유지적, central state file 불필요 | CONTEXT.md 독립 파일 |
| 6 | ENG | Edge case fallback 명시 (헤더=hint, 목록=authoritative) | P5 | 명시적 fallback으로 stale 위험 완화 | 묵시적 처리 |

---

## 기대 효과

1. 새 세션 시작 시 컨텍스트 로드: TASKS.md 헤더 1블록으로 충분
2. Codex가 scope creep 발견 시 구현 돌진 대신 명시적 BLOCKED 기록
3. 결정 근거가 result에 남아 미래 세션에서 추적 가능
4. result "Next Agent Context"로 컨텍스트가 체인으로 자동 전파

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | 범위 & 전략 | 1 | clean | CONTEXT.md→TASKS.md 헤더로 변경, 6파일→4파일 |
| Codex Review | `/codex review` | 독립 2차 의견 | 0 | skipped | user preference |
| Eng Review | `/plan-eng-review` | 아키텍처 & 테스트 | 1 | clean | 문서 DRY 확인, architecture chain 확정 |
| Design Review | `/plan-design-review` | UI/UX | 0 | skipped | no UI scope |

**Dual Voices — CEO:** subagent-only (Codex skip). Consensus 2/6 confirmed, 4 disagree.
**Key cross-phase finding:** CONTEXT.md standalone 파일 stale 위험 — CEO와 Eng 양쪽에서 독립적으로 확인.

**VERDICT:** APPROVED — TASKS.md 헤더 + Result Chain 구조로 구현 완료.

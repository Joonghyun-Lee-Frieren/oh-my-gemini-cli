# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>Gemini CLI를 위한 컨텍스트 엔지니어링 기반 멀티 에이전트 하네스</strong>
</p>

<h3 align="center">
  <em>Gemini thinks. OmG orchestrates.</em>
</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/oh-my-gemini-cli"><img src="https://img.shields.io/npm/v/oh-my-gemini-cli.svg" alt="npm version"></a>
  <a href="https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20-green.svg" alt="Node.js"></a>
</p>

<p align="center">
  <a href="https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/">Landing Page</a>
</p>

<p align="center">
  <a href="../README.md">English</a> | <strong>한국어</strong> | <a href="./README_ja.md">日本語</a> | <a href="./README_zh.md">中文</a> | <a href="./README_es.md">Español</a> | <a href="./README_pt.md">Português</a> | <a href="./README_fr.md">Français</a> | <a href="./README_nl.md">Nederlands</a> | <a href="./README_pl.md">Polski</a> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <a href="./README_de.md">Deutsch</a> | <a href="./history_ko.md">변경 이력</a>
</p>





> "Claude Code의 핵심 경쟁력은 Opus나 Sonnet 엔진이 아닙니다. Claude Code 그 자체예요. 놀랍지만 Gemini도 Claude Code를 붙이면 잘 돌아갑니다."
>
> — **신정규 (CEO of Lablup Inc.)**, *YouTube 채널 인터뷰 중*

*이 프로젝트는 위 통찰에서 시작되었습니다: "그렇다면 Gemini CLI에도 그 하네스를 입혀보자."*





> **[Gemini CLI](https://github.com/google-gemini/gemini-cli)**를 단일 세션 도구에서
> **컨텍스트 엔지니어링 기반의 멀티 에이전트 오케스트레이션 시스템**으로 확장합니다.





## 왜 oh-my-gemini-cli인가?

Gemini CLI는 강력합니다. 1M 토큰 컨텍스트 윈도우, Google Search 그라운딩, MCP 지원까지.
하지만 대규모 작업에서는 구조가 필요합니다.

OmG는 다음을 추가합니다:

- **멀티 에이전트 오케스트레이션**: 작업 유형에 따라 여러 에이전트를 동시 생성하고 협업시킵니다
- **컨텍스트 엔지니어링**: 프롬프트 캐싱 최적화로 비용과 지연을 최소화합니다
- **실시간 TUI 대시보드**: 에이전트/작업/로그/HUD 메트릭을 한 화면에서 실시간 확인합니다
- **듀얼 모델 전략**: Gemini Pro(계획)와 Flash(구현)를 자동으로 분배합니다
- **외부 LLM 지원**: OAuth/API로 Claude, GPT 등 다른 모델도 연결 가능합니다
- **원격 제어**: Telegram/Discord 봇으로 어디서든 세션을 모니터링하고 제어합니다

OmG는 포크가 아닌 애드온입니다. Gemini CLI의 네이티브 확장 포인트(MCP, 커스텀 명령어, GEMINI.md)만 사용합니다.

---

## 목차

- [빠른 시작](#빠른-시작)
- [핵심 개념: 컨텍스트 엔지니어링](#핵심-개념-컨텍스트-엔지니어링)
- [멀티 에이전트 시스템](#멀티-에이전트-시스템)
- [TUI 대시보드](#tui-대시보드)
- [모델 오케스트레이션](#모델-오케스트레이션)
- [에이전트 카탈로그](#에이전트-카탈로그)
- [스킬 카탈로그](#스킬-카탈로그)
- [커스텀 명령어](#커스텀-명령어)
- [Telegram / Discord 봇](#telegram--discord-봇)
- [설정](#설정)
- [CLI 명령어](#cli-명령어)
- [프로젝트 구조](#프로젝트-구조)
- [컨트리뷰션](#컨트리뷰션)
- [라이선스](#라이선스)

---

## 빠른 시작

### 요구사항

- macOS, Linux, 또는 Windows (WSL2 권장)
- Node.js >= 20
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) 설치 완료
- Gemini 인증 설정 완료 (Google 로그인, API Key, 또는 Vertex AI)

### 설치

```bash
# 권장: npm 미배포 상태에서도 동작하는 GitHub 설치
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# 선택: npm 레지스트리 패키지가 사용 가능한 환경이면
# npm install -g oh-my-gemini-cli

# 프로젝트에 셋업
omg setup

# 설치 상태 확인
omg doctor
```

> 참고: `npm install -g oh-my-gemini-cli`가 `404 Not Found`로 실패하면 위 GitHub 설치 명령을 사용하세요.

### npm 배포 전환 체크리스트

- npm 패키지 페이지와 `latest` dist-tag가 정상 공개되었는지 확인
- 깨끗한 환경에서 `npm install -g oh-my-gemini-cli` 설치 성공 검증
- 문서 기본 설치 명령을 GitHub 경로에서 npm 경로로 전환
- 문제 해결 섹션에는 GitHub 설치 경로를 대체안으로 유지

### LLM을 통한 자동 설치

다른 AI 에이전트(Cursor, Claude Code, Gemini CLI 등)에서 다음을 입력하세요:

```
oh-my-gemini-cli를 설치하고 설정해주세요:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### 첫 번째 세션

```bash
# 기본 실행 (Gemini CLI + TUI HUD)
omg

# 멀티 에이전트 팀 모드
omg team "OAuth 인증 기능을 구현해줘"

# 특정 에이전트로 작업
omg --agent architect "현재 코드베이스의 아키텍처를 분석해줘"
```

---

## 핵심 개념: 컨텍스트 엔지니어링

> **"Cache Rules Everything Around Me"**
> — 에이전트 시대에도 캐시가 전부입니다.

oh-my-gemini-cli의 핵심 철학은 **컨텍스트 엔지니어링**입니다.
Claude Code 팀이 공유한 [프롬프트 캐싱 교훈](https://x.com/trq212/status/2024574133011673516)에서 영감을 받아,
Gemini CLI 환경에 맞게 적용했습니다.

### 프롬프트 캐싱이란?

장기 실행 에이전트에서 **프롬프트 캐싱**은 이전 라운드트립의 연산을 재사용하여
지연 시간과 비용을 획기적으로 줄이는 핵심 기술입니다.
캐싱은 **접두사(Prefix) 매칭** 방식으로 작동합니다.

```
요청 구조 (캐싱 최적화 순서):

┌──────────────────────────────────┐  ← 전역 캐싱 (모든 세션)
│  정적 시스템 프롬프트             │
│  도구 정의 (MCP 포함)            │
├──────────────────────────────────┤  ← 프로젝트 캐싱
│  GEMINI.md (프로젝트 컨텍스트)   │
├──────────────────────────────────┤  ← 세션 캐싱
│  세션 컨텍스트                    │
├──────────────────────────────────┤  ← 매 턴 변경
│  대화 메시지                      │
└──────────────────────────────────┘
```

### 5가지 핵심 원칙

#### 1. 접두사 안정성 유지

접두사의 어떤 부분이든 변경되면 그 이후의 모든 캐시가 무효화됩니다.
OmG는 정적 콘텐츠를 앞에, 동적 콘텐츠를 뒤에 배치하여 캐시 적중률을 극대화합니다.

```
변경 금지 영역   │  시스템 프롬프트, 도구 정의
─────────────────┤
저빈도 변경      │  GEMINI.md, 프로젝트 설정
─────────────────┤
고빈도 변경      │  대화 메시지, 도구 결과
```

#### 2. 도구 집합 불변 원칙

도구를 추가하거나 제거하면 캐시가 파괴됩니다. OmG는 이를 방지하기 위해:

- **Plan Mode**: 도구를 제거하는 대신 `EnterPlanMode` / `ExitPlanMode`를 도구로 구현
- **지연 로딩**: MCP 도구를 경량 스텁으로 유지하고, 필요 시 `ToolSearch`로 전체 스키마 로드

```
모든 도구 항상 포함 (캐시 안정)
├── read_file       ← 항상 활성
├── write_file      ← 항상 활성
├── EnterPlanMode   ← Plan Mode 진입 도구
├── ExitPlanMode    ← Plan Mode 종료 도구
├── mcp_tool_stub_1 ← 경량 스텁 (필요시 로드)
└── mcp_tool_stub_2 ← 경량 스텁 (필요시 로드)
```

#### 3. 모델 전환 대신 서브에이전트

프롬프트 캐시는 **모델별로 고유**합니다. 대화 중 모델을 전환하면 새 모델용 캐시를
처음부터 구축해야 하므로, 오히려 비용이 증가합니다.

OmG의 해결책: **서브에이전트 패턴**

```
메인 세션 (Gemini Pro)
  │
  ├─→ "이 작업을 구현해줘" (핸드오프 메시지)
  │     └─→ 서브에이전트 (Gemini Flash) ─→ 결과 반환
  │
  └─→ 메인 세션 계속 (Pro 캐시 유지)
```

#### 4. 캐시 안전 컴팩션

컨텍스트 윈도우를 초과하면 대화를 요약해야 합니다.
단순 요약은 부모 대화의 캐시 접두사와 일치하지 않아 전액 비용이 발생합니다.

OmG의 해결책: **Cache-Safe Forking**

```
부모 대화와 동일한 접두사 사용
├── 동일한 시스템 프롬프트     ← 캐시 적중
├── 동일한 도구 정의           ← 캐시 적중
├── 동일한 컨텍스트            ← 캐시 적중
├── 부모의 대화 메시지         ← 캐시 적중
└── + 컴팩션 프롬프트 (새로운) ← 새 토큰은 여기만
```

#### 5. 시스템 메시지로 정보 업데이트

프롬프트를 직접 수정하면 캐시가 무효화됩니다.
대신 다음 턴의 메시지에 `<system-reminder>` 태그로 업데이트 정보를 삽입합니다.

```
캐시 파괴하는 방법 (나쁜 예):
  시스템 프롬프트에 "현재 시간: 15:30" 삽입 → 전체 캐시 무효화

캐시 보존하는 방법 (OmG 방식):
  다음 user message에 "<system-reminder>현재 15:30</system-reminder>" 추가
```

### 캐시 모니터링

OmG는 캐시 적중률을 **업타임처럼 모니터링**합니다.
수 퍼센트의 캐시 미스도 비용과 지연에 극적인 영향을 미치므로 인시던트로 취급합니다.

```bash
# 캐시 적중률 확인
omg status --cache

# 출력 예시:
# Cache Hit Rate: 94.2%  (target: >90%)
# Cache Misses Today: 12
# Estimated Savings: $4.82
```

---

## 멀티 에이전트 시스템

OmG는 작업 유형에 따라 여러 에이전트를 동시에 생성하고, 각 에이전트가 독립적으로 작업을 수행합니다.

### 아키텍처

```
사용자 작업 요청
    │
    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│ TaskRouter   │───▶│ TaskQueue    │───▶│ AgentPool        │
│ task classify│    │ priority     │    │ max 6 parallel   │
└──────────────┘    └──────────────┘    └─────────┬────────┘
                                                  │
                    ┌─────────────────────────────┤
                    │              │               │
                    ▼              ▼               ▼
              ┌──────────┐  ┌──────────┐  ┌──────────────┐
              │ Architect │  │ Executor │  │ Executor #2  │
              │ (Pro)     │  │ #1(Flash)│  │ (Flash)      │
              └─────┬─────┘  └────┬─────┘  └──────┬───────┘
                    │              │               │
                    ▼              ▼               ▼
              ┌──────────────────────────────────────────┐
              │              EventBus                     │
              ├──────────┬──────────────┬────────────────┤
              ▼          ▼              ▼                ▼
          Dashboard   omg_state     Telegram        Discord
          (ASCII TUI)  (MCP)         Bot             Bot
```

### 에이전트 유형

| 에이전트 | 모델 | 역할 |
|---------|------|------|
| **Architect** | Gemini Pro | 아키텍처 분석, 설계 결정, 의존성 파악 |
| **Planner** | Gemini Pro | 작업 분해, 실행 계획 수립, 우선순위 결정 |
| **Executor** | Gemini Flash | 코드 생성, 파일 편집, 리팩토링 (병렬 N개) |
| **Reviewer** | Gemini Pro | 코드 리뷰, 품질 검증, 보안 체크 |
| **Debugger** | Gemini Pro | 에러 분석, 디버깅, 테스트 실패 수정 |
| **Researcher** | Gemini Pro | 웹 검색, 문서 조사, 라이브러리 분석 |
| **Quick** | Gemini Flash | 단순 작업 (타이포 수정, 포맷팅, 소규모 변경) |

### 에이전트 생명주기

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (에이전트 풀로 반환)
                         │
                         └──▶ failed ──▶ retry (최대 3회)
                                           └──▶ escalate (상위 에이전트에 보고)
```

### 작업 파이프라인

`omg team` 실행 시 자동으로 구성되는 파이프라인:

```
Phase 1: 분석          Phase 2: 구현           Phase 3: 검증
┌──────────────┐      ┌──────────────┐        ┌──────────────┐
│ Planner(Pro) │─┐    │ Executor#1   │──┐     │ Reviewer     │
│ 작업 분해    │ │    │ (Flash)      │  │     │ (Pro)        │
└──────────────┘ │    ├──────────────┤  │     ├──────────────┤
┌──────────────┐ ├──▶ │ Executor#2   │──├───▶ │ Debugger     │
│ Architect    │ │    │ (Flash)      │  │     │ (Pro)        │
│ (Pro) 설계   │─┘    ├──────────────┤  │     └──────────────┘
└──────────────┘      │ Executor#3   │──┘
                      │ (Flash)      │
                      └──────────────┘
                      (병렬 실행)
```

### 사용 예시

```bash
# 기본 팀 모드 (자동 에이전트 할당)
omg team "OAuth 인증 기능 구현"

# 에이전트 수 지정
omg team --workers 4 "전체 API 리팩토링"

# 특정 에이전트만 사용
omg --agent executor "이 함수를 TypeScript로 변환해줘"

# 팀 상태 확인
omg team status

# 팀 종료
omg team shutdown
```

---

## TUI 대시보드

Ink (React for CLI) 기반의 실시간 터미널 대시보드입니다.  
기본 명령(`omg`, `omg launch`, `omg team start`, `omg status`)은 기본적으로 TUI를 실행합니다.
모든 에이전트의 작업 상태를 한 화면에서 확인할 수 있습니다.

### 대시보드 미리보기

정렬 안정성을 위해 박스 내부는 ASCII 고정폭 텍스트를 사용합니다.
(한글 설명은 코드블록 바깥 문장/표에서 제공)

```
+----------------------------------------------------------------------+
| OmG  oh-my-gemini-cli   TIME 03:42   PARTY [####--] 4/6              |
+--------------------------------+-------------------------------------+
| PARTY MEMBERS                  | QUEST LOG                           |
| Active: 4 / Total: 6           | 2/7 quests cleared                  |
| Planner   [gemini-pro]   ATK   | [DONE ] analyze-auth   -> Plan      |
| Architect [gemini-pro]   ATK   | [DONE ] design-schema  -> Arch      |
| Exec#1    [gemini-flash] ATK   | [RUN  ] impl-oauth     -> Exec#1    |
| Exec#2    [gemini-flash] ATK   | [RUN  ] impl-token     -> Exec#2    |
| Exec#3    [gemini-flash] ATK   | [RUN  ] impl-routes    -> Exec#3    |
| Reviewer  [gemini-pro]   IDLE  | [WAIT ] code-review    -> Review    |
+--------------------------------+-------------------------------------+
| BATTLE LOG                                                           |
| [03:41] Exec#1 wrote oauth/callback.ts                               |
| [03:42] Planner finished task decomposition (5 subtasks)             |
+----------------------------------------------------------------------+
| CACHE [#####-] 94% | TOKENS 12.4k/1M | COST -$0.03                   |
| A:quit B:pause X:resume Y:detail SELECT:tg-sync                      |
+----------------------------------------------------------------------+
```

### 에이전트 상태 아이콘 (Retro Game Style)

| 아이콘 | 상태 | RPG 표시 | 설명 |
|--------|------|----------|------|
| `♦` | 실행 중 | `ATK` | 전투 중 (스피너 애니메이션 `◜◝◞◟`) |
| `★` | 완료 | `WIN` | 승리! (초록색) |
| `✘` | 실패 | `KO` | 전투 불능 (빨간색) |
| `◇` | 대기 | `ZZZ` | 휴식 중 |
| `▶` | 할당됨 | `RDY` | 출격 준비 완료 |

### 에이전트 스프라이트

| 에이전트 | 스프라이트 | 모델 태그 |
|---------|-----------|---------|
| Architect | 🏰 | `[gemini-pro]` (골드) |
| Planner | 📜 | `[gemini-pro]` (골드) |
| Executor | ⚔️ | `[gemini-flash]` (시안) |
| Reviewer | 🛡️ | `[gemini-pro]` (골드) |
| Debugger | 🔧 | `[gemini-pro]` (골드) |
| Researcher | 🔮 | `[gemini-pro]` (골드) |
| Quick | ⚡ | `[gemini-flash]` (시안) |

### 시작 애니메이션

레트로 게임 부팅 화면 스타일:

```
Frame 1:     · · ·

Frame 2:     ░▒▓█ LOADING █▓▒░

Frame 3:     ╔══════════════════════════════════╗
             ║  ◆ oh-my-gemini-cli ◆            ║
             ║  ░▒▓ CONTEXT QUEST v0.1.2 ▓▒░    ║
             ╚══════════════════════════════════╝

Frame 4:     ╔══════════════════════════════════╗
             ║  ◆ oh-my-gemini-cli ◆            ║
             ║  ░▒▓ CONTEXT QUEST v0.1.2 ▓▒░    ║
             ║                                    ║
             ║  ★ Gemini thinks. OmG orchestrates. ★  ║
             ╚══════════════════════════════════╝
                  PRESS ANY KEY TO START
```

### 키보드 단축키

| 키 | 동작 |
|----|------|
| `q` / `Ctrl+C` | 종료 |
| `p` | 모든 에이전트 일시 중지 |
| `r` | 재개 |
| `Tab` / `0` / `1` / `2` / `3` | HUD 화면 전환 (전체/에이전트/작업/로그) |
| `a` / `f` | 자동 새로고침 주기 변경 / 즉시 새로고침 |
| `i` / `Esc` | launch 모드 전용: 입력 브리지 켜기/끄기 |

---

## 모델 오케스트레이션

### 듀얼 모델 전략

OmG의 기본 전략은 **계획은 Pro, 실행은 Flash**입니다.

```
┌─────────────────────────────────────────┐
│           Gemini Pro                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ │
│  │Architect│ │ Planner  │ │ Reviewer │ │
│  │         │ │          │ │          │ │
│  └─────────┘ └──────────┘ └──────────┘ │
│  깊은 추론, 아키텍처, 코드 리뷰         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Gemini Flash                   │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Executor#1│ │Executor#2│ │  Quick  │ │
│  │          │ │          │ │         │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│  빠른 코드 생성, 파일 편집, 단순 작업    │
└─────────────────────────────────────────┘
```

### 외부 LLM 연결

Gemini 이외의 모델도 사용할 수 있습니다:

**OAuth 연결**:
```bash
# Claude 연결 (OAuth)
omg config set external.claude.oauth true
omg auth claude

# GPT 연결 (API Key)
omg config set external.openai.api_key "sk-..."
```

**설정 파일** (`~/.gemini/omg-settings.json`):
```json
{
  "models": {
    "planner": "gemini-3.1-pro",
    "executor": "gemini-3.1-flash",
    "researcher": "claude-sonnet-4"
  },
  "external": {
    "claude": {
      "oauth": true
    },
    "openai": {
      "api_key": "sk-..."
    }
  }
}
```

---

## 에이전트 카탈로그

Gemini CLI 내부에서 `/prompts:이름` 형식으로 사용합니다.

| 에이전트 | 명령어 | 설명 |
|---------|--------|------|
| Architect | `/prompts:architect` | 아키텍처 분석, 설계 결정, 의존성 그래프 |
| Planner | `/prompts:planner` | 작업 분해, 실행 계획, 마일스톤 설정 |
| Executor | `/prompts:executor` | 코드 생성 및 편집, 리팩토링 |
| Reviewer | `/prompts:reviewer` | 코드 리뷰, 보안/성능/품질 체크 |
| Debugger | `/prompts:debugger` | 에러 분석, 스택 트레이스 해석, 수정 |
| Researcher | `/prompts:researcher` | 웹 검색, 라이브러리 비교, 문서 분석 |
| Quick | `/prompts:quick` | 타이포, 포맷팅, 소규모 변경 |

### 사용 예시

```
/prompts:architect "현재 프로젝트의 인증 경계를 분석해줘"
/prompts:planner "OAuth 기능 구현 계획을 세워줘"
/prompts:executor "login 페이지에 입력 검증을 구현해줘"
```

---

## 스킬 카탈로그

Gemini CLI 내부에서 `$스킬명` 형식으로 사용합니다.

| 스킬 | 트리거 | 설명 |
|------|--------|------|
| plan | `$plan` | Pro 기반 전략적 계획 수립 |
| execute | `$execute` | Flash 기반 빠른 구현 |
| team | `$team` | 멀티 에이전트 팀 오케스트레이션 |
| research | `$research` | 병렬 웹 리서치 및 문서 분석 |
| context-optimize | `$context-optimize` | 컨텍스트 윈도우 최적화 |

### 사용 예시

```
$plan "이 프로젝트를 마이크로서비스로 분리하는 계획을 세워줘"
$team 3:executor "TypeScript 마이그레이션을 병렬로 진행해줘"
$research "Gemini API의 스트리밍 지원 현황을 조사해줘"
```

---

## 커스텀 명령어

TOML 형식의 커스텀 명령어를 지원합니다.

**위치:**
- 전역: `~/.gemini/commands/*.toml`
- 프로젝트: `.gemini/commands/*.toml`

### 내장 명령어

**`/omg:status`** - 현재 에이전트 상태 조회
```toml
description = "OmG 에이전트 상태를 조회합니다"
prompt = """
현재 활성 에이전트 상태를 확인하고 요약해주세요.
!{omg status --json}
"""
```

**`/omg:optimize`** - 컨텍스트 최적화 실행
```toml
description = "컨텍스트 캐시를 최적화합니다"
prompt = """
현재 컨텍스트 캐시 상태를 분석하고 최적화 방안을 제안해주세요.
캐시 적중률: !{omg status --cache --json}
"""
```

---

## Telegram / Discord 봇

원격에서 OmG 세션을 모니터링하고 제어할 수 있습니다.

### Telegram 설정

```bash
# Telegram Bot 토큰 설정
omg config set bot.telegram.token "YOUR_BOT_TOKEN"

# 봇 시작
omg bot telegram start
```

### Discord 설정

```bash
# Discord Bot 토큰 설정
omg config set bot.discord.token "YOUR_BOT_TOKEN"

# 봇 시작
omg bot discord start
```

### 봇 명령어

| 명령어 | 설명 |
|--------|------|
| `/status` | 현재 에이전트 상태 조회 |
| `/agents` | 활성 에이전트 목록 |
| `/tasks` | 작업 파이프라인 현황 |
| `/pause` | 모든 에이전트 일시 중지 |
| `/resume` | 에이전트 재개 |
| `/screenshot` | 대시보드 스크린샷 전송 |
| `/send <메시지>` | Gemini CLI에 메시지 전송 |
| `/cache` | 캐시 적중률 조회 |

### 알림 설정

```json
{
  "bot": {
    "notifications": {
      "on_complete": true,
      "on_error": true,
      "on_review_needed": true,
      "cache_miss_alert": true,
      "interval_status": 300
    }
  }
}
```

---

## 설정

### 설정 파일 위치

- 전역: `~/.gemini/omg-settings.json`
- 프로젝트: `.gemini/omg-settings.json` (우선)

### 전체 설정 예시

```json
{
  "agents": {
    "max_concurrent": 6,
    "default_planner": "gemini-3.1-pro",
    "default_executor": "gemini-3.1-flash"
  },
  "models": {
    "architect": "gemini-3.1-pro",
    "planner": "gemini-3.1-pro",
    "executor": "gemini-3.1-flash",
    "reviewer": "gemini-3.1-pro",
    "debugger": "gemini-3.1-pro",
    "researcher": "gemini-3.1-pro",
    "quick": "gemini-3.1-flash"
  },
  "external": {
    "claude": { "oauth": true },
    "openai": { "api_key": "" }
  },
  "context": {
    "cache_monitoring": true,
    "cache_target_rate": 0.90,
    "compaction_strategy": "cache-safe",
    "prefix_stability": true
  },
  "dashboard": {
    "enabled": true,
    "refresh_interval": 500,
    "log_lines": 10,
    "theme": "retro"
  },
  "bot": {
    "telegram": { "token": "", "chat_id": "" },
    "discord": { "token": "", "channel_id": "" },
    "notifications": {
      "on_complete": true,
      "on_error": true
    }
  }
}
```

---

## CLI 명령어

```bash
omg                         # Gemini CLI 실행 + TUI HUD
omg setup                   # 프롬프트/스킬/설정/GEMINI.md 설치
omg doctor                  # 설치 상태 진단
omg update                  # 최신 버전으로 업데이트
omg team <설명>             # 멀티 에이전트 팀 모드
omg team status             # 팀 상태 확인
omg team shutdown           # 팀 종료
omg status                  # 활성 에이전트/캐시 상태
omg status --cache          # 캐시 적중률 상세
omg status --agents --json  # 에이전트 상태 JSON
omg status --tasks --json   # 작업 파이프라인 JSON
omg status --context --json # 컨텍스트 사용량 JSON
omg config set <key> <val>  # 설정 변경
omg config get <key>        # 설정 조회
omg bot telegram start      # Telegram 봇 시작
omg bot discord start       # Discord 봇 시작
omg help                    # 도움말
```

### 실행 플래그

```bash
--agent <type>     # 특정 에이전트로 실행 (architect, executor 등)
--workers <N>      # 팀 모드 워커 수 (기본: 4)
--model <model>    # 모델 지정
--no-dashboard     # TUI HUD 비활성화(기존 텍스트 CLI 모드)
--verbose          # 상세 로그
--dry-run          # 실제 실행 없이 계획만 표시
```

### Status JSON 필드

`omg status --json` 출력은 다음 섹션으로 구성됩니다.

- `agents`: `active`, `total`, 에이전트 목록
- `tasks`: `done`, `running`, `queued`, `failed`, 작업 목록
- `cache`: `hit_rate`, `hits`, `misses`, `target_rate`
- `cache_history`: 최근 캐시 스냅샷 목록
- `context`: `used`, `limit`, `percentage`, `compaction_threshold`

---

## 프로젝트 구조

```
oh-my-gemini-cli/
├── bin/omg.js                        # CLI 진입점
├── src/
│   ├── cli/                          # CLI 명령어
│   │   ├── index.ts                  # 메인 CLI 라우터
│   │   ├── setup.ts                  # omg setup
│   │   ├── doctor.ts                 # omg doctor
│   │   ├── launch.ts                 # omg (기본 실행)
│   │   └── team.ts                   # omg team
│   ├── agents/                       # 멀티 에이전트 시스템
│   │   ├── agent-pool.ts             # 에이전트 풀 관리
│   │   ├── agent-worker.ts           # 개별 에이전트 워커
│   │   ├── task-router.ts            # 작업 -> 에이전트 라우팅
│   │   ├── task-queue.ts             # 우선순위 기반 작업 큐
│   │   ├── agent-registry.ts         # 에이전트 유형 레지스트리
│   │   └── types.ts                  # 에이전트/태스크 타입
│   ├── dashboard/                    # Ink 기반 TUI 대시보드
│   │   ├── app.tsx                   # Ink 루트 컴포넌트
│   │   ├── components/               # UI 컴포넌트
│   │   ├── hooks/                    # React 훅
│   │   └── theme.ts                  # 레트로 컬러/스타일 테마
│   ├── context/                      # 컨텍스트 엔지니어링 엔진
│   ├── orchestrator/                 # 모델 오케스트레이션
│   ├── mcp/                          # MCP 서버
│   ├── bot/                          # Telegram/Discord 봇
│   └── shared/                       # 공통 유틸리티
├── prompts/                          # 에이전트 프롬프트 (.md)
├── skills/                           # 워크플로우 스킬 (SKILL.md)
├── commands/                         # 커스텀 명령어 (.toml)
├── templates/                        # GEMINI.md 및 설정 템플릿
├── docs/                             # 문서 (이 파일 포함)
│   ├── README_ko.md                  # 한국어 문서 (이 파일)
│   ├── history.md                    # 영문 변경 이력
│   ├── history_ko.md                 # 한국어 변경 이력
│   └── guide/
│       ├── installation.md           # LLM 자동 설치 가이드
│       └── context-engineering.md    # 컨텍스트 엔지니어링 가이드
├── package.json
├── tsconfig.json
├── README.md                         # English README
└── LICENSE                           # MIT
```

---

## `omg setup`이 하는 일

| 단계 | 설명 |
|------|------|
| 1 | `.omg/` 런타임 디렉토리 생성 (state, plans, logs) |
| 2 | 에이전트 프롬프트 설치 (`~/.gemini/prompts/` 또는 `.gemini/prompts/`) |
| 3 | 워크플로우 스킬 설치 |
| 4 | 커스텀 명령어 설치 (`~/.gemini/commands/`) |
| 5 | `settings.json`에 MCP 서버 등록 (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | 프로젝트 `GEMINI.md` 생성 (오케스트레이션 가이드 포함) |
| 7 | `omg-settings.json` 기본 설정 생성 |

---

## 기술 스택

- **런타임**: Node.js >= 20
- **언어**: TypeScript
- **TUI**: Ink 5 (React for CLI)
- **MCP**: `@modelcontextprotocol/sdk`
- **Telegram**: `telegraf`
- **Discord**: `discord.js`
- **빌드**: esbuild
- **테스트**: Vitest

---

## 영감을 받은 프로젝트

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Google의 오픈소스 AI 터미널 에이전트
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Claude Code를 위한 팀 중심 멀티 에이전트 오케스트레이션
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - OpenAI Codex CLI 하네스
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode 에이전트 하네스
- [Claude Code 프롬프트 캐싱 교훈](https://x.com/trq212/status/2024574133011673516) - 컨텍스트 엔지니어링 원리

---

## 컨트리뷰션

기여를 환영합니다! OmG는 MIT 라이선스로 자유롭게 사용 가능합니다.

- 버그 리포트 및 기능 제안
- 새로운 에이전트 프롬프트
- 새로운 스킬 및 커스텀 명령어
- 문서 개선
- Telegram/Discord 봇 기능 확장

## 라이선스

[MIT](../LICENSE)

## 문의

📧 kissdesty@gmail.com

---

<p align="center">
  <sub>Built with Gemini and the open source community</sub>
</p>

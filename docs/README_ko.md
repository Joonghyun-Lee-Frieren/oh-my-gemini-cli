# oh-my-gemini-cli (OmG)

[랜딩 페이지](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [변경 이력](./history.md)

[English](../README.md) | [日本語](./README_ja.md) | [Français](./README_fr.md) | [中文](./README_zh.md) | [Español](./README_es.md)

Gemini CLI를 위한 컨텍스트 엔지니어링 기반 멀티 에이전트 워크플로우 확장입니다.

> "Claude Code의 핵심 경쟁력은 Opus나 Sonnet 엔진이 아니라 Claude Code 자체다. Gemini도 그 하네스를 붙이면 꽤 잘 된다."
>
> - 신정규 (Lablup Inc. CEO), 유튜브 인터뷰 중

OmG는 Gemini CLI를 단일 세션 도구에서 구조화된 역할 기반 엔지니어링 워크플로우로 확장합니다.

## v0.3.0 핵심 업데이트

- 스테이지 기반 팀 파이프라인: `team-plan -> team-prd -> team-exec -> team-verify -> team-fix`
- 운영 모드: `balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`
- 라이프사이클 명령: `/omg:launch`, `/omg:checkpoint`, `/omg:stop`, `/omg:mode`
- 신규 에이전트: `omg-product`, `omg-verifier`, `omg-consensus`
- 신규 스킬: `$prd`, `$ralplan`, `$autopilot`, `$ralph`, `$ultrawork`, `$consensus`, `$mode`, `$cancel`

## 설치

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

```text
/extensions list
```

```bash
gemini extensions list
```

참고: 설치/업데이트 명령은 터미널 모드(`gemini extensions ...`)에서 실행합니다.

## 주요 명령어

### 파이프라인

- `/omg:team`
- `/omg:team-plan`
- `/omg:team-prd`
- `/omg:team-exec`
- `/omg:team-verify`
- `/omg:team-fix`

### 모드/라이프사이클

- `/omg:mode`
- `/omg:autopilot`
- `/omg:ralph`
- `/omg:ultrawork`
- `/omg:consensus`
- `/omg:launch`
- `/omg:checkpoint`
- `/omg:stop`

### 운영 보조

- `/omg:status`
- `/omg:optimize`
- `/omg:cache`

## 스킬

- `$plan`
- `$ralplan`
- `$prd`
- `$execute`
- `$team`
- `$autopilot`
- `$ralph`
- `$ultrawork`
- `$consensus`
- `$mode`
- `$cancel`
- `$research`
- `$context-optimize`

## 서브 에이전트

- `omg-architect`
- `omg-planner`
- `omg-product`
- `omg-executor`
- `omg-reviewer`
- `omg-verifier`
- `omg-debugger`
- `omg-consensus`
- `omg-researcher`
- `omg-quick`

## 문서

- [영문 README](../README.md)
- [설치 가이드](./guide/installation.md)
- [컨텍스트 엔지니어링 가이드](./guide/context-engineering_ko.md)
- [변경 이력](./history.md)

## 라이선스

MIT

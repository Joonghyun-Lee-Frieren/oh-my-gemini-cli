# oh-my-gemini-cli (OmG)

[랜딩 페이지](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [변경 이력](./history.md)

[English](../README.md) | [日本語](./README_ja.md) | [Français](./README_fr.md) | [中文](./README_zh.md) | [Español](./README_es.md)

Gemini CLI를 위한 컨텍스트 엔지니어링 기반 멀티 에이전트 워크플로우 팩입니다.

> "Claude Code의 핵심 경쟁력은 Opus나 Sonnet 엔진이 아니라 Claude Code 자체다. Gemini도 그 하네스를 붙이면 꽤 잘 된다."
>
> - 신정규 (Lablup Inc. CEO), 유튜브 인터뷰 중

이 프로젝트는 이 관찰에서 시작했습니다.
"그 하네스 모델을 Gemini CLI로 가져오면 어떨까?"

OmG는 Gemini CLI를 단일 세션 도구에서 구조화된 역할 기반 엔지니어링 워크플로우로 확장합니다.

OmG는 공식 확장 모델 기반의 네이티브 Gemini CLI Extension으로 구현됩니다.

- `gemini-extension.json` 매니페스트
- `agents/` 서브 에이전트
- `commands/` 슬래시 명령어
- `skills/` 재사용 가능한 워크플로우
- `context/` 공유 컨텍스트

## 설치

공식 확장 명령어로 GitHub URL에서 설치합니다.

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

대화형 모드에서 확인:

```text
/extensions list
```

비대화형 확인:

```bash
gemini extensions list
```

참고: 설치/업데이트 명령은 대화형 슬래시 모드가 아니라 터미널 모드(`gemini extensions ...`)에서 실행합니다.

## 왜 OmG인가

- 복잡한 작업은 큰 컨텍스트 창만으로는 부족하고 반복 가능한 구조가 필요합니다.
- 역할 기반 분업은 계획, 구현, 리뷰, 디버깅의 품질을 높입니다.
- 캐시 안정성을 고려한 컨텍스트 운영으로 장기 세션의 비용과 흔들림을 줄입니다.

## 사용

### 명령어

`commands/omg/*.toml`에서 제공됩니다.

- `/omg:status`
- `/omg:team`
- `/omg:optimize`
- `/omg:cache`

### 스킬

- `$plan`
- `$execute`
- `$team`
- `$research`
- `$context-optimize`

### 서브 에이전트

- `omg-architect`
- `omg-planner`
- `omg-executor`
- `omg-reviewer`
- `omg-debugger`
- `omg-researcher`
- `omg-quick`

이 확장은 `gemini-extension.json`에서 `experimental.enableAgents`를 기본 활성화합니다.

## 프로젝트 구조

```text
oh-my-gemini-cli/
|- gemini-extension.json
|- agents/
|- commands/
|  |- omg/
|- skills/
|- context/
|- docs/
`- LICENSE
```

## 마이그레이션 노트

이 저장소는 더 이상 `omg setup`을 기본 온보딩 경로로 사용하지 않습니다.

- 기존 방식: 전역 패키지 설치 + setup 복사
- 현재 방식: `gemini extensions install ...` 기반 직접 설치

`src/`의 레거시 런타임 코드는 저장소에 남아 있지만, 확장 동작은 매니페스트 로딩 기반으로 전환되었습니다.

## 문서

- [영문 README](../README.md)
- [설치 가이드](./guide/installation.md)
- [변경 이력](./history.md)

## 라이선스

MIT

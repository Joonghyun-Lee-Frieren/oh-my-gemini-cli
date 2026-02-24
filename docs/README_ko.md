# oh-my-gemini-cli (OmG)

Gemini CLI용 확장(Extension) 기반 멀티 에이전트 워크플로우 팩입니다.

현재 OmG는 공식 Extensions 방식으로 재구성되었습니다.

- `gemini-extension.json` 매니페스트
- `agents/` 서브 에이전트
- `commands/` 슬래시 커맨드
- `skills/` 스킬
- `context/` 공통 컨텍스트

## 설치

Gemini CLI 내부에서 아래처럼 설치합니다.

```text
/extensions install C:\workspace_vibe\oh-my-gemini-cli
```

또는 절대 경로를 사용하세요.

설치 확인:

```text
/extensions
```

## 사용

### 커맨드

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

## 변경 사항 요약

이전의 `omg setup` 중심 설치/복사 방식 대신, 이제 `/extensions install` 기반으로 동작합니다.

## 문서

- 영문 README: `../README.md`
- 설치 가이드: `./guide/installation.md`
- 변경 이력: `./history.md`

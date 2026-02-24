# oh-my-gemini-cli (OmG)

Gemini CLI용 컨텍스트 엔지니어링 기반 멀티 에이전트 워크플로우 확장입니다.

> "Claude Code의 핵심 경쟁력은 Opus나 Sonnet 엔진이 아니라 Claude Code 자체다. Gemini도 그 하네스를 붙이면 꽤 잘 된다."
>
> — 신정규 (Lablup Inc. CEO), 유튜브 인터뷰

이 프로젝트는 위 관찰에서 시작했습니다.  
"그 하네스를 Gemini CLI에도 가져오면 어떨까?"

현재 OmG는 Gemini CLI 공식 Extensions 방식으로 구현되어 있습니다.

- `gemini-extension.json` 매니페스트
- `agents/` 서브 에이전트
- `commands/` 슬래시 커맨드
- `skills/` 스킬
- `context/` 공통 컨텍스트

## 설치

공식 확장 설치 방식(터미널 모드):

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

설치 확인:

```text
/extensions list
```

또는:

```bash
gemini extensions list
```

참고: 설치/업데이트/삭제는 `gemini extensions ...` 명령으로 실행합니다.

## 왜 OmG인가

- 복잡한 작업에는 큰 컨텍스트 창만으로는 부족하고 구조화된 역할 분리가 필요합니다.
- 계획, 구현, 리뷰, 디버깅을 역할 단위로 분리하면 품질과 속도를 동시에 올리기 쉽습니다.
- 캐시 친화적인 컨텍스트 운영으로 장기 세션의 안정성과 비용 효율을 개선할 수 있습니다.

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

## 문서

- 영문 README: `../README.md`
- 설치 가이드: `./guide/installation.md`
- 변경 이력: `./history.md`

# oh-my-gemini-cli (OmG)

[Página de inicio](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [Historial](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [日本語](./README_ja.md) | [Français](./README_fr.md) | [中文](./README_zh.md)

Extensión de flujo de trabajo multiagente para Gemini CLI, basada en ingeniería de contexto.

> "La ventaja competitiva central de Claude Code no es el motor Opus o Sonnet, sino Claude Code en sí mismo. Sorprendentemente, Gemini también funciona muy bien cuando se le conecta ese mismo arnés."
>
> - Jeongkyu Shin (CEO de Lablup Inc.), en una entrevista de YouTube

OmG amplía Gemini CLI de un asistente de sesión única a un flujo de ingeniería estructurado y orientado por roles.

## Novedades de v0.3.0

- Pipeline por etapas: `team-plan -> team-prd -> team-exec -> team-verify -> team-fix`
- Modos de operación: `balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`
- Comandos de ciclo de vida: `/omg:launch`, `/omg:checkpoint`, `/omg:stop`, `/omg:mode`
- Nuevos subagentes especializados: `omg-product`, `omg-verifier`, `omg-consensus`
- Nuevas skills: `$prd`, `$ralplan`, `$autopilot`, `$ralph`, `$ultrawork`, `$consensus`, `$mode`, `$cancel`

## Instalación

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

```text
/extensions list
```

```bash
gemini extensions list
```

Nota: los comandos de instalación/actualización se ejecutan en modo terminal (`gemini extensions ...`).

## Comandos principales

### Pipeline

- `/omg:team`
- `/omg:team-plan`
- `/omg:team-prd`
- `/omg:team-exec`
- `/omg:team-verify`
- `/omg:team-fix`

### Modo / ciclo de vida

- `/omg:mode`
- `/omg:autopilot`
- `/omg:ralph`
- `/omg:ultrawork`
- `/omg:consensus`
- `/omg:launch`
- `/omg:checkpoint`
- `/omg:stop`

### Operación

- `/omg:status`
- `/omg:optimize`
- `/omg:cache`

## Skills

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

## Subagentes

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

## Documentación

- [README en inglés](../README.md)
- [Guía de instalación](./guide/installation.md)
- [Context Engineering Guide (EN)](./guide/context-engineering.md)
- [Historial](./history.md)

## Licencia

MIT

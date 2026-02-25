# oh-my-gemini-cli (OmG)

[P?gina de inicio](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [Historial](./history.md)

[English](../README.md) | [???](./README_ko.md) | [???](./README_ja.md) | [Fran?ais](./README_fr.md) | [??](./README_zh.md)

Extensi?n de flujo de trabajo multiagente para Gemini CLI, basada en ingenier?a de contexto.

> "La ventaja competitiva central de Claude Code no es el motor Opus o Sonnet, sino Claude Code en s? mismo. Sorprendentemente, Gemini tambi?n funciona muy bien cuando se le conecta ese mismo arn?s."
>
> - Jeongkyu Shin (CEO de Lablup Inc.), en una entrevista de YouTube

Este proyecto comenz? con esa observaci?n:
"?Qu? pasar?a si llevamos ese modelo de arn?s a Gemini CLI?"

OmG ampl?a Gemini CLI de un asistente de sesi?n ?nica a un flujo de ingenier?a estructurado y orientado por roles.

## Novedades de v0.3.0

- Nuevo pipeline por etapas: `team-plan -> team-prd -> team-exec -> team-verify -> team-fix`
- Nuevos modos de operaci?n: `balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`
- Nuevos comandos de ciclo de vida: `/omg:launch`, `/omg:checkpoint`, `/omg:stop`, `/omg:mode`
- Nuevos subagentes especializados: `omg-product`, `omg-verifier`, `omg-consensus`
- Nuevas skills: `$prd`, `$ralplan`, `$autopilot`, `$ralph`, `$ultrawork`, `$consensus`, `$mode`, `$cancel`

## Instalaci?n

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

```text
/extensions list
```

```bash
gemini extensions list
```

Nota: los comandos de instalaci?n/actualizaci?n se ejecutan en modo terminal (`gemini extensions ...`), no dentro del modo interactivo de comandos slash.

## Pipeline por etapas

1. `team-plan`: descomposici?n de tareas y dependencias
2. `team-prd`: bloqueo de alcance, no-objetivos y criterios de aceptaci?n
3. `team-exec`: implementaci?n del alcance aprobado
4. `team-verify`: verificaci?n de criterios y riesgos de regresi?n
5. `team-fix`: correcci?n solo de fallos verificados

## Modos de operaci?n

- `balanced`: modo equilibrado por defecto
- `speed`: prioridad a la velocidad de entrega
- `deep`: prioridad a profundidad de dise?o y validaci?n
- `autopilot`: ejecuci?n iterativa aut?noma
- `ralph`: modo estricto con puertas de calidad
- `ultrawork`: modo de alto rendimiento por lotes

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

### Operaci?n

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

## Documentaci?n

- [README en ingl?s](../README.md)
- [Gu?a de instalaci?n](./guide/installation.md)
- [Historial](./history.md)

## Licencia

MIT

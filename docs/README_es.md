# oh-my-gemini-cli (OmG)

[Página de inicio](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [Historial](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [日本語](./README_ja.md) | [Français](./README_fr.md) | [中文](./README_zh.md)

Paquete de flujo de trabajo multiagente para Gemini CLI, basado en ingeniería de contexto.

> "La ventaja competitiva central de Claude Code no es el motor Opus o Sonnet, sino Claude Code en sí mismo. Sorprendentemente, Gemini también funciona muy bien cuando se le conecta ese mismo arnés."
>
> - Jeongkyu Shin (CEO de Lablup Inc.), en una entrevista de YouTube

Este proyecto comenzó con esa observación:
"¿Qué pasaría si llevamos ese modelo de arnés a Gemini CLI?"

OmG amplía Gemini CLI de un asistente de sesión única a un flujo de ingeniería estructurado y orientado por roles.

OmG se implementa como extensión nativa de Gemini CLI sobre el modelo oficial de extensiones.

- manifiesto `gemini-extension.json`
- `agents/` para subagentes
- `commands/` para comandos slash
- `skills/` para flujos reutilizables
- `context/` para contexto compartido

## Instalación

Instala desde la URL de GitHub usando el comando oficial de extensiones:

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

Verificación en modo interactivo:

```text
/extensions list
```

Verificación en modo no interactivo:

```bash
gemini extensions list
```

Nota: los comandos de instalación/actualización se ejecutan en modo terminal (`gemini extensions ...`), no dentro del modo interactivo de comandos slash.

## Por qué OmG

- El trabajo complejo requiere una estructura repetible, no solo una ventana de contexto más grande.
- La delegación por roles mejora la calidad en planificación, implementación, revisión y depuración.
- La disciplina de contexto orientada a caché mejora la estabilidad y reduce costos en sesiones largas.

## Uso

### Comandos

Están definidos con namespace en `commands/omg/*.toml`:

- `/omg:status`
- `/omg:team`
- `/omg:optimize`
- `/omg:cache`

### Skills

- `$plan`
- `$execute`
- `$team`
- `$research`
- `$context-optimize`

### Subagentes

- `omg-architect`
- `omg-planner`
- `omg-executor`
- `omg-reviewer`
- `omg-debugger`
- `omg-researcher`
- `omg-quick`

Los subagentes se ofrecen mediante las definiciones `agents/` de la extensión.

## Estructura del proyecto

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

## Notas de migración

Este repositorio ya no depende de `omg setup` como ruta principal de onboarding.

- Flujo anterior: instalación global del paquete + copia con setup
- Flujo actual: instalación directa de extensión vía `gemini extensions install ...`

El código runtime heredado en `src/` se mantiene en el repositorio, pero el comportamiento de la extensión ahora depende de la carga por manifiesto.

## Documentación

- [README en inglés](../README.md)
- [Guía de instalación](./guide/installation.md)
- [Historial](./history.md)

## Licencia

MIT


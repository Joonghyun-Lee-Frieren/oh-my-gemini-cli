# oh-my-gemini-cli (OmG)

[Landing Page](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [History](docs/history.md)

[한국어](docs/README_ko.md) | [日本語](docs/README_ja.md) | [Français](docs/README_fr.md) | [中文](docs/README_zh.md) | [Español](docs/README_es.md)

Context-engineering-powered multi-agent workflow pack for Gemini CLI.

> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> - Jeongkyu Shin (CEO of Lablup Inc.), from a YouTube interview

This project started from that observation:
"What if we bring that harness model to Gemini CLI?"

OmG extends Gemini CLI from a single-session assistant into a structured, role-driven engineering workflow.

OmG is implemented as a native Gemini CLI extension using the official extension model:

- `gemini-extension.json` manifest
- `agents/` for sub-agents
- `commands/` for slash commands
- `skills/` for reusable workflows
- `context/` for shared project context

## Install

Install from GitHub URL using the official extensions command:

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

Optional verification in interactive mode:

```text
/extensions list
```

Non-interactive verification:

```bash
gemini extensions list
```

Note: extension install/update commands run in terminal mode (`gemini extensions ...`), not inside interactive slash-command mode.

## Why OmG

- Complex work needs repeatable structure, not just a bigger context window.
- Role-based delegation improves quality on planning, implementation, review, and debugging.
- Cache-safe context discipline keeps long sessions stable and cheaper.

## Use

### Commands

These are namespaced from `commands/omg/*.toml`:

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

### Sub-agents

- `omg-architect`
- `omg-planner`
- `omg-executor`
- `omg-reviewer`
- `omg-debugger`
- `omg-researcher`
- `omg-quick`

Sub-agents are provided through the extension's `agents/` definitions.

## Project Structure

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

## Migration Notes

This repository no longer relies on `omg setup` as the primary onboarding path.

- Old flow: global package install plus setup copier
- New flow: direct extension install via `gemini extensions install ...`

Legacy runtime code under `src/` is kept in-repo, but extension behavior now comes from manifest-driven loading.

## Docs

- [Korean README](docs/README_ko.md)
- [Installation Guide](docs/guide/installation.md)
- [Changelog](docs/history.md)

## License

MIT


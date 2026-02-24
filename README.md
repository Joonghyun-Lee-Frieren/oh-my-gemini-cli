# oh-my-gemini-cli (OmG)

Extension-first multi-agent workflow pack for Gemini CLI.

OmG is now implemented as a native Gemini CLI extension using the official extension model:

- `gemini-extension.json` manifest
- `agents/` for sub-agents
- `commands/` for slash commands
- `skills/` for reusable workflows
- `context/` for shared project context

## Install

1. Clone this repository.
2. Open Gemini CLI in your project.
3. Install the extension from local path:

```text
/extensions install /absolute/path/to/oh-my-gemini-cli
```

Windows example:

```text
/extensions install C:\workspace_vibe\oh-my-gemini-cli
```

Optional verification:

```text
/extensions
```

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

`gemini-extension.json` enables `experimental.enableAgents` by default for this extension.

## Project Structure

```text
oh-my-gemini-cli/
├─ gemini-extension.json
├─ agents/
├─ commands/
│  └─ omg/
├─ skills/
├─ context/
├─ docs/
└─ LICENSE
```

## Migration Notes

This repository no longer relies on `omg setup` as the primary onboarding path.

- Old flow: global package install + setup copier
- New flow: direct extension install via `/extensions install ...`

Legacy runtime code under `src/` is kept in-repo, but the extension behavior now comes from manifest-driven loading.

## Docs

- Korean README: `docs/README_ko.md`
- Installation guide: `docs/guide/installation.md`
- Changelog: `docs/history.md`

## License

MIT

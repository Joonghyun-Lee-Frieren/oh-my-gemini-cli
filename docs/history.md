# Changelog

All notable changes to oh-my-gemini-cli are documented here.

## Release Timeline

| Version | Date | Theme | Outcome |
| --- | --- | --- | --- |
| `v0.3.2` | 2026-02-26 | HUD visibility controls | Added extension-native HUD profile commands/skill and status rendering policy |
| `v0.3.1` | 2026-02-26 | Intent/loop guardrail expansion | Added intake gate, loop enforcement, deep init, and conditional rule injection workflows |
| `v0.3.0` | 2026-02-25 | Workflow and mode expansion | Added stage pipeline commands, autonomous modes, and lifecycle controls |
| `v0.2.0` | 2026-02-24 | Extensions-first rebuild | OmG moved to Gemini CLI's official extension primitives |
| `v0.1.4` | 2026-02-23 | Runtime integration hardening | MCP/server wiring and status observability improved |
| `v0.1.3` | 2026-02-23 | Installation path stabilization | GitHub-based install flow documented as default path |
| `v0.1.2` | 2026-02-22 | Model/branding consistency | `gemini-3.1-*` naming and OmG branding normalized |
| `v0.1.1` | 2026-02-22 | Dashboard redesign | Retro game-style TUI and richer telemetry presentation |
| `v0.1.0` | 2026-02-22 | Initial release | Multi-agent orchestration foundation shipped |

## v0.3.2 - HUD Visibility Controls (2026-02-26)

Added extension-native visual status controls inspired by statusline/HUD workflows from related harness projects.

### Added

- New HUD profile commands:
  - `/omg:hud`
  - `/omg:hud-on`
  - `/omg:hud-compact`
  - `/omg:hud-off`
- New HUD control skill:
  - `$hud`
- New runtime-state artifact for HUD profile persistence:
  - `.omg/state/hud.json`

### Changed

- `/omg:status` now renders a HUD section with visibility policy (`normal`, `compact`, `hidden`).
- `context/omg-core.md` updated with HUD control conventions.
- Local dashboard HUD now supports density toggle with `h` (`normal -> compact -> hidden`), top summary line, and `.omg/state/hud.json` sync.
- Extension/package version bumped to `0.3.2`.

### Structural Fit Note

- Gemini Extensions currently support prompt/command/skill/state-driven visual summaries.
- Direct terminal statusline hook injection remains runtime-specific and outside extension-only primitives.

## v0.3.1 - Intent and Loop Guardrail Expansion (2026-02-26)

Added extension-native guardrail workflows inspired by cross-harness operational patterns.

### Added

- New intake/routing command and skill:
  - `/omg:intent`
  - `$intent`
- New loop enforcement command and skill:
  - `/omg:loop`
  - `$loop`
- New deep repository bootstrap command and skill:
  - `/omg:deep-init`
  - `$deep-init`
- New conditional rule injection command and skill:
  - `/omg:rules`
  - `$rules`
- New runtime-state artifacts for extension-guided persistence:
  - `.omg/state/intent.md`
  - `.omg/state/rules.md`
  - `.omg/state/deep-init.md`
  - `.omg/state/project-map.md`
  - `.omg/state/validation.md`

### Changed

- `context/omg-core.md` updated with intent-gating, conditional-rule, deep-init, and loop-discipline conventions.
- README command/skill map expanded with the new guardrail workflows.
- Extension/package version bumped to `0.3.1`.

### Structural Fit Note

- Extension-manifest primitives can represent policy-oriented orchestration (`commands/`, `skills/`, `context/`) directly.
- Runtime hook workers, background daemons, and low-level event hooks still require separate runtime code beyond extension-only assets.

## v0.3.0 - Workflow and Mode Expansion (2026-02-25)

Added key orchestration capabilities inspired by production usage patterns from related repositories.

### Added

- Stage commands:
  - `team-plan`
  - `team-prd`
  - `team-exec`
  - `team-verify`
  - `team-fix`
- Mode/lifecycle commands:
  - `autopilot`
  - `ralph`
  - `ultrawork`
  - `consensus`
  - `mode`
  - `launch`
  - `checkpoint`
  - `stop`
- New specialist agents:
  - `omg-product`
  - `omg-verifier`
  - `omg-consensus`
- New workflow skills:
  - `$ralplan`
  - `$prd`
  - `$autopilot`
  - `$ralph`
  - `$ultrawork`
  - `$consensus`
  - `$mode`
  - `$cancel`

### Changed

- `team` orchestration switched to stage-based lifecycle with verify/fix loops.
- `status` report expanded to include mode and pipeline stage.
- Core context updated with mode profiles, lifecycle state conventions, and safety rails.
- Extension/package version bumped to `0.3.0`.

## v0.2.0 - Extensions-First Rebuild (2026-02-24)

Reimplemented OmG around Gemini CLI's official Extensions model.

### Added

- Root extension manifest: `gemini-extension.json`
- Extension-first package metadata and files list in `package.json`
- Sub-agent definitions in `agents/`
- Shared extension context in `context/omg-core.md`
- Namespaced extension commands in `commands/omg/`
- Frontmatter-based skills in `skills/`

### Changed

- Installation flow migrated to `gemini extensions install <repo-url>`
- Documentation rewritten for extension-native usage and command naming
- Runtime entry shifted from setup scripts to manifest-driven loading

### Removed

- Legacy root-level command templates that depended on `!{omg ...}` shell execution

### Migration Summary

| Before | After |
| --- | --- |
| Global package + setup copier | Native extension install via `gemini extensions` |
| Script-first runtime bootstrap | Gemini extension manifest bootstrap |
| Mixed onboarding instructions | Single extension-first install path |

## v0.1.4 - Gemini CLI Runtime Integration Hardening (2026-02-23)

### Added

- MCP stdio entry support via `@modelcontextprotocol/sdk` (`--mcp`)
- `--server <state|memory|context|orchestrator>` server-targeted execution
- Extended `omg status` options (`--agents`, `--tasks`, `--cache`, `--cache-history`, `--context`, `--json`)

### Changed

- `omg setup` updated to register all 4 OmG MCP servers in `~/.gemini/settings.json`
- `omg doctor` updated to validate all required OmG MCP server registrations
- Prompt argument wiring adjusted for Gemini CLI compatibility (`-p` path)
- Config loading unified via shared config module flow

### Impact Matrix

| Area | Effect |
| --- | --- |
| MCP interoperability | Better alignment with Gemini CLI runtime expectations |
| Diagnostics | More reliable setup verification and status visibility |
| Automation | Cleaner path for bot-driven execution workflows |

## v0.1.3 - Installation Path Stabilization (2026-02-23)

### Changed

- GitHub install route promoted as the primary onboarding path
- npm registry route kept as optional path
- Gemini CLI package naming corrected in docs (`@google/gemini-cli`)
- Troubleshooting section expanded for install-time `404` errors

### Tooling

- Added package lifecycle scripts (`prepare`, `prepack`) for build consistency

## v0.1.2 - Model and Branding Consistency (2026-02-22)

### Changed

- Model references standardized to `gemini-3.1-pro` and `gemini-3.1-flash`
- Agent label output updated to display full model names
- Project brand text normalized from `OMG` to `OmG`
- Tagline changed to: `Gemini thinks. OmG orchestrates.`

## v0.1.1 - Retro Dashboard Refresh (2026-02-22)

### Added

- Retro game-style dashboard skin and status labels (`ATK`, `WIN`, `KO`, `ZZZ`, `RDY`)
- Agent-specific sprite/icon representation in dashboard panels
- HP/progress bars and party-style member display
- Quest log and battle log visualization updates

### Changed

- Docs moved under `docs/` and linked from repository root README
- Landing preview updated to match retro dashboard visuals

## v0.1.0 - Initial Release (2026-02-22)

### Added

- Core CLI command surface (`setup`, `doctor`, `team`, `status`, `config`, `bot`, `update`)
- Multi-agent orchestration primitives:
  - Agent pool and worker lifecycle
  - Task routing and priority queue
  - Agent registry for architect/planner/executor/reviewer/debugger/researcher/quick roles
- Context-engineering modules:
  - Cache manager
  - Context layering
  - Compaction and prefix optimization
- MCP server set:
  - `omg_state`
  - `omg_memory`
  - `omg_context`
  - `omg_orchestrator`
- Initial docs set (`README`, guides, landing page)

## Compatibility Notes

| Component | Supported path in this repo |
| --- | --- |
| Gemini installation mode | `gemini extensions install ...` |
| Extension metadata source | `gemini-extension.json` |
| Command namespace | `/omg:*` |
| Skill namespace | `$<skill>` from `skills/*/SKILL.md` (for example: `$plan`, `$team`, `$intent`, `$deep-init`, `$loop`, `$hud`) |

## Notes

- Historical details before `v0.1.0` are not tracked.
- For commit-level details, inspect repository git history.

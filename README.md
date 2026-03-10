# oh-my-gemini-cli (OmG)
[![Release](https://img.shields.io/github/v/release/Joonghyun-Lee-Frieren/oh-my-gemini-cli?display_name=tag&sort=semver)](https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/releases)
[![License](https://img.shields.io/github/license/Joonghyun-Lee-Frieren/oh-my-gemini-cli)](LICENSE)
[![Stars](https://img.shields.io/github/stars/Joonghyun-Lee-Frieren/oh-my-gemini-cli?style=social)](https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/stargazers)
[![Gemini Extension](https://img.shields.io/badge/Gemini-Extension-0d8a83)](https://geminicli.com/extensions/?name=Joonghyun-Lee-Frierenoh-my-gemini-cli)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub_Sponsors-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Joonghyun-Lee-Frieren)

[Landing Page](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [History](docs/history.md)

[한국어](docs/README_ko.md) | [日本語](docs/README_ja.md) | [Français](docs/README_fr.md) | [中文](docs/README_zh.md) | [Español](docs/README_es.md)

Context-engineering-powered multi-agent workflow pack for Gemini CLI.

> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> - Jeongkyu Shin (CEO of Lablup Inc.), from a YouTube channel interview

This project started from that observation:
"What if we bring that harness model to Gemini CLI?"

OmG extends Gemini CLI from a single-session assistant into a structured, role-driven engineering workflow.

## What's New in v0.3.7

- Fixed extension context wiring:
  - added root `GEMINI.md`
  - imported `context/omg-core.md` through the manifest entrypoint
- Reduced always-on prompt weight:
  - trimmed the shared OmG baseline to only stable runtime rules
  - moved the control plane to slash commands first
- Removed mirrored control-plane skills:
  - retained deep-work skills only: `$plan`, `$execute`, `$prd`, `$ralplan`, `$research`, `$context-optimize`
- Slimmed high-traffic `/omg:*` commands:
  - shortened repeated output boilerplate in status/doctor/intent/team/hooks/notify and related control commands
- Updated diagnostics:
  - `/omg:doctor` now checks the real `GEMINI.md -> context/omg-core.md` chain
  - doctor now validates the retained skill set instead of every mirrored command/skill pair

## At A Glance

| Item | Summary |
| --- | --- |
| Delivery model | Official Gemini CLI extension (`gemini-extension.json`) |
| Core building blocks | `GEMINI.md`, `agents/`, `commands/`, `skills/`, `context/` |
| Main use case | Complex implementation tasks that need plan -> execute -> review loops |
| Control surface | Slash-command-first `/omg:*` control plane + 6 deep-work `$skills` + sub-agent delegation |
| Default model strategy | Judgment/acceptance gates on `gemini-3.1-pro`, implementation-heavy work on `gemini-3.1-flash`, broad low-risk exploration on `gemini-3.1-flash-lite` |

## Why OmG

| Problem in raw single-session flow | OmG response |
| --- | --- |
| Context gets mixed across planning and execution | Role-separated agents with focused responsibilities |
| Hard to keep progress visible in long tasks | Explicit workflow stages and command-driven status checks |
| Repetitive prompt engineering for common jobs | Slash commands for operational control plus retained deep-work skills (`$plan`, `$execute`, `$research`) |
| Drift between "what was decided" and "what was changed" | Review and debugging roles inside the same orchestration loop |

## Architecture

```mermaid
flowchart TD
    U["User Request"] --> G["Gemini CLI"]
    G --> E["OmG Extension"]
    E --> C["commands/omg/*.toml"]
    E --> S["skills/*/SKILL.md"]
    E --> A["agents/*.md"]
    E --> X["GEMINI.md -> context/omg-core.md"]
    C --> O["Orchestration Prompt"]
    S --> O
    A --> O
    X --> O
    O --> R["Structured Result: Plan, Execution, Validation, Next Steps"]
```

## Team Workflow

```mermaid
sequenceDiagram
    participant User
    participant Director as omg-director
    participant Planner as omg-planner
    participant Architect as omg-architect
    participant Executor as omg-executor
    participant Reviewer as omg-reviewer
    participant Debugger as omg-debugger
    participant Editor as omg-editor

    User->>Director: Request team execution
    Director->>User: Propose dynamic team + approval gate
    User->>Director: Approve roster
    Director->>Planner: Define goal and constraints
    Planner->>Architect: Validate technical direction (when needed)
    Architect-->>Planner: Design feedback and risk flags
    Planner->>Director: Hand off executable slices
    Director->>Executor: Assign implementation lane
    Executor->>Reviewer: Submit implementation result
    Reviewer-->>Executor: Accept or request fix
    Reviewer->>Debugger: Trigger on failing tests or regressions
    Debugger-->>Reviewer: Root cause + patch proposal
    Reviewer->>Director: Verification result
    Director->>Editor: Package validated output
    Editor-->>User: Final validated deliverable
```

## Dynamic Team Assembly

Use `team-assemble` when a fixed engineering roster is not enough.

- Split selection into:
  - domain specialists (problem expertise)
  - format specialists (report/content/output quality)
- Spawn parallel exploration lanes (`omg-researcher` xN) for broad discovery tasks.
- Route decisions through a judgment lane (`omg-consultant` or `omg-architect`).
- Assign reasoning effort per lane from global profile + teammate overrides.
- Keep verify/fix loops explicit (`omg-reviewer` -> `omg-verifier` -> `omg-debugger`).
- Run anti-slop check before final delivery.
- Require explicit approval before autonomous execution starts.

Example flow:

```text
/omg:team-assemble "Compare 3 competitors and produce an exec report"
-> proposes: researcher x3 + consultant + editor + director
-> asks: Proceed with this team? (yes/no)
-> after approval: team-plan -> team-prd -> team-exec -> team-verify -> team-fix
```

Activation note:
- No separate research-preview setting is required in OmG.
- If the extension is loaded, `/omg:team-assemble` is immediately available.

## Notification Routing

Use `notify` when a long-running OmG session needs explicit signals for approvals, verification outcomes, blockers, or idle drift.

- Supported profiles:
  - `quiet`: only urgent interruptions (`approval-needed`, `verify-failed`, `blocker-raised`, `session-stop`)
  - `balanced`: quiet + checkpoint and team-approval updates
  - `watchdog`: balanced + idle-watchdog alerts for unattended loops
- Supported channels:
  - `desktop` (host notification adapter)
  - `terminal-bell`
  - `file`
  - `webhook` (external bridge)
- Safety boundary:
  - OmG manages event routing, templates, and persisted policy
  - actual delivery must be implemented by Gemini host hooks, shell adapters, or project-specific webhook bridges
  - delegated worker sessions keep external dispatch disabled unless the user explicitly opts in

Example flow:

```text
/omg:notify profile watchdog
-> enables: approval-needed, verify-failed, blocker-raised, checkpoint-saved, idle-watchdog, session-stop
-> suggests channels: terminal-bell + file by default
-> persists policy: .omg/state/notify.json
```

## Install

Install from GitHub using the official Gemini Extensions command:

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

Verify in interactive mode:

```text
/extensions list
```

Verify in terminal mode:

```bash
gemini extensions list
```

Run a smoke test:

```text
/omg:status
```

Note: extension install/update commands run in terminal mode (`gemini extensions ...`), not in interactive slash-command mode.

## Gemini CLI Compatibility Notes (Reviewed: 2026-03-06)

- Recommended runtime: Gemini CLI `v0.31.0+` for stable policy/plan-mode behavior in long sessions.
- Policy engine migration: if your wrapper scripts still pass `--allowed-tools`, migrate to `--policy` profiles (`--allowed-tools` was deprecated in Gemini CLI `v0.30.0`).
- Native `/plan` mode and OmG planning commands can coexist:
  - native: `/plan`
  - OmG staged flow: `/omg:team-plan`, `/omg:team-prd`
- Preview-only features (for example extension manifest plan-directory support from preview channel) are not required for OmG and are intentionally not enabled by default.

## Interface Map

### Commands

| Command | Purpose | Typical timing |
| --- | --- | --- |
| `/omg:status` | Summarize progress, risks, and next actions | Start/end of a work session |
| `/omg:doctor` | Run extension/team/hook readiness diagnostics and remediation plan | Before long autonomous runs or when setup seems broken |
| `/omg:hud` | Inspect or switch visual HUD profile (`normal`, `compact`, `hidden`) | Before long sessions or when terminal density changes |
| `/omg:hud-on` | Quick toggle HUD to full visual mode | When returning to full status boards |
| `/omg:hud-compact` | Quick toggle HUD to compact mode | During dense implementation loops |
| `/omg:hud-off` | Quick toggle HUD to hidden mode (plain status sections) | When visual blocks are distracting |
| `/omg:hooks` | Inspect/switch hook pipeline profile and trigger policy | Before autonomous loops or when hook behavior drifts |
| `/omg:hooks-init` | Bootstrap hook config and plugin contract scaffolding | At project kickoff or first hook adoption |
| `/omg:hooks-validate` | Validate hook ordering, safety, and budget constraints | Before enabling high-autonomy workflows |
| `/omg:hooks-test` | Dry-run hook event sequence and efficiency estimates | After policy changes or repeated loop stalls |
| `/omg:notify` | Configure notification routing for approvals, blockers, verify results, checkpoints, and idle watchdog alerts | Before unattended `autopilot`/`loop` runs or when alert noise needs tuning |
| `/omg:intent` | Classify task intent and route to the correct stage/command | Before planning or coding when request intent is ambiguous |
| `/omg:rules` | Activate task-conditional guardrail rule packs | Before implementation on migration/security/performance-sensitive work |
| `/omg:memory` | Maintain MEMORY index, topic files, and path-aware rule packs | During long sessions or when decisions/rules drift |
| `/omg:reasoning` | Set global reasoning effort and teammate overrides (`low/medium/high/xhigh`) | Before expensive planning/review loops or when depth is role-dependent |
| `/omg:deep-init` | Build deep project map and validation baseline for long sessions | At project kickoff or when onboarding into unfamiliar codebases |
| `/omg:team-assemble` | Dynamically compose a role-fit team with approval gate and lane-specific reasoning map | Before `/omg:team` on cross-domain or non-standard tasks |
| `/omg:team` | Execute full stage pipeline (`team-assemble? -> plan -> prd -> exec -> verify -> fix`) | Complex feature or refactor delivery |
| `/omg:team-plan` | Build dependency-aware execution plan | Before implementation |
| `/omg:team-prd` | Lock measurable acceptance criteria and constraints | After planning, before coding |
| `/omg:team-exec` | Implement a scoped delivery slice | Main implementation loop |
| `/omg:team-verify` | Validate acceptance criteria, regressions, and anti-slop quality gate | After each execution slice |
| `/omg:team-fix` | Patch only verified failures | When verification fails |
| `/omg:loop` | Enforce repeated `exec -> verify -> fix` cycles until done/blocker | Mid/late delivery when unresolved findings remain |
| `/omg:mode` | Inspect or switch operating profile (`balanced/speed/deep/autopilot/ralph/ultrawork`) | At session start or posture change |
| `/omg:approval` | Inspect or switch approval posture (`suggest/auto/full-auto`) | Before autonomous delivery loops or policy changes |
| `/omg:autopilot` | Run iterative autonomous cycles with checkpoints | Complex autonomous delivery |
| `/omg:ralph` | Enforce strict quality-gated orchestration | Release-critical tasks |
| `/omg:ultrawork` | Throughput mode for batched independent tasks | Large backlogs |
| `/omg:consensus` | Converge on one option from multiple designs | Decision-heavy moments |
| `/omg:launch` | Initialize persistent lifecycle state for long tasks | Beginning of long sessions |
| `/omg:checkpoint` | Save compact checkpoint and resume hint | Mid-session handoff |
| `/omg:stop` | Gracefully stop autonomous mode and preserve progress | Pause/interrupt moments |
| `/omg:cancel` | Harness-style cancel alias that stops safely and returns resume handoff | When interrupting autonomous/team flow |
| `/omg:optimize` | Improve prompts/context for quality and token efficiency | After a noisy or expensive session |
| `/omg:cache` | Inspect cache and context behavior | Long-running context-heavy tasks |

### Skills

Retained skills are intentionally limited to non-overlapping deep-work workflows so the extension loads less discovery metadata at session start.

| Skill | Focus | Output style |
| --- | --- | --- |
| `$plan` | Convert goals into phased plan | Milestones, risks, and acceptance criteria |
| `$ralplan` | Strict, stage-gated planning with rollback points | Quality-first execution map |
| `$execute` | Implement a scoped plan slice | Change summary with validation notes |
| `$prd` | Convert requests into measurable acceptance criteria | PRD-style scope contract |
| `$research` | Explore options/tradeoffs | Decision-oriented comparison |
| `$context-optimize` | Improve context structure | Compression and signal-to-noise adjustments |

### Sub-agents

| Agent | Primary responsibility | Preferred model profile |
| --- | --- | --- |
| `omg-architect` | System boundaries, interfaces, long-term maintainability | `gemini-3.1-pro` |
| `omg-planner` | Task decomposition and sequencing | `gemini-3.1-pro` |
| `omg-product` | Scope lock, non-goals, and measurable acceptance criteria | `gemini-3.1-pro` |
| `omg-executor` | Fast implementation cycles | `gemini-3.1-flash` |
| `omg-reviewer` | Correctness and regression risk checks | `gemini-3.1-pro` |
| `omg-verifier` | Acceptance-gate evidence and release-readiness checks | `gemini-3.1-pro` |
| `omg-debugger` | Root-cause analysis and patch strategy | `gemini-3.1-pro` |
| `omg-consensus` | Option scoring and decision convergence | `gemini-3.1-pro` |
| `omg-researcher` | External option analysis and synthesis | `gemini-3.1-pro` |
| `omg-director` | Team message routing, conflict resolution, and lifecycle orchestration | `gemini-3.1-pro` |
| `omg-consultant` | Strategic analysis criteria and recommendation framing | `gemini-3.1-pro` |
| `omg-editor` | Final deliverable structure, consistency, and audience fit | `gemini-3.1-flash` |
| `omg-quick` | Small, tactical fixes | `gemini-3.1-flash-lite` |

## Context Layer Model

| Layer | Source | Goal |
| --- | --- | --- |
| 1 | System / runtime constraints | Keep behavior aligned with platform guarantees |
| 2 | Project standards | Preserve team conventions and architecture intent |
| 3 | Thin `GEMINI.md`, `MEMORY.md`, and shared context | Maintain stable long-session memory without carrying heavy procedure every turn |
| 4 | Active task brief | Keep current objective and acceptance criteria visible |
| 5 | Latest execution traces | Feed immediate iteration and review loops |

## Project Structure

```text
oh-my-gemini-cli/
|- GEMINI.md
|- gemini-extension.json
|- agents/
|- commands/
|  `- omg/
|- skills/
|- context/
|- docs/
`- LICENSE
```

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| `settings.filter is not a function` during install | Stale Gemini CLI runtime or stale cached extension metadata | Update Gemini CLI, uninstall extension, then reinstall from repository URL |
| `/omg:*` command not found | Extension not loaded in current session | Run `gemini extensions list`, then restart Gemini CLI session |
| Skill does not trigger | Only the retained deep-work skills are still shipped, or extension metadata is stale | Recheck the retained skill list in the README and reload the extension/session |
| Team assembly keeps proposing but does not execute | Approval token missing in request | Reply with explicit approval (`yes`, `approve`, `go`, or `run`) |
| Output is verbose, generic, or repetitive | Reasoning/gate posture too weak for the target artifact | Raise `/omg:reasoning` effort (optionally teammate overrides) and rerun `/omg:team-verify` |
| Existing launch scripts use `--allowed-tools` | Flag deprecated in newer Gemini CLI | Replace with policy profiles via `--policy` and re-run |
| Autonomous flow confirms too often (or too little) | Approval posture not aligned to task risk | Run `/omg:approval suggest|auto|full-auto` and recheck guardrails |
| Setup health is unclear before long run | State/config drift accumulated | Run `/omg:doctor` (or `/omg:doctor team`) and apply remediation list |

## Migration Notes

| Legacy flow | Extension-first flow |
| --- | --- |
| Global package install + `omg setup` copy process | `gemini extensions install ...` |
| Runtime wired mainly through CLI scripts | Runtime wired through extension manifest primitives |
| Manual onboarding scripts | Native extension loading by Gemini CLI |

Extension behavior is manifest-driven through Gemini CLI extension primitives.

## Inspiration

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Google's open-source AI terminal agent
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Codex CLI harness
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Claude Code CLI harness
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode agent harness
- [Claude Code Prompt Caching](https://news.hada.io/topic?id=26835) - Context engineering principles

## Docs

- [Installation Guide](docs/guide/installation.md)
- [Context Engineering Guide](docs/guide/context-engineering.md)
- [Agent Team Assembly Guide](docs/guide/agent-team-assembly.md)
- [Memory Management Guide](docs/guide/memory-management.md)
- [Hook Engineering Guide](docs/guide/hook-engineering.md)
- [History](docs/history.md)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Joonghyun-Lee-Frieren/oh-my-gemini-cli&type=Date)](https://www.star-history.com/#Joonghyun-Lee-Frieren/oh-my-gemini-cli&Date)

## License

MIT



# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>Context engineering powered multi-agent harness for Gemini CLI</strong>
</p>

<h3 align="center">
  <em>Gemini thinks. OmG orchestrates.</em>
</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/oh-my-gemini-cli"><img src="https://img.shields.io/npm/v/oh-my-gemini-cli.svg" alt="npm version"></a>
  <a href="https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20-green.svg" alt="Node.js"></a>
</p>

<p align="center">
  <strong>English</strong> | <a href="./docs/README_ko.md">한국어</a> | <a href="./docs/history.md">Changelog</a>
</p>





> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*This project started from this insight: "What if we bring that harness to Gemini CLI?"*





> Extends **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** from a single-session tool into a
> **context engineering powered multi-agent orchestration system**.





## Table of Contents

- [Why oh-my-gemini-cli?](#why-oh-my-gemini-cli)
- [Quick Start](#quick-start)
- [Core Concept: Context Engineering](#core-concept-context-engineering)
- [Multi-Agent System](#multi-agent-system)
- [ASCII Dashboard](#ascii-dashboard)
- [Model Orchestration](#model-orchestration)
- [Agent Catalog](#agent-catalog)
- [Skill Catalog](#skill-catalog)
- [Custom Commands](#custom-commands)
- [Telegram / Discord Bot](#telegram--discord-bot)
- [Configuration](#configuration)
- [CLI Commands](#cli-commands)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Why oh-my-gemini-cli?

Gemini CLI is powerful: 1M token context window, Google Search grounding, and MCP support.  
But large-scale work still needs structure.

OmG adds:

- **Multi-Agent Orchestration**: Spawn multiple agents in parallel and coordinate by task type
- **Context Engineering**: Prompt cache optimization to reduce latency and cost
- **Real-time ASCII Dashboard**: Monitor all agents in a rich terminal UI
- **Dual Model Strategy**: Gemini Pro (planning) + Gemini Flash (execution)
- **External LLM Support**: Connect Claude, GPT, and other models via OAuth/API
- **Remote Control**: Monitor and control sessions through Telegram/Discord bots

OmG is an add-on, not a fork. It uses only Gemini CLI native extension points: MCP, custom commands, and `GEMINI.md`.

---

## Quick Start

### Requirements

- macOS, Linux, or Windows (WSL2 recommended)
- Node.js >= 20
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed
- Gemini authentication configured (Google login, API key, or Vertex AI)

### Install

```bash
# Recommended: works even when npm registry package is unavailable
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# Optional: if npm registry package is available in your environment
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> Note: if `npm install -g oh-my-gemini-cli` fails with `404 Not Found`, use the GitHub install command above.

### npm Publish Switch Checklist

- Confirm npm package page and `latest` dist-tag are available
- Verify `npm install -g oh-my-gemini-cli` works in a clean environment
- Switch docs default install command from GitHub to npm registry
- Keep GitHub install as fallback in troubleshooting section

### LLM Auto-Install

Paste this into any AI coding agent (Cursor, Claude Code, Gemini CLI, etc.):

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### First Session

```bash
# Basic launch (Gemini CLI + dashboard)
omg

# Multi-agent team mode
omg team "Implement OAuth authentication"

# Work with a specific agent
omg --agent architect "Analyze this codebase architecture"
```

---

## Core Concept: Context Engineering

> **"Cache Rules Everything Around Me"**
> — In the agent era, cache still dominates.

The core philosophy of oh-my-gemini-cli is **context engineering**.  
Inspired by [Claude Code prompt caching lessons](https://x.com/trq212/status/2024574133011673516), adapted to Gemini CLI.

### What is prompt caching?

In long-running agent workflows, **prompt caching** reuses prior computation to dramatically reduce latency and cost.  
Caching is based on **prefix matching**.

```
Request structure (cache-optimized order):

┌──────────────────────────────────┐  ← global cache (all sessions)
│  Static system prompt            │
│  Tool definitions (including MCP)│
├──────────────────────────────────┤  ← project cache
│  GEMINI.md (project context)     │
├──────────────────────────────────┤  ← session cache
│  Session context                 │
├──────────────────────────────────┤  ← changes every turn
│  Conversation messages           │
└──────────────────────────────────┘
```

### Five core principles

#### 1. Prefix Stability

Any change in the prefix invalidates subsequent cache.  
OmG places static content first and dynamic content last to maximize cache hits.

#### 2. Tool Set Invariance

Adding/removing tools breaks cache. OmG avoids that by:
- Using state-transition tools for plan mode instead of changing tool lists
- Using lazy-loading MCP stubs instead of mutating full tool sets mid-session

#### 3. Sub-Agents Instead of Model Switching

Prompt cache is model-specific.  
Instead of switching the model in one thread, OmG uses sub-agents with dedicated model caches.

#### 4. Cache-Safe Compaction

When context must be compacted, OmG preserves parent cache prefix via cache-safe forking.

#### 5. System Reminders for Updates

Instead of modifying system prompt content directly, OmG appends update signals in message flow.

### Cache Monitoring

OmG treats cache hit rate like uptime.

```bash
omg status --cache
```

---

## Multi-Agent System

OmG creates multiple agents in parallel based on task type, then coordinates execution.

### Architecture

```
User task request
    │
    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│ TaskRouter   │───▶│ TaskQueue    │───▶│ AgentPool        │
│ classification│   │ priority     │    │ (max 6 parallel) │
└──────────────┘    └──────────────┘    └─────────┬────────┘
                                                  │
                    ┌─────────────────────────────┤
                    │              │               │
                    ▼              ▼               ▼
              ┌──────────┐  ┌──────────┐  ┌──────────────┐
              │ Architect │  │ Executor │  │ Executor #2  │
              │ (Pro)     │  │ #1 Flash │  │ (Flash)      │
              └─────┬─────┘  └────┬─────┘  └──────┬───────┘
                    │              │               │
                    ▼              ▼               ▼
              ┌──────────────────────────────────────────┐
              │              EventBus                     │
              ├──────────┬──────────────┬────────────────┤
              ▼          ▼              ▼                ▼
          Dashboard   omg_state     Telegram         Discord
          (ASCII TUI)  (MCP)          Bot              Bot
```

### Agent types

| Agent | Model | Role |
|------|------|------|
| **Architect** | Gemini Pro | Architecture analysis, design decisions, dependency mapping |
| **Planner** | Gemini Pro | Task decomposition, execution planning, prioritization |
| **Executor** | Gemini Flash | Code generation, file editing, refactoring (parallel N) |
| **Reviewer** | Gemini Pro | Code review, quality checks, security checks |
| **Debugger** | Gemini Pro | Error analysis, debugging, fixing failed tests |
| **Researcher** | Gemini Pro | Web research, docs analysis, library comparison |
| **Quick** | Gemini Flash | Small tasks: typo fixes, formatting, tiny changes |

### Lifecycle

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### Pipeline example

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## ASCII Dashboard

Real-time terminal dashboard built with Ink (React for CLI).

### Dashboard preview

```
+----------------------------------------------------------------------+
| OmG  oh-my-gemini-cli   TIME 03:42   PARTY [####--] 4/6              |
+--------------------------------+-------------------------------------+
| PARTY MEMBERS                  | QUEST LOG                           |
| Active: 4 / Total: 6           | 2/7 quests cleared                  |
| Planner   [gemini-pro]   ATK   | [DONE ] analyze-auth   -> Plan      |
| Architect [gemini-pro]   ATK   | [RUN  ] impl-oauth    -> Exec#1     |
| Exec#1    [gemini-flash] ATK   | [RUN  ] impl-token    -> Exec#2     |
| Reviewer  [gemini-pro]   IDLE  | [WAIT ] code-review   -> Review     |
+--------------------------------+-------------------------------------+
| CACHE [#####-] 94% | TOKENS 12.4k/1M | COST -$0.03                   |
+----------------------------------------------------------------------+
```

### Shortcuts

| Key | Action |
|----|------|
| `q` / `Ctrl+C` | Quit |
| `p` | Pause all agents |
| `r` | Resume |
| `d` | Show selected agent detail stream |
| `t` | Toggle Telegram/Discord sync |
| `Tab` | Move focus between agents |
| `Enter` | Open focused agent detail panel |
| `1`-`9` | Focus agent by number |

---

## Model Orchestration

### Dual-model strategy

OmG defaults to **Pro for planning, Flash for execution**.

### External LLM integration

```bash
# Claude via OAuth
omg config set external.claude.oauth true
omg auth claude

# OpenAI via API key
omg config set external.openai.api_key "sk-..."
```

---

## Agent Catalog

Use inside Gemini CLI with `/prompts:name`.

| Agent | Command | Description |
|------|------|------|
| Architect | `/prompts:architect` | Architecture analysis, design decisions, dependency graph |
| Planner | `/prompts:planner` | Task decomposition, execution plan, milestones |
| Executor | `/prompts:executor` | Code generation and editing, refactoring |
| Reviewer | `/prompts:reviewer` | Review: security/performance/quality |
| Debugger | `/prompts:debugger` | Error analysis, stack trace interpretation, fixes |
| Researcher | `/prompts:researcher` | Web search, docs analysis, library comparison |
| Quick | `/prompts:quick` | Typo fixes, formatting, tiny changes |

---

## Skill Catalog

Use inside Gemini CLI with `$skill-name`.

| Skill | Trigger | Description |
|------|------|------|
| plan | `$plan` | Pro-based strategic planning |
| execute | `$execute` | Flash-based fast implementation |
| team | `$team` | Multi-agent team orchestration |
| research | `$research` | Parallel research and documentation analysis |
| context-optimize | `$context-optimize` | Context window optimization |

---

## Custom Commands

Supports TOML custom commands.

**Locations**
- Global: `~/.gemini/commands/*.toml`
- Project: `.gemini/commands/*.toml`

---

## Telegram / Discord Bot

Monitor and control OmG sessions remotely.

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## Configuration

### File locations

- Global: `~/.gemini/omg-settings.json`
- Project: `.gemini/omg-settings.json` (takes precedence)

### Example

```json
{
  "agents": {
    "max_concurrent": 6,
    "default_planner": "gemini-3.1-pro",
    "default_executor": "gemini-3.1-flash"
  },
  "context": {
    "cache_monitoring": true,
    "cache_target_rate": 0.9,
    "compaction_strategy": "cache-safe",
    "prefix_stability": true
  }
}
```

---

## CLI Commands

```bash
omg                         # Launch Gemini CLI + dashboard
omg setup                   # Install prompts/skills/commands/MCP/GEMINI.md
omg doctor                  # Run diagnostics
omg update                  # Update to latest version
omg team <description>      # Multi-agent team mode
omg team status             # Team status
omg team shutdown           # Stop team
omg status                  # Agent/cache status
omg status --cache          # Cache hit details
omg status --agents --json  # Agent status in JSON
omg status --tasks --json   # Task pipeline in JSON
omg status --context --json # Context usage in JSON
omg config set <key> <val>  # Set config
omg config get <key>        # Get config
omg bot telegram start      # Start Telegram bot
omg bot discord start       # Start Discord bot
omg help                    # Show help
```

### Runtime flags

```bash
--agent <type>     # specific agent (architect, executor, ...)
--workers <N>      # team workers (default: 4)
--model <model>    # model override
--no-dashboard     # disable dashboard
--verbose          # verbose logs
--dry-run          # plan only, no execution
```

### Status JSON fields

`omg status --json` returns:

- `agents`: active/total and agent list
- `tasks`: done/running/queued/failed counters and task list
- `cache`: `hit_rate`, `hits`, `misses`, and target rate
- `cache_history`: recent cache snapshots
- `context`: `used`, `limit`, `percentage`, and compaction threshold

---

## Project Structure

```
oh-my-gemini-cli/
├── bin/omg.js                        # CLI entry point
├── src/
│   ├── cli/                          # CLI commands
│   ├── agents/                       # Multi-agent system
│   ├── dashboard/                    # ASCII dashboard TUI
│   ├── context/                      # Context engineering engine
│   ├── orchestrator/                 # Model orchestration
│   ├── mcp/                          # MCP servers
│   ├── bot/                          # Telegram/Discord bots
│   └── shared/                       # Shared utilities
├── prompts/                          # Agent prompts
├── skills/                           # Workflow skills
├── commands/                         # Custom commands (TOML)
├── templates/                        # GEMINI.md templates
├── docs/
│   ├── README_ko.md                  # Korean docs
│   ├── history.md                    # Changelog (EN)
│   ├── history_ko.md                 # Changelog (KO)
│   └── guide/
│       ├── installation.md           # Installation guide
│       └── context-engineering.md    # Context engineering guide
├── package.json
├── tsconfig.json
├── README.md                         # English docs (this file)
└── LICENSE
```

---

## What `omg setup` does

| Step | Description |
|------|------|
| 1 | Create `.omg/` runtime directory (state, plans, logs) |
| 2 | Install prompts to `~/.gemini/prompts/` or `.gemini/prompts/` |
| 3 | Install workflow skills |
| 4 | Install custom commands to `~/.gemini/commands/` |
| 5 | Register MCP servers in `settings.json` (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | Generate project `GEMINI.md` |
| 7 | Generate default `omg-settings.json` |

---

## Tech Stack

- **Runtime**: Node.js >= 20
- **Language**: TypeScript
- **TUI**: Ink 5 (React for CLI)
- **MCP**: `@modelcontextprotocol/sdk`
- **Telegram**: `telegraf`
- **Discord**: `discord.js`
- **Build**: esbuild
- **Test**: Vitest

---

## Inspiration

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Google's open-source AI terminal agent
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Team-first multi-agent orchestration for Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Codex CLI harness
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode harness
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - context engineering principles

---

## Contributing

Contributions are welcome.

- Bug reports and feature proposals
- New agent prompts
- New skills and custom commands
- Documentation improvements
- Telegram/Discord bot improvements

## License

[MIT](./LICENSE)

## Contact

📧 kissdesty@gmail.com

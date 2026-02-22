# oh-my-gemini-cli (OMG)

<p align="center">
  <strong>Context engineering powered multi-agent harness for Gemini CLI</strong>
</p>

<p align="center">
  <em>Your Gemini is not alone.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/oh-my-gemini-cli"><img src="https://img.shields.io/npm/v/oh-my-gemini-cli.svg" alt="npm version"></a>
  <a href="https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20-green.svg" alt="Node.js"></a>
</p>

<p align="center">
  <strong>English</strong> | <a href="./README_ko.md">한국어</a>
</p>

---

> Extends [Gemini CLI](https://github.com/google-gemini/gemini-cli) from a single-session tool into a
> **context engineering powered multi-agent orchestration system**.

---

## Why OMG?

Gemini CLI is powerful: 1M token context window, Google Search grounding, MCP support. But large-scale work demands structure.

OMG adds:

- **Multi-Agent Orchestration**: Spawn multiple agents simultaneously, coordinated by task type
- **Context Engineering**: Prompt cache optimization to minimize cost and latency
- **Real-time ASCII Dashboard**: Monitor all agents in a rich terminal UI
- **Dual Model Strategy**: Gemini 3.1 Pro for planning, Flash for execution - automatically
- **External LLM Support**: Connect Claude, GPT, and others via OAuth/API
- **Remote Control**: Monitor and control sessions via Telegram/Discord bots

OMG is an add-on, not a fork. It uses only Gemini CLI's native extension points (MCP, custom commands, GEMINI.md).

## Quick Start

```bash
npm install -g oh-my-gemini-cli
omg setup
omg doctor
```

### LLM Auto-Install

Paste this into any AI agent (Cursor, Claude Code, Gemini CLI, etc.):

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### First Session

```bash
omg                                    # Launch with dashboard
omg team "Implement OAuth authentication"  # Multi-agent team mode
omg --agent architect "Analyze this codebase"  # Specific agent
```

## Dashboard Preview

```
┌─────────────────────────────────────────────────────────────────────┐
│  oh-my-gemini-cli v0.1.0          ⏱ 00:03:42    Agents: 4/6 active │
├──────────────────────────────┬──────────────────────────────────────┤
│  AGENTS                      │  TASK PIPELINE                       │
│  ◉ Planner    [Pro]  ██████░ │  ✓ analyze-auth     Planner   done   │
│  ◉ Architect  [Pro]  ████░░░ │  ● implement-oauth  Exec #1   run    │
│  ⟳ Executor#1 [Flash] ██░░░░ │  ● implement-token  Exec #2   run    │
│  ⟳ Executor#2 [Flash] ███░░░ │  ○ code-review      Reviewer  queue  │
│  ○ Reviewer   [Pro]   idle   │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│  LOG                                                                │
│  03:42 [Exec#1] ✎ Created oauth/callback.ts (42 lines)            │
│  03:42 [Planner] ✓ Task decomposition complete (5 subtasks)        │
├─────────────────────────────────────────────────────────────────────┤
│  CTX Cache: 94.2% hit │ Tokens: 12.4k/1M │ Cost: $0.03            │
├─────────────────────────────────────────────────────────────────────┤
│  [q] quit  [p] pause  [r] resume  [d] detail  [t] telegram-sync   │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Concept: Context Engineering

Inspired by [Claude Code's prompt caching lessons](https://news.hada.io/topic?id=26835), OMG applies 5 principles:

1. **Prefix Stability** - Static content first, dynamic content last. Never break the cached prefix.
2. **Tool Set Invariance** - Never add/remove tools mid-session. Use state-transition tools instead.
3. **Sub-agent Pattern** - Don't switch models mid-conversation. Use sub-agents for different models.
4. **Cache-Safe Compaction** - When summarizing, share the parent's cache prefix.
5. **System Reminders** - Update info via messages, not prompt modifications.

See the [Context Engineering Guide](./docs/guide/context-engineering.md) for details.

## Agent Types

| Agent | Model | Role |
|-------|-------|------|
| **Architect** | Gemini 3.1 Pro | Architecture analysis, design decisions |
| **Planner** | Gemini 3.1 Pro | Task decomposition, execution planning |
| **Executor** | Gemini 3.1 Flash | Code generation, file editing (parallel N) |
| **Reviewer** | Gemini 3.1 Pro | Code review, security/quality checks |
| **Debugger** | Gemini 3.1 Pro | Error analysis, root cause diagnosis |
| **Researcher** | Gemini 3.1 Pro | Web search, documentation analysis |
| **Quick** | Gemini 3.1 Flash | Typo fixes, formatting, small changes |

## CLI Commands

```bash
omg                         # Launch Gemini CLI + dashboard
omg setup                   # Install prompts/skills/commands/MCP
omg doctor                  # Run diagnostics
omg update                  # Update to latest version
omg team <description>      # Multi-agent team mode
omg team status             # Check team status
omg team shutdown           # Stop all agents
omg status --cache          # Cache hit rate details
omg bot telegram start      # Start Telegram bot
omg bot discord start       # Start Discord bot
```

## External LLM Support

```bash
omg config set external.claude.oauth true
omg auth claude

omg config set external.openai.api_key "sk-..."
```

## Project Structure

```
oh-my-gemini-cli/
├── bin/omg.js              # CLI entry point
├── src/
│   ├── cli/                # CLI commands
│   ├── agents/             # Multi-agent system
│   ├── dashboard/          # ASCII dashboard (Ink/React)
│   ├── context/            # Context engineering engine
│   ├── orchestrator/       # Model orchestration
│   ├── mcp/                # MCP servers
│   ├── bot/                # Telegram/Discord bots
│   └── shared/             # Common utilities
├── prompts/                # Agent prompt catalog
├── skills/                 # Workflow skills
├── commands/               # Custom commands (TOML)
├── templates/              # GEMINI.md templates
└── docs/                   # GitHub Pages + guides
```

## Inspiration

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Google's open-source AI terminal agent
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Codex CLI harness
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode agent harness
- [Claude Code Prompt Caching](https://news.hada.io/topic?id=26835) - Context engineering principles

## Contributing

Contributions welcome! See the [한국어 README](./README_ko.md) for detailed documentation.

## License

[MIT](./LICENSE)

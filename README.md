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



---

> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube interview*

*This project started from this insight: "What if we bring that harness to Gemini CLI?"*



---

> Extends [Gemini CLI](https://github.com/google-gemini/gemini-cli) from a single-session tool into a
> **context engineering powered multi-agent orchestration system**.

---


## Why OmG?

Gemini CLI is powerful: 1M token context window, Google Search grounding, MCP support. But large-scale work demands structure.

OmG adds:

- **Multi-Agent Orchestration**: Spawn multiple agents simultaneously, coordinated by task type
- **Context Engineering**: Prompt cache optimization to minimize cost and latency
- **Real-time ASCII Dashboard**: Monitor all agents in a rich terminal UI
- **Dual Model Strategy**: Gemini Pro for planning, Flash for execution - automatically
- **External LLM Support**: Connect Claude, GPT, and others via OAuth/API
- **Remote Control**: Monitor and control sessions via Telegram/Discord bots

OmG is an add-on, not a fork. It uses only Gemini CLI's native extension points (MCP, custom commands, GEMINI.md).

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
╔══════════════════════════════════════════════════════════════════════╗
║  ◆ OmG ◆  oh-my-gemini-cli    ⏱ TIME 03:42   PARTY ♦♦♦♦◇◇ 4/6  ▸ ║
╠════════════════════════════════╦═════════════════════════════════════╣
║  ═══ PARTY MEMBERS ═══        ║  ═══ QUEST LOG ═══                  ║
║                               ║  ★ 2/7 quests cleared               ║
║  📜 Planner    [PRO]  ATK     ║                                     ║
║     HP ▓▓▓▓▓▓▒░ 82%          ║  ★ [CLEAR!] analyze-auth  → Plan   ║
║  🏰 Architect [PRO]  ATK     ║  ⚡ [ACTIVE] impl-oauth   → Exec#1 ║
║     HP ▓▓▓▓▒░░░ 52%          ║  ⚡ [ACTIVE] impl-token   → Exec#2 ║
║  ⚔️  Exec#1   [FLASH] ATK     ║  · [WAIT]   code-review  → Review  ║
║     HP ▓▓░░░░░░ 25%          ║                                     ║
║  🛡️  Reviewer [PRO]   ZZZ     ║                                     ║
╠════════════════════════════════╩═════════════════════════════════════╣
║  ═══ BATTLE LOG ═══                                                 ║
║  [03:42] ⚔️ Exec#1 used CodeWrite! oauth/callback.ts created!      ║
║  [03:42] ★ Planner cast TaskDecompose! 5 subtasks appeared!        ║
╠═════════════════════════════════════════════════════════════════════╣
║  CACHE ▓▓▓▓▓░ 94%  │  TOKENS 12.4k/1M  │  GOLD -$0.03            ║
║  A:quit  B:pause  X:resume  Y:detail  SELECT:tg-sync              ║
╚═════════════════════════════════════════════════════════════════════╝
```

## Core Concept: Context Engineering

Inspired by [Claude Code's prompt caching lessons](https://x.com/trq212/status/2024574133011673516), OmG applies 5 principles:

1. **Prefix Stability** - Static content first, dynamic content last. Never break the cached prefix.
2. **Tool Set Invariance** - Never add/remove tools mid-session. Use state-transition tools instead.
3. **Sub-agent Pattern** - Don't switch models mid-conversation. Use sub-agents for different models.
4. **Cache-Safe Compaction** - When summarizing, share the parent's cache prefix.
5. **System Reminders** - Update info via messages, not prompt modifications.

See the [Context Engineering Guide](./docs/guide/context-engineering.md) for details.

## Agent Types

| Agent | Model | Role |
|-------|-------|------|
| **Architect** | Gemini Pro | Architecture analysis, design decisions |
| **Planner** | Gemini Pro | Task decomposition, execution planning |
| **Executor** | Gemini Flash | Code generation, file editing (parallel N) |
| **Reviewer** | Gemini Pro | Code review, security/quality checks |
| **Debugger** | Gemini Pro | Error analysis, root cause diagnosis |
| **Researcher** | Gemini Pro | Web search, documentation analysis |
| **Quick** | Gemini Flash | Typo fixes, formatting, small changes |

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
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Teams-first Multi-agent orchestration for Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Codex CLI harness
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode agent harness
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - Context engineering principles

## Contributing

Contributions welcome! See the [한국어 README](./docs/README_ko.md) for detailed documentation.

## License

[MIT](./LICENSE)

## Contact

📧 kissdesty@gmail.com

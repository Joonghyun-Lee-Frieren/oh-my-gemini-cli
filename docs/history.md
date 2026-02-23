# Changelog

All notable changes to oh-my-gemini-cli are documented here.

---

## v0.1.4 — Gemini CLI Add-on Compatibility Pass (2026-02-23)

**Integration first.** Focused on making OmG behave as a practical Gemini CLI add-on with aligned MCP wiring, status outputs, and command behavior.

### MCP Integration
- Added a real MCP stdio server entrypoint (`--mcp`) using `@modelcontextprotocol/sdk`
- Added per-server launch routing with `--server <state|memory|context|orchestrator>`
- `omg setup` now registers all 4 MCP servers in `~/.gemini/settings.json`
- `omg doctor` now validates all required OmG MCP server registrations

### CLI / Command Alignment
- Added `omg status` options:
  - `--agents`, `--tasks`, `--cache`, `--cache-history`, `--context`, `--json`
- Added structured JSON status payloads aligned with custom command templates:
  - agent summary, task pipeline counters, cache fields (`hit_rate`, `hits`, `misses`), context usage
- Switched agent worker prompt arg from `--prompt` to `-p` for Gemini CLI invocation compatibility

### Config and Runtime Robustness
- Added backward-compatible `loadConfig()` adapter in `src/shared/config.ts` for legacy modules
- Upgraded `omg config get/set` to support dotted key paths (e.g. `bot.telegram.token`)
- Implemented `omg bot telegram start` and `omg bot discord start` to boot bot modules from config

### Documentation Sync
- Updated README and Korean README for:
  - 4 MCP server registration in setup
  - JSON-capable status commands and output field descriptions

---

## v0.1.3 — Installation Path Hardening (2026-02-23)

**Safer onboarding.** Installation docs now prioritize a path that works even when npm registry package access is unavailable.

### Installation & Docs
- **GitHub install as primary path**: Updated Quick Start and installation docs to recommend `npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main`
- **Fallback path documented**: Kept npm registry install as optional when available
- **Gemini CLI package fix**: Corrected prerequisite command from `@anthropic-ai/gemini-cli` to `@google/gemini-cli`
- **404 troubleshooting**: Added explicit `404 Not Found` guidance and fallback command
- Updated in: `README.md`, `docs/README_ko.md`, `docs/guide/installation.md`, `docs/index.html`

### Packaging Reliability
- Added `prepare` and `prepack` scripts in `package.json` to run build during install/pack flows

---

## v0.1.2 — Model Display & Branding Polish (2026-02-22)

**Better clarity.** Improved model name display and brand consistency.

### Dashboard Updates
- **Full model name display**: Agent panels now show complete model names (e.g. `[gemini-3.1-pro]`, `[gemini-3.1-flash]`) instead of generic `[PRO]` / `[FLASH]` tags
- Panel width adjusted to accommodate longer model names

### Documentation Updates
- **Version agnostic naming**: Changed all prose references from "Gemini 3.1 Pro/Flash" to "Gemini Pro/Flash" (version numbers can change)
- **Code examples unchanged**: Actual model IDs in config examples still show full version (e.g. `gemini-3.1-pro`) as these are real identifiers
- **Brand consistency**: Updated "OMG" to "OmG" (mixed case) throughout all documentation
- **New tagline**: Changed from "Your Gemini is not alone" to **"Gemini thinks. OmG orchestrates."**
- Updated in: README.md, README_ko.md, docs/, and ASCII art boot screen

---

## v0.1.1 — Retro Pixel Art Dashboard (2026-02-22)

**The glow-up.** Complete TUI dashboard redesign with retro pixel art / RPG game aesthetics.

### Dashboard Redesign
- **Theme overhaul**: New retro color palette with hex colors (#ff6b9d pink, #c084fc purple, #67e8f9 cyan, #fbbf24 gold, #4ade80 green)
- **RPG-style agent status**: ATK (running), WIN (completed), KO (failed), ZZZ (idle), RDY (assigned)
- **Agent sprites**: Each agent type has a pixel art emoji (🏰 Architect, 📜 Planner, ⚔️ Executor, 🛡️ Reviewer, 🔧 Debugger, 🔮 Researcher, ⚡ Quick)
- **HP bar progress**: Game-style health bars with `▓▒░` characters, color shifts by percentage (green > yellow > red)
- **Party Members panel**: RPG party screen with quest text and class tags ([PRO] in gold, [FLASH] in cyan)
- **Quest Log**: Task pipeline as quest log with `★ [CLEAR!]`, `⚡ [ACTIVE]`, `· [WAIT]` status markers
- **Battle Log**: Event log formatted as RPG combat messages ("Exec#1 used CodeWrite! oauth/callback.ts created!")
- **Game HUD header**: `◆ OmG ◆` title, `⏱ TIME` counter, `PARTY ♦♦♦♦◇◇` visualization
- **Game controls status bar**: `CACHE ▓▓▓▓▓░ 94%` | `TOKENS` | `GOLD` meters, gamepad-style shortcut hints
- **Retro boot screen**: 4-frame startup animation with `░▒▓█ LOADING █▓▒░` and `CONTEXT QUEST` title
- **Double-line borders**: `╔═╗║╚═╝` throughout for authentic retro feel
- **New spinner styles**: pixel (`◜◝◞◟`), block (`▙▛▜▟`), music (`♩♪♫♬`), sword (`╱─╲│`)
- **GAME PAUSED overlay**: Retro pause screen with pixelated border

### Documentation
- Moved `README_ko.md`, `history.md`, `history_ko.md` to `docs/` folder
- Added changelog links to README.md and README_ko.md headers
- Updated dashboard previews in both READMEs to retro style

---

## v0.1.0 — Initial Release (2026-02-22)

**The foundation.** First complete implementation of the context engineering powered multi-agent harness for Gemini CLI.

### Core Architecture
- CLI entry point (`bin/omg.js`) with Commander.js-based command routing
- Commands: `omg`, `omg setup`, `omg doctor`, `omg team`, `omg status`, `omg config`, `omg bot`, `omg update`
- Global flags: `--agent`, `--workers`, `--model`, `--no-dashboard`, `--verbose`, `--dry-run`

### Multi-Agent System
- **AgentPool**: concurrent agent management (max 6 simultaneous)
- **AgentWorker**: individual agent lifecycle (idle -> assigned -> running -> completed/failed)
- **TaskRouter**: keyword-based task-to-agent routing with dependency graph support
- **TaskQueue**: priority-based queue (critical/high/normal/low) with retry logic
- **AgentRegistry**: 7 agent types mapped to model configs
- Agent types: Architect, Planner, Executor, Reviewer, Debugger, Researcher, Quick

### ASCII Dashboard (TUI)
- Ink 5 (React for CLI) based real-time terminal dashboard
- Components: Header, AgentGrid, AgentPanel, TaskList, LogPanel, StatusBar, AsciiArt
- Agent status icons: `◉` (assigned), `⟳` (running), `✓` (completed), `✗` (failed), `○` (idle)
- Braille spinner animation, ASCII progress bar (`██░░`)
- Keyboard shortcuts: q/p/r/d/t/Tab/1-9
- Startup logo animation

### Context Engineering Engine
- **CacheManager**: hit/miss tracking with persistent stats
- **ContextLayer**: 5-layer ordering (SystemPrompt > Tools > GEMINI.md > Session > Conversation)
- **Compaction**: cache-safe forking preserving parent prefix
- **PrefixOptimizer**: SHA-256 hash-based prefix stability detection and break-point identification

### Model Orchestration
- Dual model strategy: Gemini Pro (planning) + Flash (execution)
- **ModelRegistry**: built-in + external model support
- **Planner**: Pro-based task decomposition with handoff messages
- **Executor**: Flash-based rapid code generation with timeout management
- **ExternalLLM**: OAuth + API key support for Claude, GPT, etc.

### MCP Servers
- `omg_state`: agent/task/mode state management via `.omg/state/`
- `omg_memory`: project memory with categories (architecture, decisions, conventions, todo)
- `omg_context`: context prefix stats, optimization suggestions, compaction triggers
- `omg_orchestrator`: model routing (plan -> Pro, execute -> Flash, delegate -> auto)

### Agent Prompts (7)
- architect, planner, executor, reviewer, debugger, researcher, quick

### Workflow Skills (5)
- plan, execute, team, research, context-optimize

### Custom Commands (4 TOML)
- `/omg:status`, `/omg:optimize`, `/omg:team`, `/omg:cache`

### Bot Integration
- Telegram bot: 8 commands (/status, /agents, /tasks, /pause, /resume, /screenshot, /send, /cache)
- Discord bot: same commands with Embed-based messages

### Documentation
- README.md (English)
- README_ko.md (Korean) with full context engineering guide
- GitHub Pages landing page (`docs/index.html`)
- LLM auto-installation guide (`docs/guide/installation.md`)
- Context engineering guide (`docs/guide/context-engineering.md`)

### Project Infrastructure
- TypeScript + ESM modules
- esbuild bundling, Vitest testing
- GEMINI.md template for project setup
- `.gitignore`, LICENSE (MIT)

# oh-my-gemini-cli Installation Guide

> **For LLM Agents**: This guide is designed to be followed step-by-step by AI coding assistants (Cursor, Claude Code, Gemini CLI, etc.). Each step includes verification commands and error handling.

---

## Prerequisites

Before installing, verify the following requirements:

### Check Node.js (>= 20 required)

```bash
node --version
```

**Expected**: `v20.x.x` or higher.

If Node.js is not installed or version is below 20:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

### Check Gemini CLI

```bash
gemini --version
```

**Expected**: Any version output confirms Gemini CLI is installed.

If Gemini CLI is not installed:
```bash
npm install -g @google/gemini-cli
# (Gemini CLI 미설치 시 위 명령어로 설치)
```

> **Note (참고)**: Gemini CLI authentication must be configured. Run `gemini` once and follow the Google login flow if not already authenticated.

### Check npm

```bash
npm --version
```

**Expected**: `9.x.x` or higher (bundled with Node.js 20+).

---

## Step 1: Install oh-my-gemini-cli

### Option A (Recommended): Install from GitHub

Use this when npm registry package is unavailable.

```bash
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main
```

### Option B: Install from npm registry

Use this when the package is published and accessible in your environment.

```bash
npm install -g oh-my-gemini-cli
```

### Verify Installation

```bash
omg --version
```

**Expected output**: `0.1.2` (or current version number).

### Troubleshooting Step 1

| Problem | Solution |
|---------|----------|
| `EACCES` permission error | Use `sudo npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main` or fix npm permissions: `npm config set prefix ~/.npm-global` |
| `command not found: omg` | Ensure npm global bin is in PATH. Run `npm config get prefix` and add `<prefix>/bin` to PATH |
| `404 Not Found` for `oh-my-gemini-cli` | Install from GitHub: `npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main` |
| Network error | Check internet connection. Try `npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main` |

---

## Step 2: Setup in Your Project

Navigate to your project directory, then run:

```bash
cd /path/to/your/project
omg setup
```

### What `omg setup` Does (omg setup이 수행하는 작업)

1. Creates `.omg/` runtime directory (state, plans, logs)
2. Installs agent prompts to `~/.gemini/prompts/` or `.gemini/prompts/`
3. Installs workflow skills
4. Installs custom commands to `~/.gemini/commands/`
5. Registers MCP servers in `settings.json` (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`)
6. Generates project `GEMINI.md` with orchestration guide
7. Creates `omg-settings.json` with default configuration

### Verify Setup

```bash
# Check that setup completed successfully
omg doctor
```

**Expected output**: All checks should show ✓ (green). Example:

```
✓ Node.js >= 20
✓ Gemini CLI installed
✓ Gemini authenticated
✓ omg-settings.json exists
✓ MCP servers registered
✓ Agent prompts installed
✓ Skills installed
✓ Commands installed
```

### Troubleshooting Step 2

| Problem | Solution |
|---------|----------|
| Missing GEMINI.md | Run `omg setup` again from project root |
| MCP server not registered | Check `~/.gemini/settings.json` for `omg_*` entries. Re-run `omg setup` |
| Permission denied | Ensure write access to `~/.gemini/` and project `.gemini/` directories |

---

## Step 3: Verify with Doctor

```bash
omg doctor
```

This command performs a comprehensive health check:

- **Node.js version**: Must be >= 20
- **Gemini CLI**: Must be installed and accessible
- **Authentication**: Gemini must be authenticated (Google login, API key, or Vertex AI)
- **Configuration**: `omg-settings.json` must exist
- **MCP Servers**: All 4 MCP servers must be registered
- **Prompts/Skills**: Agent prompts and skills must be installed

### If Any Check Fails

```bash
# Re-run setup to fix most issues
omg setup

# Then verify again
omg doctor
```

---

## Step 4: Configure (Optional / 선택 사항)

### 4a. External LLM Setup (외부 LLM 연결)

To use Claude, GPT, or other models alongside Gemini:

**Claude (OAuth)**:
```bash
omg config set external.claude.oauth true
omg auth claude
```

**OpenAI (API Key)**:
```bash
omg config set external.openai.api_key "sk-your-api-key-here"
```

### 4b. Model Configuration (모델 설정)

Customize which models are used for each agent role:

```bash
# View current model assignments
omg config get models

# Change executor model
omg config set models.executor "gemini-3.1-flash"

# Change planner model
omg config set models.planner "gemini-3.1-pro"
```

### 4c. Telegram Bot Setup (텔레그램 봇 설정)

```bash
# Set bot token (get from @BotFather on Telegram)
omg config set bot.telegram.token "YOUR_BOT_TOKEN"

# Start the bot
omg bot telegram start
```

### 4d. Discord Bot Setup (디스코드 봇 설정)

```bash
# Set bot token (get from Discord Developer Portal)
omg config set bot.discord.token "YOUR_BOT_TOKEN"

# Start the bot
omg bot discord start
```

### Verify Configuration

```bash
# Check all settings
omg config get

# Check specific setting
omg config get models.planner
```

---

## Step 5: First Run (첫 실행)

### Basic Launch

```bash
# Start Gemini CLI with OmG dashboard
omg
```

### Multi-Agent Team Mode

```bash
# Start a multi-agent session with a task description
omg team "Implement user authentication with OAuth"
```

### Verify It's Working

When the dashboard appears, you should see:
- ASCII art header with version
- Agent panel showing active agents
- Task pipeline
- Log panel with real-time updates
- Status bar with cache hit rate

---

## Quick Reference (빠른 참조)

```bash
# Full install sequence
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main  # Install
cd /path/to/your/project           # Navigate to project
omg setup                          # Setup
omg doctor                         # Verify

# Common commands
omg                                # Launch with dashboard
omg team "task description"        # Multi-agent mode
omg team --workers 4 "task"        # Specify worker count
omg status                         # Check agent status
omg status --cache                 # Check cache hit rate
omg help                           # Show help
```

---

## Troubleshooting (문제 해결)

### Common Issues

#### "Cannot find module" Error
```bash
# Reinstall
npm uninstall -g oh-my-gemini-cli
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main
```

#### Gemini CLI Authentication Failed
```bash
# Re-authenticate
gemini
# Follow the Google login flow
```

#### MCP Server Connection Issues
```bash
# Check MCP server status
omg status

# Re-register MCP servers
omg setup
```

#### Cache Hit Rate is Low (캐시 적중률이 낮을 때)
```bash
# Check cache status
omg status --cache

# Optimize context
omg config set context.prefix_stability true
omg config set context.compaction_strategy "cache-safe"
```

#### Dashboard Not Rendering
```bash
# Try without dashboard
omg --no-dashboard

# Check terminal supports Unicode
echo "✓ ◉ ⟳ ██░░"
```

### Getting Help

- GitHub Issues: https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/issues
- Documentation: https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli

---

## System Requirements Summary (시스템 요구사항 요약)

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | macOS, Linux, Windows (WSL2) | macOS, Linux |
| Node.js | >= 20.0.0 | Latest LTS |
| Gemini CLI | Any version | Latest |
| Terminal | UTF-8 support | 256-color support |
| Network | Required for install | Required for LLM API calls |

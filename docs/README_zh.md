# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>面向 Gemini CLI 的上下文工程多代理编排工具</strong>
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
  <a href="https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/">Landing Page</a>
</p>

<p align="center">
  <a href="../README.md">English</a> | <a href="./README_ko.md">한국어</a> | <a href="./README_ja.md">日本語</a> | <strong>中文</strong> | <a href="./README_es.md">Español</a> | <a href="./README_pt.md">Português</a> | <a href="./README_fr.md">Français</a> | <a href="./README_nl.md">Nederlands</a> | <a href="./README_pl.md">Polski</a> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <a href="./README_de.md">Deutsch</a> | <a href="./history.md">Changelog</a>
</p>





> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*本项目源于这一洞察：「若将这套编排能力应用到 Gemini CLI 会怎样？」*





> 将 **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** 从单会话工具扩展为
> **基于上下文工程的多代理编排系统**。





## 目录

- [为什么选择 oh-my-gemini-cli？](#为什么选择-oh-my-gemini-cli)
- [快速开始](#快速开始)
- [核心概念：上下文工程](#核心概念上下文工程)
- [多代理系统](#多代理系统)
- [ASCII 仪表盘](#ascii-仪表盘)
- [模型编排](#模型编排)
- [代理目录](#代理目录)
- [技能目录](#技能目录)
- [自定义命令](#自定义命令)
- [Telegram / Discord 机器人](#telegram--discord-机器人)
- [配置](#配置)
- [CLI 命令](#cli-命令)
- [项目结构](#项目结构)
- [贡献](#贡献)
- [许可证](#许可证)

---

## 为什么选择 oh-my-gemini-cli？

Gemini CLI 功能强大：1M 上下文窗口、Google Search  grounding、MCP 支持。  
但大规模任务仍需要结构化。

OmG 提供：

- **多代理编排**：按任务类型并行创建多个代理并协调执行
- **上下文工程**：通过 Prompt Cache 优化降低延迟与成本
- **实时 ASCII 仪表盘**：在终端 UI 中监控所有代理
- **双模型策略**：Gemini Pro（规划）+ Gemini Flash（执行）
- **外部 LLM 支持**：通过 OAuth/API 连接 Claude、GPT 等模型
- **远程控制**：通过 Telegram/Discord 机器人监控与控制会话

OmG 是附加组件，而非 fork。仅使用 Gemini CLI 原生扩展点：MCP、自定义命令、`GEMINI.md`。

---

## 快速开始

### 环境要求

- macOS、Linux 或 Windows（推荐 WSL2）
- Node.js >= 20
- 已安装 [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- 已完成 Gemini 认证（Google 登录、API 密钥或 Vertex AI）

### 安装

```bash
# 推荐：npm 注册表包不可用时也可使用
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# 可选：若环境中 npm 注册表包可用
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> 注意：若 `npm install -g oh-my-gemini-cli` 出现 `404 Not Found`，请使用上述 GitHub 安装命令。

### npm 发布切换清单

- 确认 npm 包页面及 `latest` dist-tag 可用
- 在干净环境中验证 `npm install -g oh-my-gemini-cli` 可运行
- 将文档默认安装命令从 GitHub 切换为 npm 注册表
- 在故障排除章节保留 GitHub 安装作为备选

### LLM 自动安装

将以下内容粘贴到任意 AI 编程助手（Cursor、Claude Code、Gemini CLI 等）中：

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### 首次会话

```bash
# 基础启动（Gemini CLI + 仪表盘）
omg

# 多代理团队模式
omg team "Implement OAuth authentication"

# 使用指定代理
omg --agent architect "Analyze this codebase architecture"
```

---

## 核心概念：上下文工程

> **"Cache Rules Everything Around Me"**
> — 在代理时代，缓存依然主导一切。

oh-my-gemini-cli 的核心哲学是 **上下文工程**。  
受 [Claude Code 提示缓存经验](https://x.com/trq212/status/2024574133011673516) 启发，并适配 Gemini CLI。

### 什么是 Prompt Caching？

在长时间运行的代理工作流中，**Prompt Caching** 复用先前计算，显著降低延迟与成本。  
缓存基于 **前缀匹配**。

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

### 五项核心原则

#### 1. 前缀稳定性

前缀的任何变更都会使后续缓存失效。  
OmG 将静态内容置于前、动态内容置于后，以最大化缓存命中。

#### 2. 工具集不变性

增删工具会破坏缓存。OmG 通过以下方式避免：
- 计划模式使用状态转换工具，而非变更工具列表
- 使用懒加载 MCP 存根，而非在会话中修改完整工具集

#### 3. 子代理替代模型切换

Prompt Cache 与模型绑定。  
OmG 不在单一线程中切换模型，而是使用拥有独立模型缓存的子代理。

#### 4. 缓存安全压缩

当必须压缩上下文时，OmG 通过缓存安全分叉保留父级缓存前缀。

#### 5. 系统提醒用于更新

OmG 不直接修改系统提示内容，而是在消息流中追加更新信号。

### 缓存监控

OmG 将缓存命中率视为可用性指标。

```bash
omg status --cache
```

---

## 多代理系统

OmG 根据任务类型并行创建多个代理，并协调执行。

### 架构

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

### 代理类型

| Agent | Model | Role |
|------|------|------|
| **Architect** | Gemini Pro | 架构分析、设计决策、依赖映射 |
| **Planner** | Gemini Pro | 任务分解、执行计划、优先级 |
| **Executor** | Gemini Flash | 代码生成、文件编辑、重构（并行 N） |
| **Reviewer** | Gemini Pro | 代码审查、质量检查、安全检查 |
| **Debugger** | Gemini Pro | 错误分析、调试、修复失败测试 |
| **Researcher** | Gemini Pro | 网络研究、文档分析、库比较 |
| **Quick** | Gemini Flash | 小任务：拼写修正、格式化、微小变更 |

### 生命周期

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### 流水线示例

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## ASCII 仪表盘

使用 Ink（CLI 版 React）构建的实时终端仪表盘。

### 仪表盘预览

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

### 快捷键

| Key | Action |
|----|------|
| `q` / `Ctrl+C` | 退出 |
| `p` | 暂停所有代理 |
| `r` | 恢复 |
| `d` | 显示选中代理的详细流 |
| `t` | 切换 Telegram/Discord 同步 |
| `Tab` | 在代理间移动焦点 |
| `Enter` | 打开焦点代理的详细面板 |
| `1`-`9` | 按编号聚焦代理 |

---

## 模型编排

### 双模型策略

OmG 默认 **Pro 负责规划，Flash 负责执行**。

### 外部 LLM 集成

```bash
# 通过 OAuth 连接 Claude
omg config set external.claude.oauth true
omg auth claude

# 通过 API 密钥连接 OpenAI
omg config set external.openai.api_key "sk-..."
```

---

## 代理目录

在 Gemini CLI 内使用 `/prompts:name` 调用。

| Agent | Command | Description |
|------|------|------|
| Architect | `/prompts:architect` | 架构分析、设计决策、依赖图 |
| Planner | `/prompts:planner` | 任务分解、执行计划、里程碑 |
| Executor | `/prompts:executor` | 代码生成与编辑、重构 |
| Reviewer | `/prompts:reviewer` | 审查：安全/性能/质量 |
| Debugger | `/prompts:debugger` | 错误分析、堆栈解读、修复 |
| Researcher | `/prompts:researcher` | 网络搜索、文档分析、库比较 |
| Quick | `/prompts:quick` | 拼写修正、格式化、微小变更 |

---

## 技能目录

在 Gemini CLI 内使用 `$skill-name` 调用。

| Skill | Trigger | Description |
|------|------|------|
| plan | `$plan` | 基于 Pro 的战略规划 |
| execute | `$execute` | 基于 Flash 的快速实现 |
| team | `$team` | 多代理团队编排 |
| research | `$research` | 并行研究与文档分析 |
| context-optimize | `$context-optimize` | 上下文窗口优化 |

---

## 自定义命令

支持 TOML 自定义命令。

**位置**
- 全局：`~/.gemini/commands/*.toml`
- 项目：`.gemini/commands/*.toml`

---

## Telegram / Discord 机器人

远程监控与控制 OmG 会话。

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## 配置

### 文件位置

- 全局：`~/.gemini/omg-settings.json`
- 项目：`.gemini/omg-settings.json`（优先）

### 示例

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

## CLI 命令

```bash
omg                         # 启动 Gemini CLI + 仪表盘
omg setup                   # 安装 prompts/skills/commands/MCP/GEMINI.md
omg doctor                  # 运行诊断
omg update                  # 更新到最新版本
omg team <description>      # 多代理团队模式
omg team status             # 团队状态
omg team shutdown           # 停止团队
omg status                  # 代理/缓存状态
omg status --cache          # 缓存命中详情
omg status --agents --json  # JSON 格式代理状态
omg status --tasks --json   # JSON 格式任务流水线
omg status --context --json # JSON 格式上下文使用量
omg config set <key> <val>  # 设置配置
omg config get <key>        # 获取配置
omg bot telegram start      # 启动 Telegram 机器人
omg bot discord start       # 启动 Discord 机器人
omg help                    # 显示帮助
```

### 运行时标志

```bash
--agent <type>     # 指定代理（architect, executor, ...）
--workers <N>      # 团队工作进程数（默认：4）
--model <model>    # 模型覆盖
--no-dashboard     # 禁用仪表盘
--verbose          # 详细日志
--dry-run          # 仅规划，不执行
```

### 状态 JSON 字段

`omg status --json` 返回：

- `agents`：活跃/总数及代理列表
- `tasks`：完成/运行中/排队/失败计数及任务列表
- `cache`：`hit_rate`、`hits`、`misses`、目标率
- `cache_history`：最近缓存快照
- `context`：`used`、`limit`、`percentage`、压缩阈值

---

## 项目结构

```
oh-my-gemini-cli/
├── bin/omg.js                        # CLI 入口
├── src/
│   ├── cli/                          # CLI 命令
│   ├── agents/                       # 多代理系统
│   ├── dashboard/                    # ASCII 仪表盘 TUI
│   ├── context/                      # 上下文工程引擎
│   ├── orchestrator/                 # 模型编排
│   ├── mcp/                          # MCP 服务器
│   ├── bot/                          # Telegram/Discord 机器人
│   └── shared/                       # 共享工具
├── prompts/                          # 代理提示
├── skills/                           # 工作流技能
├── commands/                         # 自定义命令（TOML）
├── templates/                        # GEMINI.md 模板
├── docs/
│   ├── README_ko.md                  # 韩文文档
│   ├── history.md                    # 变更日志（英文）
│   ├── history_ko.md                 # 变更日志（韩文）
│   └── guide/
│       ├── installation.md           # 安装指南
│       └── context-engineering.md    # 上下文工程指南
├── package.json
├── tsconfig.json
├── README.md                         # 英文文档（本文件）
└── LICENSE
```

---

## `omg setup` 的作用

| Step | Description |
|------|------|
| 1 | 创建 `.omg/` 运行时目录（状态、计划、日志） |
| 2 | 将 prompts 安装到 `~/.gemini/prompts/` 或 `.gemini/prompts/` |
| 3 | 安装工作流技能 |
| 4 | 将自定义命令安装到 `~/.gemini/commands/` |
| 5 | 在 `settings.json` 中注册 MCP 服务器（`omg_state`、`omg_memory`、`omg_context`、`omg_orchestrator`） |
| 6 | 生成项目 `GEMINI.md` |
| 7 | 生成默认 `omg-settings.json` |

---

## 技术栈

- **运行时**：Node.js >= 20
- **语言**：TypeScript
- **TUI**：Ink 5（CLI 用 React）
- **MCP**：`@modelcontextprotocol/sdk`
- **Telegram**：`telegraf`
- **Discord**：`discord.js`
- **构建**：esbuild
- **测试**：Vitest

---

## 灵感来源

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Google 开源 AI 终端代理
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Claude Code 团队优先多代理编排
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Codex CLI 编排
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode 编排
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - 上下文工程原则

---

## 贡献

欢迎贡献。

- 问题反馈与功能建议
- 新代理提示
- 新技能与自定义命令
- 文档改进
- Telegram/Discord 机器人改进

## 许可证

[MIT](../LICENSE)

## 联系方式

📧 kissdesty@gmail.com

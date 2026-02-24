# oh-my-gemini-cli (OmG)

[落地页](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [更新历史](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [日本語](./README_ja.md) | [Français](./README_fr.md) | [Español](./README_es.md)

面向 Gemini CLI 的、由上下文工程驱动的多代理工作流扩展包。

> "Claude Code 的核心竞争力不是 Opus 或 Sonnet 引擎，而是 Claude Code 本身。令人意外的是，给 Gemini 加上同样的编排框架后也能很好地工作。"
>
> - 申正奎（Lablup Inc. CEO），YouTube 访谈

本项目正是从这个观察出发：
“如果把这套编排框架带到 Gemini CLI，会怎样？”

OmG 将 Gemini CLI 从单会话助手扩展为结构化、角色驱动的工程工作流。

OmG 以官方扩展模型实现为 Gemini CLI 原生扩展。

- `gemini-extension.json` 清单
- `agents/` 子代理
- `commands/` 斜杠命令
- `skills/` 可复用工作流
- `context/` 共享上下文

## 安装

使用官方扩展命令从 GitHub URL 安装：

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

交互模式验证：

```text
/extensions list
```

非交互验证：

```bash
gemini extensions list
```

说明：安装/更新命令应在终端模式（`gemini extensions ...`）执行，而不是在交互式斜杠命令模式下执行。

## 为什么选择 OmG

- 复杂任务需要可复用的结构，而不仅是更大的上下文窗口。
- 按角色分工可提高规划、实现、评审和调试阶段的质量。
- 面向缓存稳定性的上下文策略可降低长会话成本并提升稳定性。

## 使用

### 命令

这些命令定义在 `commands/omg/*.toml`：

- `/omg:status`
- `/omg:team`
- `/omg:optimize`
- `/omg:cache`

### 技能

- `$plan`
- `$execute`
- `$team`
- `$research`
- `$context-optimize`

### 子代理

- `omg-architect`
- `omg-planner`
- `omg-executor`
- `omg-reviewer`
- `omg-debugger`
- `omg-researcher`
- `omg-quick`

子代理通过扩展的 `agents/` 定义提供。

## 项目结构

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

## 迁移说明

本仓库不再将 `omg setup` 作为主要上手流程。

- 旧流程：全局安装包 + setup 复制
- 新流程：通过 `gemini extensions install ...` 直接安装扩展

`src/` 下的旧运行时代码仍保留在仓库中，但扩展行为已切换为基于清单的加载方式。

## 文档

- [英文 README](../README.md)
- [安装指南](./guide/installation.md)
- [更新历史](./history.md)

## 许可证

MIT


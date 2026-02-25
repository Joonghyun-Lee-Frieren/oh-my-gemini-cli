# oh-my-gemini-cli (OmG)

[落地页](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [更新历史](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [日本語](./README_ja.md) | [Français](./README_fr.md) | [Español](./README_es.md)

面向 Gemini CLI 的、由上下文工程驱动的多代理工作流扩展。

> "Claude Code 的核心竞争力不是 Opus 或 Sonnet 引擎，而是 Claude Code 本身。令人意外的是，给 Gemini 加上同样的编排框架后也能很好地工作。"
>
> - 申正奎（Lablup Inc. CEO），YouTube 访谈

OmG 将 Gemini CLI 从单会话助手扩展为结构化、角色驱动的工程工作流。

## v0.3.0 关键更新

- 分阶段团队流水线：`team-plan -> team-prd -> team-exec -> team-verify -> team-fix`
- 运行模式：`balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`
- 生命周期命令：`/omg:launch`, `/omg:checkpoint`, `/omg:stop`, `/omg:mode`
- 新增专业子代理：`omg-product`, `omg-verifier`, `omg-consensus`
- 新增技能：`$prd`, `$ralplan`, `$autopilot`, `$ralph`, `$ultrawork`, `$consensus`, `$mode`, `$cancel`

## 安装

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

```text
/extensions list
```

```bash
gemini extensions list
```

说明：安装/更新命令应在终端模式（`gemini extensions ...`）执行。

## 主要命令

### 流水线

- `/omg:team`
- `/omg:team-plan`
- `/omg:team-prd`
- `/omg:team-exec`
- `/omg:team-verify`
- `/omg:team-fix`

### 模式 / 生命周期

- `/omg:mode`
- `/omg:autopilot`
- `/omg:ralph`
- `/omg:ultrawork`
- `/omg:consensus`
- `/omg:launch`
- `/omg:checkpoint`
- `/omg:stop`

### 运行辅助

- `/omg:status`
- `/omg:optimize`
- `/omg:cache`

## 技能

- `$plan`
- `$ralplan`
- `$prd`
- `$execute`
- `$team`
- `$autopilot`
- `$ralph`
- `$ultrawork`
- `$consensus`
- `$mode`
- `$cancel`
- `$research`
- `$context-optimize`

## 子代理

- `omg-architect`
- `omg-planner`
- `omg-product`
- `omg-executor`
- `omg-reviewer`
- `omg-verifier`
- `omg-debugger`
- `omg-consensus`
- `omg-researcher`
- `omg-quick`

## 文档

- [英文 README](../README.md)
- [安装指南](./guide/installation.md)
- [Context Engineering Guide (EN)](./guide/context-engineering.md)
- [更新历史](./history.md)

## 许可证

MIT

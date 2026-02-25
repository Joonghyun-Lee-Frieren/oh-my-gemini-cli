# oh-my-gemini-cli (OmG)

[ランディングページ](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [変更履歴](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [Français](./README_fr.md) | [中文](./README_zh.md) | [Español](./README_es.md)

Gemini CLI 向けの、コンテキストエンジニアリング駆動マルチエージェント・ワークフロー拡張です。

> "Claude Code の本当の競争力は Opus や Sonnet ではなく、Claude Code そのものだ。Gemini でも同じハーネスを付けると十分にうまく動く。"
>
> - シン・ジョンギュ（Lablup Inc. CEO）、YouTube インタビューより

OmG は Gemini CLI を単発セッションのツールから、構造化された役割分担型エンジニアリング・ワークフローへ拡張します。

## v0.3.0 の主な更新

- ステージ型チームパイプライン: `team-plan -> team-prd -> team-exec -> team-verify -> team-fix`
- 運用モード: `balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`
- ライフサイクルコマンド: `/omg:launch`, `/omg:checkpoint`, `/omg:stop`, `/omg:mode`
- 新しい専門エージェント: `omg-product`, `omg-verifier`, `omg-consensus`
- 新しいスキル: `$prd`, `$ralplan`, `$autopilot`, `$ralph`, `$ultrawork`, `$consensus`, `$mode`, `$cancel`

## インストール

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

```text
/extensions list
```

```bash
gemini extensions list
```

注意: インストール/更新コマンドはターミナルモード（`gemini extensions ...`）で実行します。

## 主なコマンド

### パイプライン

- `/omg:team`
- `/omg:team-plan`
- `/omg:team-prd`
- `/omg:team-exec`
- `/omg:team-verify`
- `/omg:team-fix`

### モード / ライフサイクル

- `/omg:mode`
- `/omg:autopilot`
- `/omg:ralph`
- `/omg:ultrawork`
- `/omg:consensus`
- `/omg:launch`
- `/omg:checkpoint`
- `/omg:stop`

### 運用補助

- `/omg:status`
- `/omg:optimize`
- `/omg:cache`

## スキル

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

## サブエージェント

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

## ドキュメント

- [英語 README](../README.md)
- [インストールガイド](./guide/installation.md)
- [Context Engineering Guide (EN)](./guide/context-engineering.md)
- [変更履歴](./history.md)

## ライセンス

MIT

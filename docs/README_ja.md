# oh-my-gemini-cli (OmG)

[ランディングページ](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [変更履歴](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [Français](./README_fr.md) | [中文](./README_zh.md) | [Español](./README_es.md)

Gemini CLI 向けの、コンテキストエンジニアリング駆動マルチエージェント・ワークフローパックです。

> "Claude Code の本当の競争力は Opus や Sonnet ではなく、Claude Code そのものだ。Gemini でも同じハーネスを付けると十分にうまく動く。"
>
> - シン・ジョンギュ（Lablup Inc. CEO）、YouTube インタビューより

このプロジェクトは次の着想から始まりました。
"このハーネスモデルを Gemini CLI に持ってきたらどうなるか？"

OmG は Gemini CLI を単発セッションのツールから、構造化された役割分担型エンジニアリング・ワークフローへ拡張します。

OmG は公式拡張モデルに基づくネイティブ Gemini CLI Extension として実装されています。

- `gemini-extension.json` マニフェスト
- `agents/` サブエージェント
- `commands/` スラッシュコマンド
- `skills/` 再利用可能なワークフロー
- `context/` 共有コンテキスト

## インストール

公式拡張コマンドで GitHub URL からインストールします。

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

対話モードで確認:

```text
/extensions list
```

非対話モードで確認:

```bash
gemini extensions list
```

注意: インストール/更新コマンドは対話スラッシュモードではなく、ターミナルモード（`gemini extensions ...`）で実行します。

## OmG を使う理由

- 複雑な作業では、広いコンテキストだけでなく再現可能な構造が必要です。
- 役割ベースの分担により、計画・実装・レビュー・デバッグの品質が上がります。
- キャッシュ安定性を意識したコンテキスト運用で、長期セッションのコストと揺らぎを抑えられます。

## 使い方

### コマンド

`commands/omg/*.toml` で提供されます。

- `/omg:status`
- `/omg:team`
- `/omg:optimize`
- `/omg:cache`

### スキル

- `$plan`
- `$execute`
- `$team`
- `$research`
- `$context-optimize`

### サブエージェント

- `omg-architect`
- `omg-planner`
- `omg-executor`
- `omg-reviewer`
- `omg-debugger`
- `omg-researcher`
- `omg-quick`

この拡張では `gemini-extension.json` で `experimental.enableAgents` をデフォルト有効化しています。

## プロジェクト構成

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

## 移行メモ

このリポジトリは、`omg setup` を主要な初期設定フローとしては使いません。

- 旧フロー: グローバルパッケージのインストール + setup によるコピー
- 新フロー: `gemini extensions install ...` による直接導入

`src/` 配下のレガシー実行コードはリポジトリに残っていますが、拡張としての動作はマニフェスト読み込みベースに移行しています。

## ドキュメント

- [英語 README](../README.md)
- [インストールガイド](./guide/installation.md)
- [変更履歴](./history.md)

## ライセンス

MIT

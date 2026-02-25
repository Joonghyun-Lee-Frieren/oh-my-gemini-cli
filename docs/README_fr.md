# oh-my-gemini-cli (OmG)

[Page d'accueil](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [Historique](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [日本語](./README_ja.md) | [中文](./README_zh.md) | [Español](./README_es.md)

Extension de workflow multi-agents pour Gemini CLI, orientée ingénierie de contexte.

> "L'avantage compétitif principal de Claude Code n'est ni Opus ni Sonnet. C'est Claude Code lui-même. De façon surprenante, Gemini fonctionne aussi très bien avec ce harnais."
>
> - Jeongkyu Shin (CEO de Lablup Inc.), interview YouTube

OmG transforme Gemini CLI, d'un assistant en session unique, en workflow d'ingénierie structuré par rôles.

## Nouveautés v0.3.0

- Pipeline d'équipe par étapes : `team-plan -> team-prd -> team-exec -> team-verify -> team-fix`
- Modes d'exécution : `balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`
- Commandes de cycle de vie : `/omg:launch`, `/omg:checkpoint`, `/omg:stop`, `/omg:mode`
- Nouveaux agents spécialisés : `omg-product`, `omg-verifier`, `omg-consensus`
- Nouvelles skills : `$prd`, `$ralplan`, `$autopilot`, `$ralph`, `$ultrawork`, `$consensus`, `$mode`, `$cancel`

## Installation

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

```text
/extensions list
```

```bash
gemini extensions list
```

Note : les commandes d'installation/mise à jour s'exécutent en mode terminal (`gemini extensions ...`).

## Commandes principales

### Pipeline

- `/omg:team`
- `/omg:team-plan`
- `/omg:team-prd`
- `/omg:team-exec`
- `/omg:team-verify`
- `/omg:team-fix`

### Mode / cycle de vie

- `/omg:mode`
- `/omg:autopilot`
- `/omg:ralph`
- `/omg:ultrawork`
- `/omg:consensus`
- `/omg:launch`
- `/omg:checkpoint`
- `/omg:stop`

### Exploitation

- `/omg:status`
- `/omg:optimize`
- `/omg:cache`

## Skills

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

## Sous-agents

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

## Documentation

- [README anglais](../README.md)
- [Guide d'installation](./guide/installation.md)
- [Context Engineering Guide (EN)](./guide/context-engineering.md)
- [Historique](./history.md)

## Licence

MIT

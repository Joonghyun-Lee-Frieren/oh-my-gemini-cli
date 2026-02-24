# oh-my-gemini-cli (OmG)

[Page d'accueil](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [Historique](./history.md)

[English](../README.md) | [한국어](./README_ko.md) | [日本語](./README_ja.md) | [中文](./README_zh.md) | [Español](./README_es.md)

Pack de workflows multi-agents, orienté ingénierie de contexte, pour Gemini CLI.

> "L'avantage compétitif principal de Claude Code n'est ni Opus ni Sonnet. C'est Claude Code lui-même. De façon surprenante, Gemini fonctionne aussi très bien avec ce harnais."
>
> - Jeongkyu Shin (CEO de Lablup Inc.), interview YouTube

Ce projet est né de cette idée :
"Et si on apportait ce modèle de harnais à Gemini CLI ?"

OmG transforme Gemini CLI, d'un assistant en session unique, en workflow d'ingénierie structuré par rôles.

OmG est implémenté comme extension native Gemini CLI basée sur le modèle officiel.

- manifeste `gemini-extension.json`
- `agents/` pour les sous-agents
- `commands/` pour les slash commands
- `skills/` pour les workflows réutilisables
- `context/` pour le contexte partagé

## Installation

Installez depuis l'URL GitHub avec la commande officielle des extensions :

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

Vérification en mode interactif :

```text
/extensions list
```

Vérification en mode non interactif :

```bash
gemini extensions list
```

Note : les commandes d'installation/mise à jour s'exécutent en mode terminal (`gemini extensions ...`), pas en mode slash interactif.

## Pourquoi OmG

- Les tâches complexes exigent une structure reproductible, pas seulement une grande fenêtre de contexte.
- La délégation par rôle améliore la qualité sur la planification, l'implémentation, la revue et le débogage.
- Une discipline de contexte compatible cache rend les longues sessions plus stables et moins coûteuses.

## Utilisation

### Commandes

Elles sont namespacées dans `commands/omg/*.toml` :

- `/omg:status`
- `/omg:team`
- `/omg:optimize`
- `/omg:cache`

### Skills

- `$plan`
- `$execute`
- `$team`
- `$research`
- `$context-optimize`

### Sous-agents

- `omg-architect`
- `omg-planner`
- `omg-executor`
- `omg-reviewer`
- `omg-debugger`
- `omg-researcher`
- `omg-quick`

`gemini-extension.json` active `experimental.enableAgents` par défaut pour cette extension.

## Structure du projet

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

## Notes de migration

Ce dépôt n'utilise plus `omg setup` comme parcours principal d'onboarding.

- Ancien flux : installation globale du package + copie via setup
- Nouveau flux : installation directe via `gemini extensions install ...`

Le code runtime legacy dans `src/` reste présent, mais le comportement d'extension repose maintenant sur le chargement par manifeste.

## Documentation

- [README anglais](../README.md)
- [Guide d'installation](./guide/installation.md)
- [Historique](./history.md)

## Licence

MIT

# oh-my-gemini-cli (OmG)

[Page d'accueil](https://joonghyun-lee-frieren.github.io/oh-my-gemini-cli/) | [Historique](./history.md)

[English](../README.md) | [???](./README_ko.md) | [???](./README_ja.md) | [??](./README_zh.md) | [Espa?ol](./README_es.md)

Extension de workflow multi-agents pour Gemini CLI, orient?e ing?nierie de contexte.

> "L'avantage comp?titif principal de Claude Code n'est ni Opus ni Sonnet. C'est Claude Code lui-m?me. De fa?on surprenante, Gemini fonctionne aussi tr?s bien avec ce harnais."
>
> - Jeongkyu Shin (CEO de Lablup Inc.), interview YouTube

Ce projet est n? de cette id?e :
"Et si on apportait ce mod?le de harnais ? Gemini CLI ?"

OmG transforme Gemini CLI, d'un assistant en session unique, en workflow d'ing?nierie structur? par r?les.

## Nouveaut?s v0.3.0

- Pipeline d'?quipe par ?tapes : `team-plan -> team-prd -> team-exec -> team-verify -> team-fix`
- Modes d'ex?cution : `balanced`, `speed`, `deep`, `autopilot`, `ralph`, `ultrawork`
- Commandes de cycle de vie : `/omg:launch`, `/omg:checkpoint`, `/omg:stop`, `/omg:mode`
- Nouveaux agents sp?cialis?s : `omg-product`, `omg-verifier`, `omg-consensus`
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

Note : les commandes d'installation/mise ? jour s'ex?cutent en mode terminal (`gemini extensions ...`), pas en mode slash interactif.

## Pipeline par ?tapes

1. `team-plan` : d?coupage des t?ches et d?pendances
2. `team-prd` : verrouillage du p?rim?tre et des crit?res d'acceptation
3. `team-exec` : impl?mentation du p?rim?tre valid?
4. `team-verify` : validation des crit?res et des r?gressions
5. `team-fix` : correction cibl?e des points en ?chec

## Modes d'op?ration

- `balanced` : mode ?quilibr? par d?faut
- `speed` : priorit? ? la vitesse d'ex?cution
- `deep` : priorit? ? la profondeur d'analyse et de validation
- `autopilot` : boucle autonome d'ex?cution
- `ralph` : orchestration stricte avec portes de qualit?
- `ultrawork` : mode haut d?bit pour lots parall?lisables

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
- [Historique](./history.md)

## Licence

MIT

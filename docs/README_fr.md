# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>Harnais multi-agent pour Gemini CLI propulsé par l'ingénierie de contexte</strong>
</p>

<h3 align="center">
  <em>Gemini pense. OmG orchestre.</em>
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
  <a href="../README.md">English</a> | <a href="./README_ko.md">한국어</a> | <a href="./README_ja.md">日本語</a> | <a href="./README_zh.md">中文</a> | <a href="./README_es.md">Español</a> | <a href="./README_pt.md">Português</a> | <strong>Français</strong> | <a href="./README_nl.md">Nederlands</a> | <a href="./README_pl.md">Polski</a> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <a href="./README_de.md">Deutsch</a> | <a href="./history.md">Changelog</a>
</p>



> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*Ce projet est né de cette réflexion : "Et si on apportait ce harnais à Gemini CLI ?"*



> Étend **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** d'un outil à session unique vers un
> **système d'orchestration multi-agent propulsé par l'ingénierie de contexte**.




## Table des matières

- [Pourquoi oh-my-gemini-cli ?](#pourquoi-oh-my-gemini-cli)
- [Démarrage rapide](#démarrage-rapide)
- [Concept central : Ingénierie de contexte](#concept-central-ingénierie-de-contexte)
- [Système multi-agent](#système-multi-agent)
- [Tableau de bord ASCII](#tableau-de-bord-ascii)
- [Orchestration des modèles](#orchestration-des-modèles)
- [Catalogue des agents](#catalogue-des-agents)
- [Catalogue des compétences](#catalogue-des-compétences)
- [Commandes personnalisées](#commandes-personnalisées)
- [Bot Telegram / Discord](#bot-telegram--discord)
- [Configuration](#configuration)
- [Commandes CLI](#commandes-cli)
- [Structure du projet](#structure-du-projet)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## Pourquoi oh-my-gemini-cli ?

Gemini CLI est puissant : fenêtre de contexte de 1M tokens, grounding Google Search et support MCP.  
Mais le travail à grande échelle nécessite encore une structure.

OmG ajoute :

- **Orchestration multi-agent** : Créer plusieurs agents en parallèle et les coordonner par type de tâche
- **Ingénierie de contexte** : Optimisation du prompt cache pour réduire la latence et le coût
- **Tableau de bord ASCII en temps réel** : Surveiller tous les agents dans une riche interface terminal
- **Stratégie duale de modèles** : Gemini Pro (planification) + Gemini Flash (exécution)
- **Support LLM externes** : Connecter Claude, GPT et autres modèles via OAuth/API
- **Contrôle à distance** : Surveiller et contrôler les sessions via les bots Telegram/Discord

OmG est un complément, pas un fork. Il n'utilise que les points d'extension natifs de Gemini CLI : MCP, commandes personnalisées et `GEMINI.md`.

---

## Démarrage rapide

### Prérequis

- macOS, Linux ou Windows (WSL2 recommandé)
- Node.js >= 20
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installé
- Authentification Gemini configurée (connexion Google, clé API ou Vertex AI)

### Installation

```bash
# Recommandé : fonctionne même lorsque le paquet du registre npm n'est pas disponible
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# Optionnel : si le paquet du registre npm est disponible dans votre environnement
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> Note : si `npm install -g oh-my-gemini-cli` échoue avec `404 Not Found`, utilisez la commande d'installation GitHub ci-dessus.

### Liste de vérification pour publication npm

- Confirmer que la page du paquet npm et la tag dist `latest` sont disponibles
- Vérifier que `npm install -g oh-my-gemini-cli` fonctionne dans un environnement propre
- Changer la commande d'installation par défaut dans la documentation de npm registry vers GitHub
- Garder l'installation GitHub comme solution de secours dans la section dépannage

### Auto-installation pour LLM

Collez ceci dans n'importe quel agent de codification IA (Cursor, Claude Code, Gemini CLI, etc.) :

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### Première session

```bash
# Lancement de base (Gemini CLI + tableau de bord)
omg

# Mode équipe multi-agent
omg team "Implement OAuth authentication"

# Travailler avec un agent spécifique
omg --agent architect "Analyze this codebase architecture"
```

---

## Concept central : Ingénierie de contexte

> **"Cache Rules Everything Around Me"**
> — À l'ère des agents, le cache domine toujours.

La philosophie centrale d'oh-my-gemini-cli est l'**ingénierie de contexte**.  
Inspiré des [leçons de prompt caching de Claude Code](https://x.com/trq212/status/2024574133011673516), adapté à Gemini CLI.

### Qu'est-ce que le prompt caching ?

Dans les flux de travail d'agents de longue durée, le **prompt caching** réutilise les calculs précédents pour réduire drastiquement la latence et le coût.  
Le cache est basé sur la **correspondance de préfixe**.

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

### Cinq principes fondamentaux

#### 1. Stabilité du préfixe

Toute modification du préfixe invalide le cache subséquent.  
OmG place le contenu statique en premier et le contenu dynamique en dernier pour maximiser les hits de cache.

#### 2. Invariance de l'ensemble d'outils

Ajouter ou supprimer des outils casse le cache. OmG évite cela en :
- Utilisant des outils de transition d'état pour le mode plan au lieu de modifier les listes d'outils
- Utilisant des stubs MCP à chargement différé au lieu de muter les ensembles d'outils complets en cours de session

#### 3. Sous-agents au lieu de changement de modèle

Le cache de prompt est spécifique au modèle.  
Au lieu de changer le modèle dans un thread, OmG utilise des sous-agents avec des caches de modèle dédiés.

#### 4. Compaction sûre pour le cache

Lorsque le contexte doit être compacté, OmG préserve le préfixe de cache parent via un fork sûr pour le cache.

#### 5. Rappels système pour les mises à jour

Au lieu de modifier directement le contenu du prompt système, OmG ajoute des signaux de mise à jour dans le flux de messages.

### Surveillance du cache

OmG traite le taux de hits de cache comme le temps de disponibilité.

```bash
omg status --cache
```

---

## Système multi-agent

OmG crée plusieurs agents en parallèle selon le type de tâche, puis coordonne l'exécution.

### Architecture

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

### Types d'agents

| Agent | Model | Role |
|------|------|------|
| **Architect** | Gemini Pro | Analyse d'architecture, décisions de conception, cartographie des dépendances |
| **Planner** | Gemini Pro | Décomposition des tâches, planification d'exécution, priorisation |
| **Executor** | Gemini Flash | Génération de code, édition de fichiers, refactorisation (parallèle N) |
| **Reviewer** | Gemini Pro | Revue de code, contrôles qualité, contrôles sécurité |
| **Debugger** | Gemini Pro | Analyse d'erreurs, débogage, correction des tests échoués |
| **Researcher** | Gemini Pro | Recherche web, analyse de documentation, comparaison de bibliothèques |
| **Quick** | Gemini Flash | Petites tâches : corrections de fautes, formatage, modifications mineures |

### Cycle de vie

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### Exemple de pipeline

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## Tableau de bord ASCII

Tableau de bord terminal en temps réel construit avec Ink (React pour CLI).

### Aperçu du tableau de bord

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

### Raccourcis

| Key | Action |
|----|------|
| `q` / `Ctrl+C` | Quitter |
| `p` | Pause tous les agents |
| `r` | Reprendre |
| `d` | Afficher le flux de détail de l'agent sélectionné |
| `t` | Basculer la synchronisation Telegram/Discord |
| `Tab` | Déplacer le focus entre les agents |
| `Enter` | Ouvrir le panneau de détail de l'agent focalisé |
| `1`-`9` | Focaliser l'agent par numéro |

---

## Orchestration des modèles

### Stratégie duale de modèles

OmG utilise par défaut **Pro pour la planification, Flash pour l'exécution**.

### Intégration LLM externes

```bash
# Claude via OAuth
omg config set external.claude.oauth true
omg auth claude

# OpenAI via clé API
omg config set external.openai.api_key "sk-..."
```

---

## Catalogue des agents

Utiliser dans Gemini CLI avec `/prompts:name`.

| Agent | Command | Description |
|------|------|------|
| Architect | `/prompts:architect` | Analyse d'architecture, décisions de conception, graphe de dépendances |
| Planner | `/prompts:planner` | Décomposition des tâches, plan d'exécution, jalons |
| Executor | `/prompts:executor` | Génération et édition de code, refactorisation |
| Reviewer | `/prompts:reviewer` | Revue : sécurité/performance/qualité |
| Debugger | `/prompts:debugger` | Analyse d'erreurs, interprétation de stack trace, corrections |
| Researcher | `/prompts:researcher` | Recherche web, analyse de documentation, comparaison de bibliothèques |
| Quick | `/prompts:quick` | Corrections de fautes, formatage, modifications mineures |

---

## Catalogue des compétences

Utiliser dans Gemini CLI avec `$skill-name`.

| Skill | Trigger | Description |
|------|------|------|
| plan | `$plan` | Planification stratégique basée sur Pro |
| execute | `$execute` | Implémentation rapide basée sur Flash |
| team | `$team` | Orchestration d'équipe multi-agent |
| research | `$research` | Recherche parallèle et analyse de documentation |
| context-optimize | `$context-optimize` | Optimisation de la fenêtre de contexte |

---

## Commandes personnalisées

Prend en charge les commandes personnalisées TOML.

**Emplacements**
- Global : `~/.gemini/commands/*.toml`
- Projet : `.gemini/commands/*.toml`

---

## Bot Telegram / Discord

Surveiller et contrôler les sessions OmG à distance.

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## Configuration

### Emplacements des fichiers

- Global : `~/.gemini/omg-settings.json`
- Projet : `.gemini/omg-settings.json` (a priorité)

### Exemple

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

## Commandes CLI

```bash
omg                         # Lancer Gemini CLI + tableau de bord
omg setup                   # Installer prompts/skills/commands/MCP/GEMINI.md
omg doctor                  # Exécuter les diagnostics
omg update                  # Mettre à jour vers la dernière version
omg team <description>      # Mode équipe multi-agent
omg team status             # Statut de l'équipe
omg team shutdown           # Arrêter l'équipe
omg status                  # Statut agent/cache
omg status --cache          # Détails des hits de cache
omg status --agents --json  # Statut des agents en JSON
omg status --tasks --json   # Pipeline des tâches en JSON
omg status --context --json # Utilisation du contexte en JSON
omg config set <key> <val>  # Définir la configuration
omg config get <key>        # Obtenir la configuration
omg bot telegram start      # Démarrer le bot Telegram
omg bot discord start       # Démarrer le bot Discord
omg help                    # Afficher l'aide
```

### Drapeaux d'exécution

```bash
--agent <type>     # agent spécifique (architect, executor, ...)
--workers <N>      # travailleurs de l'équipe (par défaut : 4)
--model <model>    # override du modèle
--no-dashboard     # désactiver le tableau de bord
--verbose          # logs verbeux
--dry-run          # planifier uniquement, pas d'exécution
```

### Champs JSON de statut

`omg status --json` retourne :

- `agents` : actifs/total et liste des agents
- `tasks` : compteurs done/running/queued/failed et liste des tâches
- `cache` : `hit_rate`, `hits`, `misses` et taux cible
- `cache_history` : snapshots récents du cache
- `context` : `used`, `limit`, `percentage` et seuil de compaction

---

## Structure du projet

```
oh-my-gemini-cli/
├── bin/omg.js                        # Point d'entrée CLI
├── src/
│   ├── cli/                          # Commandes CLI
│   ├── agents/                       # Système multi-agent
│   ├── dashboard/                    # Tableau de bord TUI ASCII
│   ├── context/                      # Moteur d'ingénierie de contexte
│   ├── orchestrator/                 # Orchestration des modèles
│   ├── mcp/                          # Serveurs MCP
│   ├── bot/                          # Bots Telegram/Discord
│   └── shared/                       # Utilitaires partagés
├── prompts/                          # Prompts des agents
├── skills/                           # Compétences de flux de travail
├── commands/                         # Commandes personnalisées (TOML)
├── templates/                        # Modèles GEMINI.md
├── docs/
│   ├── README_ko.md                  # Documentation coréenne
│   ├── history.md                    # Changelog (EN)
│   ├── history_ko.md                 # Changelog (KO)
│   └── guide/
│       ├── installation.md           # Guide d'installation
│       └── context-engineering.md    # Guide d'ingénierie de contexte
├── package.json
├── tsconfig.json
├── README.md                         # Documentation anglaise (ce fichier)
└── LICENSE
```

---

## Ce que fait `omg setup`

| Step | Description |
|------|------|
| 1 | Créer le répertoire d'exécution `.omg/` (état, plans, logs) |
| 2 | Installer les prompts dans `~/.gemini/prompts/` ou `.gemini/prompts/` |
| 3 | Installer les compétences de flux de travail |
| 4 | Installer les commandes personnalisées dans `~/.gemini/commands/` |
| 5 | Enregistrer les serveurs MCP dans `settings.json` (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | Générer le `GEMINI.md` du projet |
| 7 | Générer l'`omg-settings.json` par défaut |

---

## Stack technique

- **Runtime** : Node.js >= 20
- **Langage** : TypeScript
- **TUI** : Ink 5 (React pour CLI)
- **MCP** : `@modelcontextprotocol/sdk`
- **Telegram** : `telegraf`
- **Discord** : `discord.js`
- **Build** : esbuild
- **Test** : Vitest

---

## Inspiration

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Agent terminal IA open source de Google
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Orchestration multi-agent centrée équipe pour Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Harnais Codex CLI
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - Harnais OpenCode
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - Principes d'ingénierie de contexte

---

## Contribuer

Les contributions sont les bienvenues.

- Rapports de bugs et propositions de fonctionnalités
- Nouveaux prompts d'agents
- Nouvelles compétences et commandes personnalisées
- Améliorations de la documentation
- Améliorations des bots Telegram/Discord

## Licence

[MIT](../LICENSE)

## Contact

📧 kissdesty@gmail.com

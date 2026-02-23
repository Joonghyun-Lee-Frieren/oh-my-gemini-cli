# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>Context engineering powered multi-agent harness for Gemini CLI</strong>
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
  <a href="../README.md">English</a> | <a href="./README_ko.md">한국어</a> | <a href="./README_ja.md">日本語</a> | <a href="./README_zh.md">中文</a> | <a href="./README_es.md">Español</a> | <a href="./README_pt.md">Português</a> | <a href="./README_fr.md">Français</a> | <strong>Nederlands</strong> | <a href="./README_pl.md">Polski</a> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <a href="./README_de.md">Deutsch</a> | <a href="./history.md">Changelog</a>
</p>





> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*This project started from this insight: "What if we bring that harness to Gemini CLI?"*





> Extends **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** from a single-session tool into a
> **context engineering powered multi-agent orchestration system**.





## Inhoudsopgave

- [Waarom oh-my-gemini-cli?](#waarom-oh-my-gemini-cli)
- [Snel starten](#snel-starten)
- [Kernconcept: Context Engineering](#kernconcept-context-engineering)
- [Multi-Agent Systeem](#multi-agent-systeem)
- [ASCII Dashboard](#ascii-dashboard)
- [Model Orchestratie](#model-orchestratie)
- [Agent Catalogus](#agent-catalogus)
- [Skill Catalogus](#skill-catalogus)
- [Aangepaste Commando's](#aangepaste-commandos)
- [Telegram / Discord Bot](#telegram--discord-bot)
- [Configuratie](#configuratie)
- [CLI Commando's](#cli-commandos)
- [Projectstructuur](#projectstructuur)
- [Bijdragen](#bijdragen)
- [Licentie](#licentie)

---

## Waarom oh-my-gemini-cli?

Gemini CLI is krachtig: 1M token contextvenster, Google Search grounding en MCP-ondersteuning.  
Maar grootschalig werk heeft nog steeds structuur nodig.

OmG voegt toe:

- **Multi-Agent Orchestratie**: Spawn meerdere agents parallel en coördineer op taaktype
- **Context Engineering**: Prompt cache-optimalisatie om latentie en kosten te verminderen
- **Real-time ASCII Dashboard**: Monitor alle agents in een rijke terminal UI
- **Dubbele Modelstrategie**: Gemini Pro (planning) + Gemini Flash (uitvoering)
- **Externe LLM-ondersteuning**: Verbind Claude, GPT en andere modellen via OAuth/API
- **Externe bediening**: Monitor en beheer sessies via Telegram/Discord-bots

OmG is een add-on, geen fork. Het gebruikt alleen Gemini CLI native uitbreidingspunten: MCP, aangepaste commando's en `GEMINI.md`.

---

## Snel starten

### Vereisten

- macOS, Linux of Windows (WSL2 aanbevolen)
- Node.js >= 20
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) geïnstalleerd
- Gemini-authenticatie geconfigureerd (Google-login, API-sleutel of Vertex AI)

### Installatie

```bash
# Aanbevolen: werkt ook wanneer npm-registerpakket niet beschikbaar is
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# Optioneel: als npm-registerpakket beschikbaar is in uw omgeving
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> Let op: als `npm install -g oh-my-gemini-cli` faalt met `404 Not Found`, gebruik dan het bovenstaande GitHub-installatiecommando.

### npm Publish Switch Checklist

- Bevestig dat npm-pagina en `latest` dist-tag beschikbaar zijn
- Controleer of `npm install -g oh-my-gemini-cli` werkt in een schone omgeving
- Wijzig standaard installatiecommando in docs van GitHub naar npm-register
- Houd GitHub-installatie als fallback in troubleshooting-sectie

### LLM Auto-Install

Plak dit in elke AI-coderingsagent (Cursor, Claude Code, Gemini CLI, enz.):

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### Eerste sessie

```bash
# Basisstart (Gemini CLI + dashboard)
omg

# Multi-agent teammodus
omg team "Implement OAuth authentication"

# Werk met een specifieke agent
omg --agent architect "Analyze this codebase architecture"
```

---

## Kernconcept: Context Engineering

> **"Cache Rules Everything Around Me"**
> — In het agenttijdperk domineert cache nog steeds.

De kernfilosofie van oh-my-gemini-cli is **context engineering**.  
Geïnspireerd door [Claude Code prompt caching-lessen](https://x.com/trq212/status/2024574133011673516), aangepast aan Gemini CLI.

### Wat is prompt caching?

In langlopende agent-workflows hergebruikt **prompt caching** eerdere berekeningen om latentie en kosten drastisch te verminderen.  
Caching is gebaseerd op **prefix matching**.

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

### Vijf kernprincipes

#### 1. Prefix Stabiliteit

Elke wijziging in het prefix invalideert de daaropvolgende cache.  
OmG plaatst statische inhoud eerst en dynamische inhoud laatst om cache hits te maximaliseren.

#### 2. Tool Set Invariantie

Toevoegen/verwijderen van tools breekt de cache. OmG vermijdt dit door:
- State-transition tools te gebruiken voor planmodus in plaats van toollijsten te wijzigen
- Lazy-loading MCP-stubs te gebruiken in plaats van volledige toolsets midden in een sessie te muteren

#### 3. Sub-Agents in plaats van Model Switching

Prompt cache is modelspecifiek.  
In plaats van het model in één thread te wisselen, gebruikt OmG sub-agents met toegewijde modelcaches.

#### 4. Cache-Safe Compaction

Wanneer context gecomprimeerd moet worden, behoudt OmG het bovenliggende cache-prefix via cache-safe forking.

#### 5. System Reminders voor Updates

In plaats van systeemprompt-inhoud direct te wijzigen, voegt OmG update-signalen toe in de berichtenstroom.

### Cache Monitoring

OmG behandelt cache hit rate als uptime.

```bash
omg status --cache
```

---

## Multi-Agent Systeem

OmG creëert meerdere agents parallel op basis van taaktype en coördineert vervolgens de uitvoering.

### Architectuur

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

### Agenttypen

| Agent | Model | Rol |
|------|------|------|
| **Architect** | Gemini Pro | Architectuuranalyse, ontwerpbeslissingen, afhankelijkheidsmapping |
| **Planner** | Gemini Pro | Taakdecompositie, uitvoeringsplanning, prioritering |
| **Executor** | Gemini Flash | Codegeneratie, bestandsbewerking, refactoring (parallel N) |
| **Reviewer** | Gemini Pro | Codereview, kwaliteitscontroles, beveiligingscontroles |
| **Debugger** | Gemini Pro | Foutanalyse, debugging, reparatie van mislukte tests |
| **Researcher** | Gemini Pro | Webonderzoek, docs-analyse, bibliotheekvergelijking |
| **Quick** | Gemini Flash | Kleine taken: typfouten, opmaak, kleine wijzigingen |

### Levenscyclus

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### Pipeline-voorbeeld

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## ASCII Dashboard

Real-time terminaldashboard gebouwd met Ink (React voor CLI).

### Dashboardvoorbeeld

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

### Sneltoetsen

| Key | Actie |
|----|------|
| `q` / `Ctrl+C` | Afsluiten |
| `p` | Pauzeer alle agents |
| `r` | Hervat |
| `d` | Toon geselecteerde agent detailstream |
| `t` | Schakel Telegram/Discord-sync |
| `Tab` | Verplaats focus tussen agents |
| `Enter` | Open focus agent detailpaneel |
| `1`-`9` | Focus agent op nummer |

---

## Model Orchestratie

### Dubbele modelstrategie

OmG standaard: **Pro voor planning, Flash voor uitvoering**.

### Externe LLM-integratie

```bash
# Claude via OAuth
omg config set external.claude.oauth true
omg auth claude

# OpenAI via API-sleutel
omg config set external.openai.api_key "sk-..."
```

---

## Agent Catalogus

Gebruik binnen Gemini CLI met `/prompts:name`.

| Agent | Command | Beschrijving |
|------|------|------|
| Architect | `/prompts:architect` | Architectuuranalyse, ontwerpbeslissingen, afhankelijkheidsgraaf |
| Planner | `/prompts:planner` | Taakdecompositie, uitvoeringsplan, mijlpalen |
| Executor | `/prompts:executor` | Codegeneratie en -bewerking, refactoring |
| Reviewer | `/prompts:reviewer` | Review: beveiliging/prestaties/kwaliteit |
| Debugger | `/prompts:debugger` | Foutanalyse, stack trace-interpretatie, fixes |
| Researcher | `/prompts:researcher` | Zoeken op web, docs-analyse, bibliotheekvergelijking |
| Quick | `/prompts:quick` | Typfouten, opmaak, kleine wijzigingen |

---

## Skill Catalogus

Gebruik binnen Gemini CLI met `$skill-name`.

| Skill | Trigger | Beschrijving |
|------|------|------|
| plan | `$plan` | Pro-gebaseerde strategische planning |
| execute | `$execute` | Flash-gebaseerde snelle implementatie |
| team | `$team` | Multi-agent teamorchestratie |
| research | `$research` | Parallel onderzoek en documentatieanalyse |
| context-optimize | `$context-optimize` | Contextvensteroptimalisatie |

---

## Aangepaste Commando's

Ondersteunt TOML-aangepaste commando's.

**Locaties**
- Globaal: `~/.gemini/commands/*.toml`
- Project: `.gemini/commands/*.toml`

---

## Telegram / Discord Bot

Monitor en beheer OmG-sessies op afstand.

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## Configuratie

### Bestandslocaties

- Globaal: `~/.gemini/omg-settings.json`
- Project: `.gemini/omg-settings.json` (heeft voorrang)

### Voorbeeld

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

## CLI Commando's

```bash
omg                         # Start Gemini CLI + dashboard
omg setup                   # Installeer prompts/skills/commands/MCP/GEMINI.md
omg doctor                  # Voer diagnostiek uit
omg update                  # Update naar nieuwste versie
omg team <description>      # Multi-agent teammodus
omg team status             # Teamstatus
omg team shutdown           # Stop team
omg status                  # Agent/cache-status
omg status --cache          # Cache hit-details
omg status --agents --json  # Agentstatus in JSON
omg status --tasks --json   # Taakpipeline in JSON
omg status --context --json # Contextgebruik in JSON
omg config set <key> <val>  # Stel config in
omg config get <key>        # Haal config op
omg bot telegram start      # Start Telegram-bot
omg bot discord start       # Start Discord-bot
omg help                    # Toon help
```

### Runtime-vlaggen

```bash
--agent <type>     # specifieke agent (architect, executor, ...)
--workers <N>      # team workers (standaard: 4)
--model <model>    # model override
--no-dashboard     # schakel dashboard uit
--verbose          # uitgebreide logs
--dry-run          # alleen plannen, geen uitvoering
```

### Status JSON-velden

`omg status --json` retourneert:

- `agents`: actief/totaal en agentlijst
- `tasks`: done/running/queued/failed tellers en taaklijst
- `cache`: `hit_rate`, `hits`, `misses` en doelrate
- `cache_history`: recente cache-snapshots
- `context`: `used`, `limit`, `percentage` en compactiedrempel

---

## Projectstructuur

```
oh-my-gemini-cli/
├── bin/omg.js                        # CLI entry point
├── src/
│   ├── cli/                          # CLI commands
│   ├── agents/                       # Multi-agent system
│   ├── dashboard/                    # ASCII dashboard TUI
│   ├── context/                      # Context engineering engine
│   ├── orchestrator/                 # Model orchestration
│   ├── mcp/                          # MCP servers
│   ├── bot/                          # Telegram/Discord bots
│   └── shared/                       # Shared utilities
├── prompts/                          # Agent prompts
├── skills/                           # Workflow skills
├── commands/                         # Custom commands (TOML)
├── templates/                        # GEMINI.md templates
├── docs/
│   ├── README_ko.md                  # Korean docs
│   ├── history.md                    # Changelog (EN)
│   ├── history_ko.md                 # Changelog (KO)
│   └── guide/
│       ├── installation.md           # Installation guide
│       └── context-engineering.md    # Context engineering guide
├── package.json
├── tsconfig.json
├── README.md                         # English docs (this file)
└── LICENSE
```

---

## Wat `omg setup` doet

| Stap | Beschrijving |
|------|------|
| 1 | Maak `.omg/` runtime-directory (state, plans, logs) |
| 2 | Installeer prompts naar `~/.gemini/prompts/` of `.gemini/prompts/` |
| 3 | Installeer workflow skills |
| 4 | Installeer aangepaste commando's naar `~/.gemini/commands/` |
| 5 | Registreer MCP-servers in `settings.json` (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | Genereer project `GEMINI.md` |
| 7 | Genereer standaard `omg-settings.json` |

---

## Tech Stack

- **Runtime**: Node.js >= 20
- **Taal**: TypeScript
- **TUI**: Ink 5 (React voor CLI)
- **MCP**: `@modelcontextprotocol/sdk`
- **Telegram**: `telegraf`
- **Discord**: `discord.js`
- **Build**: esbuild
- **Test**: Vitest

---

## Inspiratie

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Google's open-source AI terminal agent
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Team-first multi-agent orchestration voor Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Codex CLI harness
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode harness
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - context engineering-principes

---

## Bijdragen

Bijdragen zijn welkom.

- Bugrapporten en functievoorstellen
- Nieuwe agent prompts
- Nieuwe skills en aangepaste commando's
- Documentatieverbeteringen
- Telegram/Discord-botverbeteringen

## Licentie

[MIT](../LICENSE)

## Contact

📧 kissdesty@gmail.com

# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>Multi-Agent-Harness für Gemini CLI mit Context Engineering</strong>
</p>

<h3 align="center">
  <em>Gemini denkt. OmG orchestriert.</em>
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
  <a href="../README.md">English</a> | <a href="./README_ko.md">한국어</a> | <a href="./README_ja.md">日本語</a> | <a href="./README_zh.md">中文</a> | <a href="./README_es.md">Español</a> | <a href="./README_pt.md">Português</a> | <a href="./README_fr.md">Français</a> | <a href="./README_nl.md">Nederlands</a> | <a href="./README_pl.md">Polski</a> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <strong>Deutsch</strong> | <a href="./history.md">Changelog</a>
</p>



> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*Dieses Projekt entstand aus dieser Überlegung: "Was wäre, wenn wir diesen Harness zu Gemini CLI bringen?"*



> Erweitert **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** von einem Single-Session-Tool zu einem
> **Multi-Agent-Orchestrierungssystem auf Basis von Context Engineering**.




## Inhaltsverzeichnis

- [Warum oh-my-gemini-cli?](#warum-oh-my-gemini-cli)
- [Schnellstart](#schnellstart)
- [Kernkonzept: Context Engineering](#kernkonzept-context-engineering)
- [Multi-Agent-System](#multi-agent-system)
- [ASCII-Dashboard](#ascii-dashboard)
- [Modell-Orchestrierung](#modell-orchestrierung)
- [Agenten-Katalog](#agenten-katalog)
- [Skill-Katalog](#skill-katalog)
- [Benutzerdefinierte Befehle](#benutzerdefinierte-befehle)
- [Telegram- / Discord-Bot](#telegram--discord-bot)
- [Konfiguration](#konfiguration)
- [CLI-Befehle](#cli-befehle)
- [Projektstruktur](#projektstruktur)
- [Mitwirken](#mitwirken)
- [Lizenz](#lizenz)

---

## Warum oh-my-gemini-cli?

Gemini CLI ist leistungsstark: 1M Token Kontextfenster, Google Search Grounding und MCP-Unterstützung.  
Aber groß angelegte Arbeit braucht noch Struktur.

OmG fügt hinzu:

- **Multi-Agent-Orchestrierung**: Mehrere Agenten parallel starten und nach Aufgabentyp koordinieren
- **Context Engineering**: Prompt-Cache-Optimierung zur Reduzierung von Latenz und Kosten
- **Echtzeit-ASCII-Dashboard**: Alle Agenten in einer reichhaltigen Terminal-UI überwachen
- **Duale Modellstrategie**: Gemini Pro (Planung) + Gemini Flash (Ausführung)
- **Externe LLM-Unterstützung**: Claude, GPT und andere Modelle über OAuth/API verbinden
- **Fernsteuerung**: Sitzungen über Telegram-/Discord-Bots überwachen und steuern

OmG ist ein Add-on, kein Fork. Es nutzt nur die nativen Erweiterungspunkte von Gemini CLI: MCP, benutzerdefinierte Befehle und `GEMINI.md`.

---

## Schnellstart

### Voraussetzungen

- macOS, Linux oder Windows (WSL2 empfohlen)
- Node.js >= 20
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installiert
- Gemini-Authentifizierung konfiguriert (Google-Login, API-Key oder Vertex AI)

### Installation

```bash
# Empfohlen: funktioniert auch wenn das npm-Registry-Paket nicht verfügbar ist
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# Optional: wenn das npm-Registry-Paket in Ihrer Umgebung verfügbar ist
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> Hinweis: Wenn `npm install -g oh-my-gemini-cli` mit `404 Not Found` fehlschlägt, verwenden Sie den obigen GitHub-Installationsbefehl.

### npm-Publish-Switch-Checkliste

- Bestätigen, dass die npm-Paketseite und der dist-tag `latest` verfügbar sind
- Prüfen, dass `npm install -g oh-my-gemini-cli` in einer sauberen Umgebung funktioniert
- Standard-Installationsbefehl in der Dokumentation von GitHub auf npm-Registry umstellen
- GitHub-Installation als Fallback in der Troubleshooting-Sektion beibehalten

### LLM-Auto-Installation

Fügen Sie dies in einen beliebigen KI-Coding-Agent ein (Cursor, Claude Code, Gemini CLI, etc.):

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### Erste Sitzung

```bash
# Basisstart (Gemini CLI + Dashboard)
omg

# Multi-Agent-Team-Modus
omg team "Implement OAuth authentication"

# Mit einem bestimmten Agenten arbeiten
omg --agent architect "Analyze this codebase architecture"
```

---

## Kernkonzept: Context Engineering

> **"Cache Rules Everything Around Me"**
> — In der Agenten-Ära dominiert der Cache noch immer.

Die zentrale Philosophie von oh-my-gemini-cli ist **Context Engineering**.  
Inspiriert von den [Claude Code Prompt-Caching-Lektionen](https://x.com/trq212/status/2024574133011673516), angepasst an Gemini CLI.

### Was ist Prompt Caching?

Bei lang laufenden Agenten-Workflows nutzt **Prompt Caching** vorherige Berechnungen wieder, um Latenz und Kosten drastisch zu reduzieren.  
Das Caching basiert auf **Präfix-Matching**.

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

### Fünf Kernprinzipien

#### 1. Präfix-Stabilität

Jede Änderung im Präfix invalidiert den nachfolgenden Cache.  
OmG platziert statischen Inhalt zuerst und dynamischen Inhalt zuletzt, um Cache-Treffer zu maximieren.

#### 2. Tool-Set-Invarianz

Hinzufügen oder Entfernen von Tools bricht den Cache. OmG vermeidet dies durch:
- Verwendung von Zustandsübergangs-Tools für den Plan-Modus statt Änderung der Tool-Listen
- Verwendung von Lazy-Loading-MCP-Stubs statt Mutation vollständiger Tool-Sets während der Sitzung

#### 3. Sub-Agenten statt Modellwechsel

Der Prompt-Cache ist modellspezifisch.  
Statt das Modell in einem Thread zu wechseln, verwendet OmG Sub-Agenten mit dedizierten Modell-Caches.

#### 4. Cache-sichere Kompaktierung

Wenn der Kontext kompaktiert werden muss, bewahrt OmG das übergeordnete Cache-Präfix durch cache-sicheres Forking.

#### 5. System-Reminder für Updates

Statt den System-Prompt-Inhalt direkt zu ändern, fügt OmG Update-Signale im Nachrichtenfluss hinzu.

### Cache-Überwachung

OmG behandelt die Cache-Trefferrate wie die Verfügbarkeit.

```bash
omg status --cache
```

---

## Multi-Agent-System

OmG erstellt mehrere Agenten parallel basierend auf dem Aufgabentyp und koordiniert die Ausführung.

### Architektur

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

### Agenten-Typen

| Agent | Model | Role |
|------|------|------|
| **Architect** | Gemini Pro | Architekturanalyse, Design-Entscheidungen, Abhängigkeits-Mapping |
| **Planner** | Gemini Pro | Aufgabenzerlegung, Ausführungsplanung, Priorisierung |
| **Executor** | Gemini Flash | Code-Generierung, Dateibearbeitung, Refactoring (parallel N) |
| **Reviewer** | Gemini Pro | Code-Review, Qualitätsprüfungen, Sicherheitsprüfungen |
| **Debugger** | Gemini Pro | Fehleranalyse, Debugging, Behebung fehlgeschlagener Tests |
| **Researcher** | Gemini Pro | Web-Recherche, Dokumentationsanalyse, Bibliotheksvergleich |
| **Quick** | Gemini Flash | Kleine Aufgaben: Tippfehlerkorrekturen, Formatierung, minimale Änderungen |

### Lebenszyklus

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### Pipeline-Beispiel

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## ASCII-Dashboard

Echtzeit-Terminal-Dashboard erstellt mit Ink (React für CLI).

### Dashboard-Vorschau

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

### Tastenkürzel

| Key | Action |
|----|------|
| `q` / `Ctrl+C` | Beenden |
| `p` | Alle Agenten pausieren |
| `r` | Fortsetzen |
| `d` | Detail-Stream des ausgewählten Agenten anzeigen |
| `t` | Telegram/Discord-Sync umschalten |
| `Tab` | Fokus zwischen Agenten verschieben |
| `Enter` | Detail-Panel des fokussierten Agenten öffnen |
| `1`-`9` | Agent nach Nummer fokussieren |

---

## Modell-Orchestrierung

### Duale Modellstrategie

OmG verwendet standardmäßig **Pro für Planung, Flash für Ausführung**.

### Externe LLM-Integration

```bash
# Claude über OAuth
omg config set external.claude.oauth true
omg auth claude

# OpenAI über API-Key
omg config set external.openai.api_key "sk-..."
```

---

## Agenten-Katalog

In Gemini CLI mit `/prompts:name` verwenden.

| Agent | Command | Description |
|------|------|------|
| Architect | `/prompts:architect` | Architekturanalyse, Design-Entscheidungen, Abhängigkeitsgraph |
| Planner | `/prompts:planner` | Aufgabenzerlegung, Ausführungsplan, Meilensteine |
| Executor | `/prompts:executor` | Code-Generierung und -Bearbeitung, Refactoring |
| Reviewer | `/prompts:reviewer` | Review: Sicherheit/Performance/Qualität |
| Debugger | `/prompts:debugger` | Fehleranalyse, Stack-Trace-Interpretation, Fixes |
| Researcher | `/prompts:researcher` | Web-Suche, Dokumentationsanalyse, Bibliotheksvergleich |
| Quick | `/prompts:quick` | Tippfehlerkorrekturen, Formatierung, minimale Änderungen |

---

## Skill-Katalog

In Gemini CLI mit `$skill-name` verwenden.

| Skill | Trigger | Description |
|------|------|------|
| plan | `$plan` | Pro-basierte strategische Planung |
| execute | `$execute` | Flash-basierte schnelle Implementierung |
| team | `$team` | Multi-Agent-Team-Orchestrierung |
| research | `$research` | Parallele Recherche und Dokumentationsanalyse |
| context-optimize | `$context-optimize` | Kontextfenster-Optimierung |

---

## Benutzerdefinierte Befehle

Unterstützt benutzerdefinierte TOML-Befehle.

**Speicherorte**
- Global: `~/.gemini/commands/*.toml`
- Projekt: `.gemini/commands/*.toml`

---

## Telegram- / Discord-Bot

OmG-Sitzungen remote überwachen und steuern.

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## Konfiguration

### Dateispeicherorte

- Global: `~/.gemini/omg-settings.json`
- Projekt: `.gemini/omg-settings.json` (hat Vorrang)

### Beispiel

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

## CLI-Befehle

```bash
omg                         # Gemini CLI + Dashboard starten
omg setup                   # prompts/skills/commands/MCP/GEMINI.md installieren
omg doctor                  # Diagnostik ausführen
omg update                  # Auf neueste Version aktualisieren
omg team <description>      # Multi-Agent-Team-Modus
omg team status             # Team-Status
omg team shutdown           # Team beenden
omg status                  # Agenten-/Cache-Status
omg status --cache          # Cache-Treffer-Details
omg status --agents --json  # Agenten-Status in JSON
omg status --tasks --json   # Task-Pipeline in JSON
omg status --context --json # Kontext-Nutzung in JSON
omg config set <key> <val>  # Konfiguration setzen
omg config get <key>        # Konfiguration abrufen
omg bot telegram start      # Telegram-Bot starten
omg bot discord start       # Discord-Bot starten
omg help                    # Hilfe anzeigen
```

### Laufzeit-Flags

```bash
--agent <type>     # bestimmter Agent (architect, executor, ...)
--workers <N>      # Team-Worker (Standard: 4)
--model <model>    # Modell-Override
--no-dashboard     # Dashboard deaktivieren
--verbose          # ausführliche Logs
--dry-run          # nur planen, keine Ausführung
```

### Status-JSON-Felder

`omg status --json` gibt zurück:

- `agents`: aktiv/gesamt und Agentenliste
- `tasks`: done/running/queued/failed-Zähler und Aufgabenliste
- `cache`: `hit_rate`, `hits`, `misses` und Zielrate
- `cache_history`: aktuelle Cache-Snapshots
- `context`: `used`, `limit`, `percentage` und Kompaktierungsschwelle

---

## Projektstruktur

```
oh-my-gemini-cli/
├── bin/omg.js                        # CLI-Einstiegspunkt
├── src/
│   ├── cli/                          # CLI-Befehle
│   ├── agents/                       # Multi-Agent-System
│   ├── dashboard/                    # ASCII-Dashboard TUI
│   ├── context/                      # Context-Engineering-Engine
│   ├── orchestrator/                 # Modell-Orchestrierung
│   ├── mcp/                          # MCP-Server
│   ├── bot/                          # Telegram-/Discord-Bots
│   └── shared/                       # Gemeinsame Utilities
├── prompts/                          # Agenten-Prompts
├── skills/                           # Workflow-Skills
├── commands/                         # Benutzerdefinierte Befehle (TOML)
├── templates/                        # GEMINI.md-Vorlagen
├── docs/
│   ├── README_ko.md                  # Koreanische Dokumentation
│   ├── history.md                    # Changelog (EN)
│   ├── history_ko.md                 # Changelog (KO)
│   └── guide/
│       ├── installation.md           # Installationsanleitung
│       └── context-engineering.md    # Context-Engineering-Anleitung
├── package.json
├── tsconfig.json
├── README.md                         # Englische Dokumentation (diese Datei)
└── LICENSE
```

---

## Was `omg setup` macht

| Step | Description |
|------|------|
| 1 | Laufzeitverzeichnis `.omg/` erstellen (Status, Pläne, Logs) |
| 2 | Prompts in `~/.gemini/prompts/` oder `.gemini/prompts/` installieren |
| 3 | Workflow-Skills installieren |
| 4 | Benutzerdefinierte Befehle in `~/.gemini/commands/` installieren |
| 5 | MCP-Server in `settings.json` registrieren (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | Projekt-`GEMINI.md` generieren |
| 7 | Standard-`omg-settings.json` generieren |

---

## Tech-Stack

- **Runtime**: Node.js >= 20
- **Sprache**: TypeScript
- **TUI**: Ink 5 (React für CLI)
- **MCP**: `@modelcontextprotocol/sdk`
- **Telegram**: `telegraf`
- **Discord**: `discord.js`
- **Build**: esbuild
- **Test**: Vitest

---

## Inspiration

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Googles Open-Source-KI-Terminal-Agent
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Team-first Multi-Agent-Orchestrierung für Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Codex-CLI-Harness
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenCode-Harness
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - Context-Engineering-Prinzipien

---

## Mitwirken

Beiträge sind willkommen.

- Bug-Reports und Feature-Vorschläge
- Neue Agenten-Prompts
- Neue Skills und benutzerdefinierte Befehle
- Dokumentationsverbesserungen
- Telegram-/Discord-Bot-Verbesserungen

## Lizenz

[MIT](../LICENSE)

## Kontakt

📧 kissdesty@gmail.com

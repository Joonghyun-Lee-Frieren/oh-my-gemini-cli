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
  <a href="../README.md">English</a> | <a href="./README_ko.md">한국어</a> | <a href="./README_ja.md">日本語</a> | <a href="./README_zh.md">中文</a> | <a href="./README_es.md">Español</a> | <a href="./README_pt.md">Português</a> | <a href="./README_fr.md">Français</a> | <a href="./README_nl.md">Nederlands</a> | <strong>Polski</strong> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <a href="./README_de.md">Deutsch</a> | <a href="./history.md">Changelog</a>
</p>





> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*This project started from this insight: "What if we bring that harness to Gemini CLI?"*





> Extends **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** from a single-session tool into a
> **context engineering powered multi-agent orchestration system**.





## Spis treści

- [Dlaczego oh-my-gemini-cli?](#dlaczego-oh-my-gemini-cli)
- [Szybki start](#szybki-start)
- [Koncepcja kluczowa: Context Engineering](#koncepcja-kluczowa-context-engineering)
- [System wieloagentowy](#system-wieloagentowy)
- [Dashboard ASCII](#dashboard-ascii)
- [Orkiestracja modeli](#orkiestracja-modeli)
- [Katalog agentów](#katalog-agentow)
- [Katalog umiejętności](#katalog-umiejetnosci)
- [Własne polecenia](#wlasne-polecenia)
- [Bot Telegram / Discord](#telegram--discord-bot)
- [Konfiguracja](#konfiguracja)
- [Polecenia CLI](#polecenia-cli)
- [Struktura projektu](#struktura-projektu)
- [Wkład w projekt](#wkład-w-projekt)
- [Licencja](#licencja)

---

## Dlaczego oh-my-gemini-cli?

Gemini CLI jest potężne: okno kontekstu 1M tokenów, Google Search grounding i obsługa MCP.  
Ale praca na dużą skalę nadal wymaga struktury.

OmG dodaje:

- **Orkiestracja wieloagentowa**: Uruchamia wiele agentów równolegle i koordynuje według typu zadania
- **Context Engineering**: Optymalizacja prompt cache w celu zmniejszenia opóźnień i kosztów
- **Dashboard ASCII w czasie rzeczywistym**: Monitoruj wszystkich agentów w bogatym interfejsie terminala
- **Strategia dwóch modeli**: Gemini Pro (planowanie) + Gemini Flash (wykonanie)
- **Obsługa zewnętrznych LLM**: Łącz Claude, GPT i inne modele przez OAuth/API
- **Zdalne sterowanie**: Monitoruj i kontroluj sesje przez boty Telegram/Discord

OmG jest dodatkiem, nie forkiem. Wykorzystuje tylko natywne punkty rozszerzeń Gemini CLI: MCP, własne polecenia i `GEMINI.md`.

---

## Szybki start

### Wymagania

- macOS, Linux lub Windows (zalecane WSL2)
- Node.js >= 20
- Zainstalowane [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- Skonfigurowana autentykacja Gemini (logowanie Google, klucz API lub Vertex AI)

### Instalacja

```bash
# Zalecane: działa nawet gdy pakiet npm registry jest niedostępny
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# Opcjonalnie: jeśli pakiet npm registry jest dostępny w Twoim środowisku
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> Uwaga: jeśli `npm install -g oh-my-gemini-cli` kończy się błędem `404 Not Found`, użyj powyższej komendy instalacji z GitHub.

### Lista kontrolna przełączania publikacji npm

- Potwierdź dostępność strony pakietu npm i dist-tag `latest`
- Sprawdź, czy `npm install -g oh-my-gemini-cli` działa w czystym środowisku
- Przełącz domyślną komendę instalacji w dokumentacji z GitHub na npm registry
- Zachowaj instalację z GitHub jako zapasową w sekcji rozwiązywania problemów

### Auto-instalacja LLM

Wklej to do dowolnego agenta kodowania AI (Cursor, Claude Code, Gemini CLI itp.):

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### Pierwsza sesja

```bash
# Podstawowe uruchomienie (Gemini CLI + dashboard)
omg

# Tryb zespołu wieloagentowego
omg team "Implement OAuth authentication"

# Praca z konkretnym agentem
omg --agent architect "Analyze this codebase architecture"
```

---

## Koncepcja kluczowa: Context Engineering

> **"Cache Rules Everything Around Me"**
> — W erze agentów cache nadal dominuje.

Główna filozofia oh-my-gemini-cli to **context engineering**.  
Zainspirowane [lekcjami prompt caching Claude Code](https://x.com/trq212/status/2024574133011673516), dostosowane do Gemini CLI.

### Czym jest prompt caching?

W długotrwałych przepływach pracy agentów **prompt caching** ponownie wykorzystuje wcześniejsze obliczenia, aby drastycznie zmniejszyć opóźnienia i koszty.  
Caching opiera się na **dopasowaniu prefiksu**.

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

### Pięć zasad kluczowych

#### 1. Stabilność prefiksu

Każda zmiana w prefiksie unieważnia kolejną cache.  
OmG umieszcza treść statyczną na początku, a dynamiczną na końcu, aby zmaksymalizować trafienia cache.

#### 2. Niezmienność zestawu narzędzi

Dodawanie/usuwanie narzędzi psuje cache. OmG unika tego przez:
- Używanie narzędzi przejścia stanu dla trybu planu zamiast zmiany list narzędzi
- Używanie leniwych stubów MCP zamiast mutowania pełnych zestawów narzędzi w trakcie sesji

#### 3. Sub-agenty zamiast przełączania modeli

Prompt cache jest specyficzny dla modelu.  
Zamiast przełączać model w jednym wątku, OmG używa sub-agentów z dedykowanymi cache modeli.

#### 4. Kompakcja bezpieczna dla cache

Gdy kontekst musi być skompresowany, OmG zachowuje prefiks cache rodzica przez bezpieczne rozgałęzianie cache.

#### 5. System Reminders dla aktualizacji

Zamiast bezpośrednio modyfikować treść promptu systemowego, OmG dołącza sygnały aktualizacji w przepływie wiadomości.

### Monitorowanie cache

OmG traktuje współczynnik trafień cache jak czas pracy.

```bash
omg status --cache
```

---

## System wieloagentowy

OmG tworzy wielu agentów równolegle na podstawie typu zadania, a następnie koordynuje wykonanie.

### Architektura

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

### Typy agentów

| Agent | Model | Rola |
|------|------|------|
| **Architect** | Gemini Pro | Analiza architektury, decyzje projektowe, mapowanie zależności |
| **Planner** | Gemini Pro | Dekompozycja zadań, planowanie wykonania, priorytetyzacja |
| **Executor** | Gemini Flash | Generowanie kodu, edycja plików, refaktoryzacja (równolegle N) |
| **Reviewer** | Gemini Pro | Przegląd kodu, kontrole jakości, kontrole bezpieczeństwa |
| **Debugger** | Gemini Pro | Analiza błędów, debugowanie, naprawa nieudanych testów |
| **Researcher** | Gemini Pro | Badania w sieci, analiza dokumentacji, porównanie bibliotek |
| **Quick** | Gemini Flash | Małe zadania: literówki, formatowanie, drobne zmiany |

### Cykl życia

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### Przykład pipeline

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## Dashboard ASCII

Dashboard terminala w czasie rzeczywistym zbudowany z Ink (React dla CLI).

### Podgląd dashboardu

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

### Skróty

| Klawisz | Akcja |
|----|------|
| `q` / `Ctrl+C` | Wyjście |
| `p` | Wstrzymaj wszystkich agentów |
| `r` | Wznów |
| `d` | Pokaż strumień szczegółów wybranego agenta |
| `t` | Przełącz synchronizację Telegram/Discord |
| `Tab` | Przesuń fokus między agentami |
| `Enter` | Otwórz panel szczegółów agenta w fokusie |
| `1`-`9` | Ustaw fokus na agencie według numeru |

---

## Orkiestracja modeli

### Strategia dwóch modeli

OmG domyślnie: **Pro do planowania, Flash do wykonania**.

### Integracja zewnętrznych LLM

```bash
# Claude przez OAuth
omg config set external.claude.oauth true
omg auth claude

# OpenAI przez klucz API
omg config set external.openai.api_key "sk-..."
```

---

## Katalog agentów

Użyj wewnątrz Gemini CLI z `/prompts:name`.

| Agent | Polecenie | Opis |
|------|------|------|
| Architect | `/prompts:architect` | Analiza architektury, decyzje projektowe, graf zależności |
| Planner | `/prompts:planner` | Dekompozycja zadań, plan wykonania, kamienie milowe |
| Executor | `/prompts:executor` | Generowanie i edycja kodu, refaktoryzacja |
| Reviewer | `/prompts:reviewer` | Przegląd: bezpieczeństwo/wydajność/jakość |
| Debugger | `/prompts:debugger` | Analiza błędów, interpretacja stack trace, poprawki |
| Researcher | `/prompts:researcher` | Wyszukiwanie w sieci, analiza dokumentacji, porównanie bibliotek |
| Quick | `/prompts:quick` | Literówki, formatowanie, drobne zmiany |

---

## Katalog umiejętności

Użyj wewnątrz Gemini CLI z `$skill-name`.

| Umiejętność | Wyzwalacz | Opis |
|------|------|------|
| plan | `$plan` | Planowanie strategiczne oparte na Pro |
| execute | `$execute` | Szybka implementacja oparta na Flash |
| team | `$team` | Orkiestracja zespołu wieloagentowego |
| research | `$research` | Równoległe badania i analiza dokumentacji |
| context-optimize | `$context-optimize` | Optymalizacja okna kontekstu |

---

## Własne polecenia

Obsługa własnych poleceń TOML.

**Lokalizacje**
- Globalna: `~/.gemini/commands/*.toml`
- Projekt: `.gemini/commands/*.toml`

---

## Bot Telegram / Discord

Monitoruj i kontroluj sesje OmG zdalnie.

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## Konfiguracja

### Lokalizacje plików

- Globalna: `~/.gemini/omg-settings.json`
- Projekt: `.gemini/omg-settings.json` (ma pierwszeństwo)

### Przykład

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

## Polecenia CLI

```bash
omg                         # Uruchom Gemini CLI + dashboard
omg setup                   # Zainstaluj prompts/skills/commands/MCP/GEMINI.md
omg doctor                  # Uruchom diagnostykę
omg update                  # Aktualizuj do najnowszej wersji
omg team <description>      # Tryb zespołu wieloagentowego
omg team status             # Status zespołu
omg team shutdown           # Zatrzymaj zespół
omg status                  # Status agenta/cache
omg status --cache          # Szczegóły trafień cache
omg status --agents --json  # Status agentów w JSON
omg status --tasks --json   # Pipeline zadań w JSON
omg status --context --json # Użycie kontekstu w JSON
omg config set <key> <val>  # Ustaw konfigurację
omg config get <key>        # Pobierz konfigurację
omg bot telegram start      # Uruchom bota Telegram
omg bot discord start       # Uruchom bota Discord
omg help                    # Pokaż pomoc
```

### Flagi runtime

```bash
--agent <type>     # konkretny agent (architect, executor, ...)
--workers <N>      # pracownicy zespołu (domyślnie: 4)
--model <model>    # nadpisanie modelu
--no-dashboard     # wyłącz dashboard
--verbose          # szczegółowe logi
--dry-run          # tylko planowanie, brak wykonania
```

### Pola JSON statusu

`omg status --json` zwraca:

- `agents`: aktywni/łącznie i lista agentów
- `tasks`: liczniki done/running/queued/failed i lista zadań
- `cache`: `hit_rate`, `hits`, `misses` i docelowa stopa
- `cache_history`: ostatnie migawki cache
- `context`: `used`, `limit`, `percentage` i próg kompakcji

---

## Struktura projektu

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
│       └── context-engineering.md   # Context engineering guide
├── package.json
├── tsconfig.json
├── README.md                         # English docs (this file)
└── LICENSE
```

---

## Co robi `omg setup`

| Krok | Opis |
|------|------|
| 1 | Utwórz katalog runtime `.omg/` (state, plans, logs) |
| 2 | Zainstaluj prompty do `~/.gemini/prompts/` lub `.gemini/prompts/` |
| 3 | Zainstaluj umiejętności workflow |
| 4 | Zainstaluj własne polecenia do `~/.gemini/commands/` |
| 5 | Zarejestruj serwery MCP w `settings.json` (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | Wygeneruj `GEMINI.md` projektu |
| 7 | Wygeneruj domyślny `omg-settings.json` |

---

## Tech Stack

- **Runtime**: Node.js >= 20
- **Język**: TypeScript
- **TUI**: Ink 5 (React dla CLI)
- **MCP**: `@modelcontextprotocol/sdk`
- **Telegram**: `telegraf`
- **Discord**: `discord.js`
- **Build**: esbuild
- **Test**: Vitest

---

## Inspiracja

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Open-source agent terminalowy AI Google
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Orkiestracja wieloagentowa zorientowana na zespół dla Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Harness Codex CLI
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - Harness OpenCode
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - zasady context engineering

---

## Wkład w projekt

Wkład jest mile widziany.

- Raporty o błędach i propozycje funkcji
- Nowe prompty agentów
- Nowe umiejętności i własne polecenia
- Ulepszenia dokumentacji
- Ulepszenia botów Telegram/Discord

## Licencja

[MIT](../LICENSE)

## Kontakt

📧 kissdesty@gmail.com

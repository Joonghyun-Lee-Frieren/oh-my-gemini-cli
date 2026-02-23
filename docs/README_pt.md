# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>Harness multiagente para Gemini CLI impulsionado por engenharia de contexto</strong>
</p>

<h3 align="center">
  <em>Gemini pensa. OmG orquestra.</em>
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
  <a href="../README.md">English</a> | <a href="./README_ko.md">한국어</a> | <a href="./README_ja.md">日本語</a> | <a href="./README_zh.md">中文</a> | <a href="./README_es.md">Español</a> | <strong>Português</strong> | <a href="./README_fr.md">Français</a> | <a href="./README_nl.md">Nederlands</a> | <a href="./README_pl.md">Polski</a> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <a href="./README_de.md">Deutsch</a> | <a href="./history.md">Changelog</a>
</p>



> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*Este projeto surgiu desta reflexão: "E se levarmos esse harness ao Gemini CLI?"*



> Estende **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** de uma ferramenta de sessão única para um
> **sistema de orquestração multiagente impulsionado por engenharia de contexto**.




## Índice

- [Por que oh-my-gemini-cli?](#por-que-oh-my-gemini-cli)
- [Início rápido](#início-rápido)
- [Conceito central: Engenharia de contexto](#conceito-central-engenharia-de-contexto)
- [Sistema multiagente](#sistema-multiagente)
- [Painel ASCII](#painel-ascii)
- [Orquestração de modelos](#orquestração-de-modelos)
- [Catálogo de agentes](#catálogo-de-agentes)
- [Catálogo de habilidades](#catálogo-de-habilidades)
- [Comandos personalizados](#comandos-personalizados)
- [Bot Telegram / Discord](#bot-telegram--discord)
- [Configuração](#configuração)
- [Comandos CLI](#comandos-cli)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Contribuir](#contribuir)
- [Licença](#licença)

---

## Por que oh-my-gemini-cli?

O Gemini CLI é poderoso: janela de contexto de 1M tokens, grounding com Google Search e suporte MCP.  
Mas o trabalho em grande escala ainda precisa de estrutura.

OmG adiciona:

- **Orquestração multiagente**: Criar múltiplos agentes em paralelo e coordená-los por tipo de tarefa
- **Engenharia de contexto**: Otimização de prompt cache para reduzir latência e custo
- **Painel ASCII em tempo real**: Monitorar todos os agentes em uma rica interface de terminal
- **Estratégia dual de modelos**: Gemini Pro (planejamento) + Gemini Flash (execução)
- **Suporte a LLM externos**: Conectar Claude, GPT e outros modelos via OAuth/API
- **Controle remoto**: Monitorar e controlar sessões através de bots Telegram/Discord

OmG é um complemento, não um fork. Usa apenas os pontos de extensão nativos do Gemini CLI: MCP, comandos personalizados e `GEMINI.md`.

---

## Início rápido

### Requisitos

- macOS, Linux ou Windows (WSL2 recomendado)
- Node.js >= 20
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) instalado
- Autenticação Gemini configurada (login Google, API key ou Vertex AI)

### Instalação

```bash
# Recomendado: funciona mesmo quando o pacote do registro npm não está disponível
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# Opcional: se o pacote do registro npm está disponível no seu ambiente
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> Nota: se `npm install -g oh-my-gemini-cli` falhar com `404 Not Found`, use o comando de instalação do GitHub acima.

### Lista de verificação para publicação no npm

- Confirmar que a página do pacote npm e a tag dist `latest` estão disponíveis
- Verificar que `npm install -g oh-my-gemini-cli` funciona em um ambiente limpo
- Alterar o comando de instalação padrão na documentação de npm registry para GitHub
- Manter a instalação do GitHub como fallback na seção de solução de problemas

### Autoinstalação para LLM

Cole isto em qualquer agente de codificação com IA (Cursor, Claude Code, Gemini CLI, etc.):

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### Primeira sessão

```bash
# Lançamento básico (Gemini CLI + painel)
omg

# Modo equipe multiagente
omg team "Implement OAuth authentication"

# Trabalhar com um agente específico
omg --agent architect "Analyze this codebase architecture"
```

---

## Conceito central: Engenharia de contexto

> **"Cache Rules Everything Around Me"**
> — Na era dos agentes, o cache ainda domina.

A filosofia central do oh-my-gemini-cli é a **engenharia de contexto**.  
Inspirado nas [lições de prompt caching do Claude Code](https://x.com/trq212/status/2024574133011673516), adaptado ao Gemini CLI.

### O que é prompt caching?

Em fluxos de trabalho de agentes de longa duração, o **prompt caching** reutiliza cálculos anteriores para reduzir drasticamente a latência e o custo.  
O cache é baseado em **correspondência de prefixo**.

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

### Cinco princípios fundamentais

#### 1. Estabilidade do prefixo

Qualquer alteração no prefixo invalida o cache subsequente.  
OmG coloca o conteúdo estático primeiro e o conteúdo dinâmico por último para maximizar os acertos de cache.

#### 2. Invariância do conjunto de ferramentas

Adicionar ou remover ferramentas quebra o cache. OmG evita isso através de:
- Uso de ferramentas de transição de estado para o modo plan em vez de alterar listas de ferramentas
- Uso de stubs MCP de carregamento preguiçoso em vez de mutar conjuntos completos de ferramentas durante a sessão

#### 3. Subagentes em vez de troca de modelo

O cache de prompt é específico do modelo.  
Em vez de trocar o modelo em uma thread, OmG usa subagentes com caches de modelo dedicados.

#### 4. Compactação segura para cache

Quando o contexto deve ser compactado, OmG preserva o prefixo de cache pai através de bifurcação segura para cache.

#### 5. Lembretes do sistema para atualizações

Em vez de modificar diretamente o conteúdo do prompt do sistema, OmG adiciona sinais de atualização no fluxo de mensagens.

### Monitoramento de cache

OmG trata a taxa de acertos de cache como tempo de atividade.

```bash
omg status --cache
```

---

## Sistema multiagente

OmG cria múltiplos agentes em paralelo com base no tipo de tarefa e coordena a execução.

### Arquitetura

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

### Tipos de agentes

| Agent | Model | Role |
|------|------|------|
| **Architect** | Gemini Pro | Análise de arquitetura, decisões de design, mapeamento de dependências |
| **Planner** | Gemini Pro | Decomposição de tarefas, planejamento de execução, priorização |
| **Executor** | Gemini Flash | Geração de código, edição de arquivos, refatoração (paralelo N) |
| **Reviewer** | Gemini Pro | Revisão de código, verificações de qualidade, verificações de segurança |
| **Debugger** | Gemini Pro | Análise de erros, depuração, correção de testes falhos |
| **Researcher** | Gemini Pro | Pesquisa web, análise de documentação, comparação de bibliotecas |
| **Quick** | Gemini Flash | Tarefas pequenas: correção de erros de digitação, formatação, alterações mínimas |

### Ciclo de vida

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### Exemplo de pipeline

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## Painel ASCII

Painel de terminal em tempo real construído com Ink (React para CLI).

### Prévia do painel

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

### Atalhos

| Key | Action |
|----|------|
| `q` / `Ctrl+C` | Sair |
| `p` | Pausar todos os agentes |
| `r` | Retomar |
| `d` | Mostrar fluxo de detalhe do agente selecionado |
| `t` | Alternar sincronização Telegram/Discord |
| `Tab` | Mover foco entre agentes |
| `Enter` | Abrir painel de detalhe do agente focado |
| `1`-`9` | Focar agente por número |

---

## Orquestração de modelos

### Estratégia dual de modelos

OmG usa por padrão **Pro para planejamento, Flash para execução**.

### Integração com LLM externos

```bash
# Claude via OAuth
omg config set external.claude.oauth true
omg auth claude

# OpenAI via API key
omg config set external.openai.api_key "sk-..."
```

---

## Catálogo de agentes

Usar dentro do Gemini CLI com `/prompts:name`.

| Agent | Command | Description |
|------|------|------|
| Architect | `/prompts:architect` | Análise de arquitetura, decisões de design, grafo de dependências |
| Planner | `/prompts:planner` | Decomposição de tarefas, plano de execução, marcos |
| Executor | `/prompts:executor` | Geração e edição de código, refatoração |
| Reviewer | `/prompts:reviewer` | Revisão: segurança/performance/qualidade |
| Debugger | `/prompts:debugger` | Análise de erros, interpretação de stack trace, correções |
| Researcher | `/prompts:researcher` | Pesquisa web, análise de documentação, comparação de bibliotecas |
| Quick | `/prompts:quick` | Correção de erros de digitação, formatação, alterações mínimas |

---

## Catálogo de habilidades

Usar dentro do Gemini CLI com `$skill-name`.

| Skill | Trigger | Description |
|------|------|------|
| plan | `$plan` | Planejamento estratégico baseado em Pro |
| execute | `$execute` | Implementação rápida baseada em Flash |
| team | `$team` | Orquestração de equipe multiagente |
| research | `$research` | Pesquisa paralela e análise de documentação |
| context-optimize | `$context-optimize` | Otimização de janela de contexto |

---

## Comandos personalizados

Suporta comandos personalizados em TOML.

**Localizações**
- Global: `~/.gemini/commands/*.toml`
- Projeto: `.gemini/commands/*.toml`

---

## Bot Telegram / Discord

Monitorar e controlar sessões OmG remotamente.

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## Configuração

### Localizações de arquivos

- Global: `~/.gemini/omg-settings.json`
- Projeto: `.gemini/omg-settings.json` (tem prioridade)

### Exemplo

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

## Comandos CLI

```bash
omg                         # Lançar Gemini CLI + painel
omg setup                   # Instalar prompts/skills/commands/MCP/GEMINI.md
omg doctor                  # Executar diagnósticos
omg update                  # Atualizar para a última versão
omg team <description>      # Modo equipe multiagente
omg team status             # Status da equipe
omg team shutdown           # Parar equipe
omg status                  # Status de agente/cache
omg status --cache          # Detalhes de acertos de cache
omg status --agents --json  # Status de agentes em JSON
omg status --tasks --json   # Pipeline de tarefas em JSON
omg status --context --json # Uso de contexto em JSON
omg config set <key> <val>  # Definir configuração
omg config get <key>        # Obter configuração
omg bot telegram start      # Iniciar bot Telegram
omg bot discord start       # Iniciar bot Discord
omg help                    # Mostrar ajuda
```

### Flags de tempo de execução

```bash
--agent <type>     # agente específico (architect, executor, ...)
--workers <N>      # trabalhadores da equipe (padrão: 4)
--model <model>    # sobrescrita de modelo
--no-dashboard     # desativar painel
--verbose          # logs verbosos
--dry-run          # apenas planejar, sem execução
```

### Campos JSON de status

`omg status --json` retorna:

- `agents`: ativos/total e lista de agentes
- `tasks`: contadores done/running/queued/failed e lista de tarefas
- `cache`: `hit_rate`, `hits`, `misses` e taxa alvo
- `cache_history`: snapshots recentes de cache
- `context`: `used`, `limit`, `percentage` e limiar de compactação

---

## Estrutura do projeto

```
oh-my-gemini-cli/
├── bin/omg.js                        # Ponto de entrada CLI
├── src/
│   ├── cli/                          # Comandos CLI
│   ├── agents/                       # Sistema multiagente
│   ├── dashboard/                    # Painel TUI ASCII
│   ├── context/                      # Motor de engenharia de contexto
│   ├── orchestrator/                 # Orquestração de modelos
│   ├── mcp/                          # Servidores MCP
│   ├── bot/                          # Bots Telegram/Discord
│   └── shared/                       # Utilitários compartilhados
├── prompts/                          # Prompts de agentes
├── skills/                           # Habilidades de fluxo de trabalho
├── commands/                         # Comandos personalizados (TOML)
├── templates/                        # Modelos GEMINI.md
├── docs/
│   ├── README_ko.md                  # Documentação em coreano
│   ├── history.md                    # Changelog (EN)
│   ├── history_ko.md                 # Changelog (KO)
│   └── guide/
│       ├── installation.md           # Guia de instalação
│       └── context-engineering.md    # Guia de engenharia de contexto
├── package.json
├── tsconfig.json
├── README.md                         # Documentação em inglês (este arquivo)
└── LICENSE
```

---

## O que `omg setup` faz

| Step | Description |
|------|------|
| 1 | Criar diretório de execução `.omg/` (estado, planos, logs) |
| 2 | Instalar prompts em `~/.gemini/prompts/` ou `.gemini/prompts/` |
| 3 | Instalar habilidades de fluxo de trabalho |
| 4 | Instalar comandos personalizados em `~/.gemini/commands/` |
| 5 | Registrar servidores MCP em `settings.json` (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | Gerar `GEMINI.md` do projeto |
| 7 | Gerar `omg-settings.json` padrão |

---

## Stack tecnológico

- **Runtime**: Node.js >= 20
- **Linguagem**: TypeScript
- **TUI**: Ink 5 (React para CLI)
- **MCP**: `@modelcontextprotocol/sdk`
- **Telegram**: `telegraf`
- **Discord**: `discord.js`
- **Build**: esbuild
- **Test**: Vitest

---

## Inspiração

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Agente de terminal de IA de código aberto do Google
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Orquestração multiagente centrada em equipe para Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Harness Codex CLI
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - Harness OpenCode
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - Princípios de engenharia de contexto

---

## Contribuir

Contribuições são bem-vindas.

- Relatórios de bugs e propostas de funcionalidades
- Novos prompts de agentes
- Novas habilidades e comandos personalizados
- Melhorias de documentação
- Melhorias de bots Telegram/Discord

## Licença

[MIT](../LICENSE)

## Contato

📧 kissdesty@gmail.com

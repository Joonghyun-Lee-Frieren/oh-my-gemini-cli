# oh-my-gemini-cli (OmG)

<p align="center">
  <strong>Arnés multiagente para Gemini CLI impulsado por ingeniería de contexto</strong>
</p>

<h3 align="center">
  <em>Gemini piensa. OmG orquesta.</em>
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
  <a href="../README.md">English</a> | <a href="./README_ko.md">한국어</a> | <a href="./README_ja.md">日本語</a> | <a href="./README_zh.md">中文</a> | <strong>Español</strong> | <a href="./README_pt.md">Português</a> | <a href="./README_fr.md">Français</a> | <a href="./README_nl.md">Nederlands</a> | <a href="./README_pl.md">Polski</a> | <a href="./README_uk.md">Українська</a> | <a href="./README_ru.md">Русский</a> | <a href="./README_de.md">Deutsch</a> | <a href="./history.md">Changelog</a>
</p>



> "Claude Code's core competitiveness isn't the Opus or Sonnet engine. It's Claude Code itself. Surprisingly, Gemini works well too when attached to Claude Code."
>
> — **Jeongkyu Shin (CEO of Lablup Inc.)**, *from a YouTube Channel interview*

*Este proyecto surgió de esta reflexión: "¿Y si llevamos ese arnés a Gemini CLI?"*



> Extiende **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** de una herramienta de sesión única a un
> **sistema de orquestación multiagente impulsado por ingeniería de contexto**.




## Tabla de contenidos

- [¿Por qué oh-my-gemini-cli?](#por-qué-oh-my-gemini-cli)
- [Inicio rápido](#inicio-rápido)
- [Concepto central: Ingeniería de contexto](#concepto-central-ingeniería-de-contexto)
- [Sistema multiagente](#sistema-multiagente)
- [Panel ASCII](#panel-ascii)
- [Orquestación de modelos](#orquestación-de-modelos)
- [Catálogo de agentes](#catálogo-de-agentes)
- [Catálogo de habilidades](#catálogo-de-habilidades)
- [Comandos personalizados](#comandos-personalizados)
- [Bot de Telegram / Discord](#bot-de-telegram--discord)
- [Configuración](#configuración)
- [Comandos CLI](#comandos-cli)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## ¿Por qué oh-my-gemini-cli?

Gemini CLI es potente: ventana de contexto de 1M tokens, grounding con Google Search y soporte MCP.  
Pero el trabajo a gran escala sigue necesitando estructura.

OmG añade:

- **Orquestación multiagente**: Crear múltiples agentes en paralelo y coordinarlos por tipo de tarea
- **Ingeniería de contexto**: Optimización de prompt cache para reducir latencia y coste
- **Panel ASCII en tiempo real**: Supervisar todos los agentes en una rica interfaz de terminal
- **Estrategia dual de modelos**: Gemini Pro (planificación) + Gemini Flash (ejecución)
- **Soporte para LLM externos**: Conectar Claude, GPT y otros modelos vía OAuth/API
- **Control remoto**: Supervisar y controlar sesiones mediante bots de Telegram/Discord

OmG es un complemento, no un fork. Utiliza solo los puntos de extensión nativos de Gemini CLI: MCP, comandos personalizados y `GEMINI.md`.

---

## Inicio rápido

### Requisitos

- macOS, Linux o Windows (WSL2 recomendado)
- Node.js >= 20
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) instalado
- Autenticación de Gemini configurada (inicio de sesión de Google, API key o Vertex AI)

### Instalación

```bash
# Recomendado: funciona incluso cuando el paquete del registro npm no está disponible
npm install -g github:Joonghyun-Lee-Frieren/oh-my-gemini-cli#main

# Opcional: si el paquete del registro npm está disponible en tu entorno
# npm install -g oh-my-gemini-cli

omg setup
omg doctor
```

> Nota: si `npm install -g oh-my-gemini-cli` falla con `404 Not Found`, usa el comando de instalación desde GitHub anterior.

### Lista de verificación para publicación en npm

- Confirmar que la página del paquete npm y la etiqueta dist `latest` están disponibles
- Verificar que `npm install -g oh-my-gemini-cli` funciona en un entorno limpio
- Cambiar el comando de instalación por defecto en la documentación de npm registry a GitHub
- Mantener la instalación desde GitHub como respaldo en la sección de solución de problemas

### Autoinstalación para LLM

Pega esto en cualquier agente de codificación con IA (Cursor, Claude Code, Gemini CLI, etc.):

```
Install and configure oh-my-gemini-cli:
https://raw.githubusercontent.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli/main/docs/guide/installation.md
```

### Primera sesión

```bash
# Lanzamiento básico (Gemini CLI + panel)
omg

# Modo equipo multiagente
omg team "Implement OAuth authentication"

# Trabajar con un agente específico
omg --agent architect "Analyze this codebase architecture"
```

---

## Concepto central: Ingeniería de contexto

> **"Cache Rules Everything Around Me"**
> — En la era de los agentes, la caché sigue dominando.

La filosofía central de oh-my-gemini-cli es la **ingeniería de contexto**.  
Inspirado en las [lecciones de prompt caching de Claude Code](https://x.com/trq212/status/2024574133011673516), adaptado a Gemini CLI.

### ¿Qué es el prompt caching?

En flujos de trabajo de agentes de larga duración, el **prompt caching** reutiliza cálculos previos para reducir drásticamente la latencia y el coste.  
El almacenamiento en caché se basa en **coincidencia de prefijos**.

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

### Cinco principios fundamentales

#### 1. Estabilidad del prefijo

Cualquier cambio en el prefijo invalida la caché subsiguiente.  
OmG coloca el contenido estático primero y el contenido dinámico al final para maximizar los aciertos de caché.

#### 2. Invariancia del conjunto de herramientas

Añadir o eliminar herramientas rompe la caché. OmG lo evita mediante:
- Uso de herramientas de transición de estado para el modo plan en lugar de cambiar listas de herramientas
- Uso de stubs MCP de carga diferida en lugar de mutar conjuntos completos de herramientas durante la sesión

#### 3. Subagentes en lugar de cambio de modelo

La caché de prompt es específica del modelo.  
En lugar de cambiar el modelo en un hilo, OmG usa subagentes con cachés de modelo dedicados.

#### 4. Compactación segura para caché

Cuando el contexto debe compactarse, OmG preserva el prefijo de caché padre mediante bifurcación segura para caché.

#### 5. Recordatorios del sistema para actualizaciones

En lugar de modificar directamente el contenido del prompt del sistema, OmG añade señales de actualización en el flujo de mensajes.

### Monitorización de caché

OmG trata la tasa de aciertos de caché como el tiempo de actividad.

```bash
omg status --cache
```

---

## Sistema multiagente

OmG crea múltiples agentes en paralelo según el tipo de tarea y luego coordina la ejecución.

### Arquitectura

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
| **Architect** | Gemini Pro | Análisis de arquitectura, decisiones de diseño, mapeo de dependencias |
| **Planner** | Gemini Pro | Descomposición de tareas, planificación de ejecución, priorización |
| **Executor** | Gemini Flash | Generación de código, edición de archivos, refactorización (paralelo N) |
| **Reviewer** | Gemini Pro | Revisión de código, comprobaciones de calidad, comprobaciones de seguridad |
| **Debugger** | Gemini Pro | Análisis de errores, depuración, corrección de tests fallidos |
| **Researcher** | Gemini Pro | Investigación web, análisis de documentación, comparación de bibliotecas |
| **Quick** | Gemini Flash | Tareas pequeñas: corrección de erratas, formato, cambios mínimos |

### Ciclo de vida

```
idle ──▶ assigned ──▶ running ──▶ completed
                         │            │
                         │            └──▶ (return to agent pool)
                         │
                         └──▶ failed ──▶ retry (max 3)
                                           └──▶ escalate
```

### Ejemplo de pipeline

```bash
omg team "Implement OAuth authentication"
omg team --workers 4 "Refactor entire API layer"
omg --agent executor "Convert this function to TypeScript"
omg team status
omg team shutdown
```

---

## Panel ASCII

Panel de terminal en tiempo real construido con Ink (React para CLI).

### Vista previa del panel

```
+----------------------------------------------------------------------+
| OmG  oh-my-gemini-cli   TIME 03:42   PARTY [####--] 4/6              |
+--------------------------------+-------------------------------------+
| PARTY MEMBERS                  | QUEST LOG                           |
| Active: 4 / Total: 6            | 2/7 quests cleared                  |
| Planner   [gemini-pro]   ATK   | [DONE ] analyze-auth   -> Plan      |
| Architect [gemini-pro]   ATK   | [RUN  ] impl-oauth    -> Exec#1     |
| Exec#1    [gemini-flash] ATK   | [RUN  ] impl-token    -> Exec#2     |
| Reviewer  [gemini-pro]   IDLE  | [WAIT ] code-review   -> Review     |
+--------------------------------+-------------------------------------+
| CACHE [#####-] 94% | TOKENS 12.4k/1M | COST -$0.03                   |
+----------------------------------------------------------------------+
```

### Atajos

| Key | Action |
|----|------|
| `q` / `Ctrl+C` | Salir |
| `p` | Pausar todos los agentes |
| `r` | Reanudar |
| `d` | Mostrar flujo de detalle del agente seleccionado |
| `t` | Alternar sincronización Telegram/Discord |
| `Tab` | Mover el foco entre agentes |
| `Enter` | Abrir panel de detalle del agente enfocado |
| `1`-`9` | Enfocar agente por número |

---

## Orquestación de modelos

### Estrategia dual de modelos

OmG utiliza por defecto **Pro para planificación, Flash para ejecución**.

### Integración con LLM externos

```bash
# Claude vía OAuth
omg config set external.claude.oauth true
omg auth claude

# OpenAI vía API key
omg config set external.openai.api_key "sk-..."
```

---

## Catálogo de agentes

Usar dentro de Gemini CLI con `/prompts:name`.

| Agent | Command | Description |
|------|------|------|
| Architect | `/prompts:architect` | Análisis de arquitectura, decisiones de diseño, grafo de dependencias |
| Planner | `/prompts:planner` | Descomposición de tareas, plan de ejecución, hitos |
| Executor | `/prompts:executor` | Generación y edición de código, refactorización |
| Reviewer | `/prompts:reviewer` | Revisión: seguridad/rendimiento/calidad |
| Debugger | `/prompts:debugger` | Análisis de errores, interpretación de stack trace, correcciones |
| Researcher | `/prompts:researcher` | Búsqueda web, análisis de documentación, comparación de bibliotecas |
| Quick | `/prompts:quick` | Corrección de erratas, formato, cambios mínimos |

---

## Catálogo de habilidades

Usar dentro de Gemini CLI con `$skill-name`.

| Skill | Trigger | Description |
|------|------|------|
| plan | `$plan` | Planificación estratégica basada en Pro |
| execute | `$execute` | Implementación rápida basada en Flash |
| team | `$team` | Orquestación de equipo multiagente |
| research | `$research` | Investigación paralela y análisis de documentación |
| context-optimize | `$context-optimize` | Optimización de ventana de contexto |

---

## Comandos personalizados

Soporta comandos personalizados en TOML.

**Ubicaciones**
- Global: `~/.gemini/commands/*.toml`
- Proyecto: `.gemini/commands/*.toml`

---

## Bot de Telegram / Discord

Supervisar y controlar sesiones de OmG de forma remota.

```bash
omg config set bot.telegram.token "YOUR_BOT_TOKEN"
omg bot telegram start

omg config set bot.discord.token "YOUR_BOT_TOKEN"
omg bot discord start
```

---

## Configuración

### Ubicaciones de archivos

- Global: `~/.gemini/omg-settings.json`
- Proyecto: `.gemini/omg-settings.json` (tiene prioridad)

### Ejemplo

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
omg                         # Lanzar Gemini CLI + panel
omg setup                   # Instalar prompts/skills/commands/MCP/GEMINI.md
omg doctor                  # Ejecutar diagnósticos
omg update                  # Actualizar a la última versión
omg team <description>      # Modo equipo multiagente
omg team status             # Estado del equipo
omg team shutdown           # Detener equipo
omg status                  # Estado de agente/caché
omg status --cache          # Detalles de aciertos de caché
omg status --agents --json  # Estado de agentes en JSON
omg status --tasks --json   # Pipeline de tareas en JSON
omg status --context --json # Uso de contexto en JSON
omg config set <key> <val>  # Establecer configuración
omg config get <key>        # Obtener configuración
omg bot telegram start      # Iniciar bot de Telegram
omg bot discord start       # Iniciar bot de Discord
omg help                    # Mostrar ayuda
```

### Flags de tiempo de ejecución

```bash
--agent <type>     # agente específico (architect, executor, ...)
--workers <N>      # trabajadores del equipo (por defecto: 4)
--model <model>    # anulación de modelo
--no-dashboard     # desactivar panel
--verbose          # registros detallados
--dry-run          # solo planificar, sin ejecución
```

### Campos JSON de estado

`omg status --json` devuelve:

- `agents`: activos/total y lista de agentes
- `tasks`: contadores de done/running/queued/failed y lista de tareas
- `cache`: `hit_rate`, `hits`, `misses` y tasa objetivo
- `cache_history`: instantáneas recientes de caché
- `context`: `used`, `limit`, `percentage` y umbral de compactación

---

## Estructura del proyecto

```
oh-my-gemini-cli/
├── bin/omg.js                        # Punto de entrada CLI
├── src/
│   ├── cli/                          # Comandos CLI
│   ├── agents/                       # Sistema multiagente
│   ├── dashboard/                    # Panel TUI ASCII
│   ├── context/                      # Motor de ingeniería de contexto
│   ├── orchestrator/                 # Orquestación de modelos
│   ├── mcp/                          # Servidores MCP
│   ├── bot/                          # Bots de Telegram/Discord
│   └── shared/                       # Utilidades compartidas
├── prompts/                          # Prompts de agentes
├── skills/                           # Habilidades de flujo de trabajo
├── commands/                         # Comandos personalizados (TOML)
├── templates/                        # Plantillas GEMINI.md
├── docs/
│   ├── README_ko.md                  # Documentación en coreano
│   ├── history.md                    # Changelog (EN)
│   ├── history_ko.md                 # Changelog (KO)
│   └── guide/
│       ├── installation.md           # Guía de instalación
│       └── context-engineering.md    # Guía de ingeniería de contexto
├── package.json
├── tsconfig.json
├── README.md                         # Documentación en inglés (este archivo)
└── LICENSE
```

---

## Qué hace `omg setup`

| Step | Description |
|------|------|
| 1 | Crear directorio de ejecución `.omg/` (estado, planes, logs) |
| 2 | Instalar prompts en `~/.gemini/prompts/` o `.gemini/prompts/` |
| 3 | Instalar habilidades de flujo de trabajo |
| 4 | Instalar comandos personalizados en `~/.gemini/commands/` |
| 5 | Registrar servidores MCP en `settings.json` (`omg_state`, `omg_memory`, `omg_context`, `omg_orchestrator`) |
| 6 | Generar `GEMINI.md` del proyecto |
| 7 | Generar `omg-settings.json` por defecto |

---

## Stack tecnológico

- **Runtime**: Node.js >= 20
- **Lenguaje**: TypeScript
- **TUI**: Ink 5 (React para CLI)
- **MCP**: `@modelcontextprotocol/sdk`
- **Telegram**: `telegraf`
- **Discord**: `discord.js`
- **Build**: esbuild
- **Test**: Vitest

---

## Inspiración

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Agente de terminal de IA de código abierto de Google
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) - Orquestación multiagente centrada en equipo para Claude Code
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) - Arnés de Codex CLI
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - Arnés de OpenCode
- [Claude Code Prompt Caching](https://x.com/trq212/status/2024574133011673516) - Principios de ingeniería de contexto

---

## Contribuir

Las contribuciones son bienvenidas.

- Informes de errores y propuestas de funciones
- Nuevos prompts de agentes
- Nuevas habilidades y comandos personalizados
- Mejoras de documentación
- Mejoras de bots de Telegram/Discord

## Licencia

[MIT](../LICENSE)

## Contacto

📧 kissdesty@gmail.com

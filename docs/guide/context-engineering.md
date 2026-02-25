# Context Engineering Guide for OmG

> "Cache rules everything around me."
>
> For long-running agent workflows, context quality and cache stability decide speed, cost, and reliability.

## What Context Engineering Means

Context engineering is the practice of designing prompt/context structure so the model sees the right information in the right order, with minimal churn across turns.

For OmG, this is not just "write a better prompt."  
It is an operating model that controls:

- how stable prefixes are preserved
- how dynamic data is appended safely
- how stage handoffs are summarized
- how verification evidence is retained without bloating context

## Why It Matters

Without context engineering, long sessions degrade quickly:

- Cache hit rates drop after small prefix changes.
- Latency grows because large prefixes are recomputed.
- Cost rises due to repeated full-token processing.
- Quality drifts when scope and acceptance criteria are no longer explicit.

## OmG Context Layers

| Layer | Typical content | Change frequency | Cache expectation |
| --- | --- | --- | --- |
| 1. System / Runtime | platform constraints, base behavior | very low | very high |
| 2. Project Standard | repo conventions, architecture rules | low | high |
| 3. Shared Project Context | `GEMINI.md`, stable workflow rules | low-medium | high |
| 4. Stage Context | current plan/PRD/exec/verify state | medium | medium |
| 5. Turn Dynamics | latest request, reminders, new evidence | high | low / append-only |

## Stage Pipeline and Context Discipline

OmG uses a stage lifecycle:

1. `team-plan`
2. `team-prd`
3. `team-exec`
4. `team-verify`
5. `team-fix`

Context objective by stage:

| Stage | Main context focus | Keep | Avoid |
| --- | --- | --- | --- |
| `team-plan` | decomposition and dependency graph | scope boundaries | implementation noise |
| `team-prd` | acceptance criteria and non-goals | measurable done criteria | vague "looks good" goals |
| `team-exec` | scoped implementation slice | minimal diffs and rationale | broad re-planning |
| `team-verify` | evidence-by-criterion | pass/fail matrix | unstructured opinions |
| `team-fix` | targeted remediation | issue -> root cause -> patch | unrelated refactors |

## Six High-Impact Patterns

### 1) Prefix Stability

Put stable instructions first. Put changing data last.

Bad:

```text
[dynamic timestamp][system instructions][project context]
```

Good:

```text
[system instructions][project context][stage context][dynamic reminder]
```

### 2) Tool Invariance

Do not frequently change the exposed tool set in active sessions.  
When possible, keep the visible tool schema stable and vary usage, not definitions.

### 3) Model Isolation via Sub-Agents

Do not frequently switch models inside one uninterrupted chain when cache reuse is critical.  
Use role-based sub-agents (`planner`, `executor`, `reviewer`, etc.) so each role keeps its own stable context stream.

### 4) Cache-Safe Compaction

When context grows too large, summarize using a controlled fork pattern:

1. preserve stable prefix
2. compact volatile history into structured summary
3. continue with summary + latest evidence

### 5) System Reminder Injection

Do not rewrite the stable system prompt for frequently changing values (time, transient state, etc.).  
Inject dynamic values in late-turn reminder blocks instead.

### 6) Mode-Aware Operation

OmG modes affect context pressure:

| Mode | Context behavior |
| --- | --- |
| `balanced` | default stability and moderate detail |
| `speed` | shorter summaries, faster stage turnover |
| `deep` | richer rationale and stricter verification evidence |
| `autopilot` | looped stage snapshots and checkpoints |
| `ralph` | strict gate evidence before completion |
| `ultrawork` | shard-based summaries for parallel batches |

## Runtime State Files

For long workflows, keep external state snapshots:

- `.omg/state/mode.json`
- `.omg/state/workflow.md`
- `.omg/state/checkpoint.md`

These files help resume work without replaying every raw turn.

## Monitoring Commands

Use these commands to keep context healthy:

- `/omg:status` to inspect stage/mode/progress
- `/omg:cache` to audit cache stability risks
- `/omg:optimize` to reduce context bloat and churn
- `/omg:checkpoint` to save compact resume state

## Cache-Miss Triage

| Symptom | Likely cause | Action |
| --- | --- | --- |
| sudden latency increase | prefix broken by early edits | restore stable prefix order |
| repeated context restarts | dynamic data mixed into stable sections | move dynamic values to reminders |
| verification quality drift | criteria not preserved across turns | maintain explicit acceptance matrix |
| high token cost in loops | no compaction checkpoints | checkpoint + cache-safe compaction |

## Practical Checklist

Before each major turn:

- Confirm current stage (`plan/prd/exec/verify/fix`).
- Confirm active mode.
- Keep acceptance criteria visible.
- Append only new evidence; avoid rewriting stable blocks.
- End with status + next action.

## Related Docs

- [Installation Guide](./installation.md)
- [Korean Context Guide](./context-engineering_ko.md)
- [History](../history.md)

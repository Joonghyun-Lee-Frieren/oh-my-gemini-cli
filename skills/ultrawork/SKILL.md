---
name = "ultrawork"
description = "Deliver many independent tasks quickly with shard-based execution and periodic quality gates."
---

## Purpose

Use this skill for throughput-heavy work: many small or moderately independent tasks.

## Trigger

- Backlog contains many parallelizable items
- Speed matters but basic quality gates must remain
- User asks for batch execution mode

## Workflow

1. Split backlog into shards by dependency and risk.
2. Execute shards in short cycles using implementation-focused agents.
3. Run periodic review gates after each shard batch.
4. Track unresolved shard-level risks.
5. Produce a batched completion and carry-over summary.

## Output Template

```markdown
## Mode
- ultrawork

## Shard Board
| Shard | Scope | Status | Risk | Next Step |
| --- | --- | --- | --- | --- |

## Batch Validation
- ...

## Carry-over
- ...
```

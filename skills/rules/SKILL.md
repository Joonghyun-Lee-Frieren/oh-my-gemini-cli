---
name = "rules"
description = "Inject conditional rule packs (tests, migration, security, docs, perf) based on task signals."
---

## Purpose

Use this skill to activate task-specific guardrails without bloating the default prompt.

## Trigger

- Task touches sensitive surfaces (auth, migrations, contracts)
- Change type requires mandatory checks (tests/docs/perf)
- Team wants explicit policy activation before coding

## Workflow

1. Detect triggers from request text and file-scope hints.
2. Activate matching rule packs only.
3. Explain what each active rule enforces.
4. Recommend next command with the active rule set.

## Rule Packs

- `tests-required`
- `migration-safety`
- `security-review`
- `docs-sync`
- `perf-watch`

## Output Template

```markdown
## Trigger Detection
| Trigger | Matched | Evidence |
| --- | --- | --- |

## Active Rules
1. ...

## Enforced Behavior
- ...

## Next Command
- ...
```

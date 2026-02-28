---
name = "hooks"
description = "Operate OmG's extension-native hook pipeline with deterministic triggers, safety gates, and efficiency budgets."
---

## Purpose

Use this skill to keep long sessions stable by turning recurrent workflow signals into explicit hook actions.

## Trigger

- User asks for hook setup, hook tuning, or hook debugging
- Session has repeated blockers, context drift, or verify-loop churn
- Team needs safer autonomous operation in delegated/worker turns

## Workflow

1. Identify active native events and needed derived signals.
2. Assign each trigger to one execution lane (`P0-safety`, `P1-quality`, `P2-optimization`).
3. Enforce deterministic order, idempotency keys, debounce, and timeout budgets.
4. Enforce team-safety policy for worker/delegated sessions.
5. Recommend validation (`/omg:hooks-validate`) and dry-run (`/omg:hooks-test`) before high-autonomy loops.

## Guardrails

- Do not enable side-effect hooks in worker sessions unless user explicitly requests.
- Keep non-critical hooks fail-open to avoid deadlocks.
- Escalate when hook failures are safety-critical or repeatedly blocking progress.

## Output Template

```markdown
## Hook Plan
- profile:
- enabled events:
- derived signals:

## Lane Assignment
| Lane | Triggers | Purpose | Budget |
| --- | --- | --- | --- |

## Safety Policy
- ...

## Next Commands
1. /omg:hooks-validate
2. /omg:hooks-test
```

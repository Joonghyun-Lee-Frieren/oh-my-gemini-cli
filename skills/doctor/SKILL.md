---
name = "doctor"
description = "Run OmG readiness diagnostics for commands, skills, state files, and team/hook safety posture."
---

## Purpose

Use this skill to diagnose setup or workflow drift before starting autonomous or multi-agent execution.

## Trigger

- User reports command/skill not working as expected
- Team wants a preflight health check before autonomous loops
- Session has repeated blockers with unclear root cause

## Workflow

1. Select diagnostic scope (`status`, `team`, or `hooks`).
2. Check extension assets and command/skill readiness.
3. Check state integrity under `.omg/state/` when available.
4. Classify findings (`critical`, `major`, `minor`) and list actions.
5. Recommend a safe next command to continue.

## Output Template

```markdown
## Doctor
- scope:
- overall:

## Findings
| Severity | Area | Finding | Fix |
| --- | --- | --- | --- |

## Next Command
- ...
```

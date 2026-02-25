---
name = "ralph"
description = "Run strict quality-gated orchestration where every completion claim must pass verification gates."
---

## Purpose

Use this skill for high-confidence delivery where quality gates are mandatory.

## Trigger

- User prioritizes correctness/reliability over raw speed
- Task has high regression risk
- Release-readiness decision is required

## Workflow

1. Execute full pipeline: `team-plan -> team-prd -> team-exec -> team-verify`.
2. If verification fails, run `team-fix` and return to `team-verify`.
3. Repeat until acceptance criteria pass or blockers are explicit.
4. Summarize gate evidence and final ship decision.

## Rules

- Never skip `team-verify`.
- No "done" status without criterion-level pass evidence.
- Separate blockers from unresolved nice-to-haves.

## Output Template

```markdown
## Mode
- ralph

## Gate Board
| Gate | Status | Evidence |
| --- | --- | --- |

## Risks
- ...

## Ship Decision
- ready / not ready
```

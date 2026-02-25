---
name = "autopilot"
description = "Run autonomous multi-stage execution loops until acceptance criteria pass or blockers are reached."
---

## Purpose

Use this skill to keep momentum on complex tasks without manual stage prompting each turn.

## Trigger

- Work spans planning, execution, and verification
- User wants autonomous iterative progress
- Session can benefit from checkpointed loops

## Workflow

1. Start with `team-plan` and `team-prd`.
2. Run `team-exec -> team-verify -> team-fix` in loops.
3. Stop when all acceptance criteria pass, blockers appear, or max cycles are reached.
4. Update checkpoint summary after each cycle.
5. End with clear completion status and next action.

## Guardrails

- Default max cycles: 5 unless user overrides.
- Do not hide blockers or failed verification.
- Use `$cancel` or `/omg:stop` for graceful stop.

## Output Template

```markdown
## Mode
- autopilot

## Cycle Board
| Cycle | Result | Remaining TODO | Blockers |
| --- | --- | --- | --- |

## Completion
- ...

## Next Action
- ...
```

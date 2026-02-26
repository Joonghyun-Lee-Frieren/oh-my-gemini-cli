---
name = "loop"
description = "Enforce repeated exec-verify-fix cycles until acceptance criteria pass or blockers are explicit."
---

## Purpose

Use this skill when tasks are partially complete and must continue through strict verification loops.

## Trigger

- Remaining TODOs after an execution slice
- Verification produced unresolved findings
- Team is at risk of premature completion claims

## Workflow

1. Read acceptance criteria and current fix backlog.
2. Select the smallest next scope slice.
3. Run `team-exec -> team-verify -> team-fix`.
4. Report status as `continue`, `done`, or `blocked`.
5. Repeat until criteria pass or blockers become hard constraints.

## Guardrails

- No "done" claim with unresolved major/blocker findings.
- Default max cycles per invocation: 3 (unless user overrides).

## Output Template

```markdown
## Loop Status
- cycle:
- status:

## Evidence
| Stage | Result | Evidence |
| --- | --- | --- |

## Remaining Backlog
1. ...

## Next Command
- ...
```

---
name = "deep-init"
description = "Initialize long-session context with a deep repository map, validation hooks, and risk hotspots."
---

## Purpose

Use this skill before major work when project structure or constraints are not yet clear.

## Trigger

- New repository or unfamiliar codebase
- Large refactor/migration kickoff
- User asks for deep project analysis before editing

## Workflow

1. Scan repository structure and key entry points.
2. Identify stack, build/test commands, and config surfaces.
3. Build a responsibility/risk map for major areas.
4. Capture validation hooks and blocking unknowns.
5. Recommend the next command (`/omg:intent` or `/omg:team-plan`).

## Output Template

```markdown
## Deep Init Summary
- ...

## Project Map
| Area | Responsibility | Risk | Validation |
| --- | --- | --- | --- |

## Unknowns
- ...

## Next Command
- ...
```

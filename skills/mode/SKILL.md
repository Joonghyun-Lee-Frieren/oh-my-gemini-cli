---
name = "mode"
description = "Inspect or switch OmG operating mode/profile for speed, depth, autonomy, or strict quality gates."
---

## Purpose

Use this skill to control operating posture before or during long tasks.

## Trigger

- User asks to prioritize speed vs quality
- Team needs autonomous or strict-gate behavior
- Session requires explicit mode switch

## Supported Modes

- `balanced`
- `speed`
- `deep`
- `autopilot`
- `ralph`
- `ultrawork`

## Workflow

1. Identify requested mode or infer default (`balanced`).
2. Explain model and verification posture for that mode.
3. Persist/update mode state when filesystem tools are available.
4. Recommend next command based on selected mode.

## Output Template

```markdown
## Mode
- requested:
- applied:

## Profile
| Setting | Value |
| --- | --- |

## Next Command
- ...
```

---
name = "reasoning"
description = "Control OmG reasoning effort level to balance depth, rigor, latency, and token cost."
---

## Purpose

Use this skill to set an explicit reasoning posture before planning, execution, or verification-heavy turns.

## Trigger

- User asks for faster vs deeper reasoning
- Session needs tighter quality gates or lower latency
- Team wants predictable planning/verification effort across stages

## Supported Effort Levels

- `low`
- `medium`
- `high`
- `xhigh`

## Workflow

1. Identify requested effort or infer `medium` as default.
2. Explain impact on planning depth, verification strictness, and cost/latency.
3. Persist/update `.omg/state/reasoning.json` when filesystem tools are available.
4. Recommend a next command (`/omg:mode`, `/omg:team`, or `/omg:loop`) based on posture.

## Output Template

```markdown
## Reasoning
- requested:
- applied:

## Profile
| Dimension | Value |
| --- | --- |

## Next Command
- ...
```

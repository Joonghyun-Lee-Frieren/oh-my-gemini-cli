---
name = "reasoning"
description = "Control OmG reasoning effort level (global and per-teammate) to balance depth, rigor, latency, and token cost."
---

## Purpose

Use this skill to set an explicit reasoning posture before planning, execution, or verification-heavy turns.

## Trigger

- User asks for faster vs deeper reasoning
- Session needs tighter quality gates or lower latency
- Team wants predictable planning/verification effort across stages
- Team wants role-specific depth (for example reviewer high, executor medium)

## Supported Effort Levels

- `low`
- `medium`
- `high`
- `xhigh`

## Workflow

1. Identify requested effort or infer `medium` as default.
2. Parse optional teammate overrides (for example `reviewer=xhigh`, `executor=medium`).
3. Explain impact on planning depth, verification strictness, and cost/latency.
4. Persist/update `.omg/state/reasoning.json` when filesystem tools are available.
5. Recommend a next command (`/omg:mode`, `/omg:team`, or `/omg:loop`) based on posture.

## Output Template

```markdown
## Reasoning
- requested:
- applied:

## Profile
| Dimension | Value |
| --- | --- |

## Team Overrides
| Teammate | Effort |
| --- | --- |

## Next Command
- ...
```

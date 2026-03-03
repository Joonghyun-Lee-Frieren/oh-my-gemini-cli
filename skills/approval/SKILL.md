---
name = "approval"
description = "Set OmG approval posture (`suggest`, `auto`, `full-auto`) with explicit risk guardrails."
---

## Purpose

Use this skill to control how aggressively OmG runs autonomous actions versus asking for confirmation.

## Trigger

- User asks to reduce confirmation friction
- Autonomous mode is too conservative or too risky
- Team needs explicit approval policy before long runs

## Supported Modes

- `suggest`
- `auto`
- `full-auto`

## Workflow

1. Identify requested approval posture.
2. Explain side-effect and high-risk confirmation behavior for the selected mode.
3. Persist/update `.omg/state/approval.json` when filesystem tools are available.
4. Clarify that runtime approval flags remain host-CLI concerns.

## Output Template

```markdown
## Approval
- requested:
- applied:

## Guardrails
- ...

## Next Command
- ...
```

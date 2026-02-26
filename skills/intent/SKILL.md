---
name = "intent"
description = "Classify user intent and route work to the correct OmG stage before execution starts."
---

## Purpose

Use this skill as an intake gate to reduce command-stage mismatch.

## Trigger

- User request is ambiguous (plan vs implement vs verify)
- Team starts work without explicit stage context
- Scope and acceptance criteria look incomplete

## Workflow

1. Classify primary intent (`plan`, `prd`, `exec`, `verify`, `fix`, `research`, `lifecycle`).
2. Detect missing inputs required for that intent.
3. Flag command-intent mismatch risks.
4. Recommend exact next `/omg:*` command or `$skill`.
5. Produce a ready-to-run handoff prompt.

## Output Template

```markdown
## Intent
- primary:
- confidence:

## Missing Inputs
- ...

## Recommended Route
- next command:
- delegate:

## Handoff Prompt
- ...
```

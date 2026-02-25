---
name = "cancel"
description = "Gracefully stop active autonomous workflow, preserve progress, and produce a resume-ready handoff."
---

## Purpose

Use this skill to halt autonomous or batch modes without losing work context.

## Trigger

- User requests stop/cancel/pause
- Current loop should be interrupted safely
- Team needs checkpoint handoff

## Workflow

1. Detect active mode and current stage.
2. Summarize completed work and in-flight work.
3. Capture remaining TODOs and blockers.
4. Produce a minimal resume plan.
5. Update checkpoint state when possible.

## Output Template

```markdown
## Lifecycle
- status: stopped
- mode:
- stage:

## Progress
- completed:
- in-flight:
- open:

## Resume
1. ...
2. ...
```

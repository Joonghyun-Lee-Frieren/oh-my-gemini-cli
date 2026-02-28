---
name = "memory"
description = "Manage durable project memory with MEMORY.md index, topic files, and modular rule packs."
---

## Purpose

Use this skill to keep long-session memory concise, discoverable, and task-aware.

## Trigger

- Session is long and context drift appears
- Team decisions are scattered across chat history
- New guardrails are needed for sensitive file areas

## Workflow

1. Keep `MEMORY.md` as a compact index.
2. Store details in `.omg/memory/*.md` topic files.
3. Maintain rule packs in `.omg/rules/*.md` with frontmatter.
4. Activate only matching rules (`alwaysApply` or `globs` match).
5. Report stale entries and propose updates.

## Output Template

```markdown
## Memory Audit
- ...

## Active Rules
1. ...

## Actions
1. ...
2. ...
3. ...
```

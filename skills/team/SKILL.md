---
name = "team"
description = "Coordinate multiple OmG sub-agents to plan, implement, review, and debug a complex request."
---

## Purpose

Use this skill for complex work that benefits from role-based delegation.

## Trigger

- Task spans architecture, implementation, and verification
- Multiple milestones are required
- User requests coordinated multi-agent execution

## Workflow

1. Delegate planning to `omg-planner`.
2. Use `omg-architect` for design-sensitive decisions.
3. Execute implementation with `omg-executor`.
4. Review output with `omg-reviewer`.
5. Invoke `omg-debugger` for failures.
6. Merge results into one clear status report.

## Output Template

```markdown
## Team Plan
- ...

## Delegation Log
- planner: ...
- architect: ...
- executor: ...
- reviewer: ...

## Final Result
- ...

## Open Risks
- ...
```

## Notes

- Keep handoffs short and structured.
- Avoid duplicate file edits across agents at the same time.

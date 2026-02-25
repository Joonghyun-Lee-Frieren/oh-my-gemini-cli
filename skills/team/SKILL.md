---
name = "team"
description = "Coordinate the full OmG stage pipeline across sub-agents for complex delivery (plan -> prd -> exec -> verify -> fix)."
---

## Purpose

Use this skill for complex work that benefits from role-based delegation.

## Trigger

- Task spans architecture, implementation, and verification
- Multiple milestones are required
- User requests coordinated multi-agent execution

## Workflow

1. Run `team-plan` with `omg-planner` and `omg-architect`.
2. Run `team-prd` with `omg-product` to lock acceptance criteria.
3. Run `team-exec` with `omg-executor`.
4. Run `team-verify` with `omg-reviewer` and `omg-verifier`.
5. If verify fails, run `team-fix` with `omg-debugger` and `omg-executor`.
6. Repeat steps 3-5 until acceptance passes or blockers are explicit.
7. Merge all stage outputs into one status report.

## Output Template

```markdown
## Team Plan
- ...

## Stage Log
- team-plan: ...
- team-prd: ...
- team-exec: ...
- team-verify: ...
- team-fix: ...

## Final Result
- ...

## Open Risks
- ...
```

## Notes

- Keep handoffs short and structured.
- Avoid duplicate file edits across agents at the same time.

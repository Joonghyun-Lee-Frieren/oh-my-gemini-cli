---
name = "team"
description = "Coordinate the full OmG stage pipeline across sub-agents for complex delivery, with optional dynamic team assembly."
---

## Purpose

Use this skill for complex work that benefits from role-based delegation.

## Trigger

- Task spans architecture, implementation, and verification
- Multiple milestones are required
- User requests coordinated multi-agent execution

## Workflow

1. If roster is unclear or cross-domain work is expected, run `team-assemble`.
2. Run `team-plan` with `omg-planner` and `omg-architect`.
3. Run `team-prd` with `omg-product` to lock acceptance criteria.
4. Run `team-exec` with `omg-executor`.
5. Run `team-verify` with `omg-reviewer` and `omg-verifier`.
6. If verify fails, run `team-fix` with `omg-debugger` and `omg-executor`.
7. Repeat steps 4-6 until acceptance passes or blockers are explicit.
8. Merge all stage outputs into one status report.

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
